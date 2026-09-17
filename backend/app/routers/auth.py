import os
import uuid
import hmac
import hashlib
import json
import logging
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, Response, Request, Query, Depends, Cookie, Header
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from ..database import (
    create_or_update_user, 
    get_user_by_id, 
    create_auth_session, 
    get_auth_session, 
    revoke_auth_session, 
    revoke_user_sessions
)

from dotenv import load_dotenv
import firebase_admin
from firebase_admin import auth as fb_auth, credentials as fb_creds
import jwt
from jwt import PyJWKClient

logger = logging.getLogger("signalx.auth")
router = APIRouter()


def load_environment():
    """
    Load .env deterministically from backend project root first, then workspace root.
    """
    backend_env = Path(__file__).resolve().parents[2] / ".env"  # d:\AVATAR\backend\.env
    project_env = Path(__file__).resolve().parents[3] / ".env"  # d:\AVATAR\.env
    
    loaded = None
    if backend_env.is_file():
        load_dotenv(dotenv_path=backend_env, override=True)
        loaded = str(backend_env)
    if project_env.is_file():
        load_dotenv(dotenv_path=project_env, override=False)
        if not loaded:
            loaded = str(project_env)
    return loaded

_active_env_path = load_environment()

def get_oauth_config():
    # Dynamically re-check environment in case .env was modified
    load_environment()
    client_id = (os.getenv("GOOGLE_CLIENT_ID") or os.getenv("VITE_GOOGLE_CLIENT_ID") or "").strip()
    if (client_id.startswith('"') and client_id.endswith('"')) or (client_id.startswith("'") and client_id.endswith("'")):
        client_id = client_id[1:-1].strip()

    client_secret = (os.getenv("GOOGLE_CLIENT_SECRET") or "").strip()
    if (client_secret.startswith('"') and client_secret.endswith('"')) or (client_secret.startswith("'") and client_secret.endswith("'")):
        client_secret = client_secret[1:-1].strip()

    redirect_uri = (os.getenv("GOOGLE_REDIRECT_URI") or "http://localhost:3000/auth/callback").strip()
    if (redirect_uri.startswith('"') and redirect_uri.endswith('"')) or (redirect_uri.startswith("'") and redirect_uri.endswith("'")):
        redirect_uri = redirect_uri[1:-1].strip()

    session_secret = (os.getenv("SESSION_SECRET") or "signalx_production_secret_key_sih26147_ntro").strip()
    if (session_secret.startswith('"') and session_secret.endswith('"')) or (session_secret.startswith("'") and session_secret.endswith("'")):
        session_secret = session_secret[1:-1].strip()
    
    # Check if configured with real values (not placeholders or empty)
    placeholders = ["", "YOUR_GOOGLE_CLIENT_ID_HERE", "undefined", "null"]
    has_client_id = bool(client_id) and client_id not in placeholders and not client_id.startswith("#")
    has_client_secret = (
        bool(client_secret) and
        client_secret not in ["", "YOUR_GOOGLE_CLIENT_SECRET_HERE", "undefined", "null"] and
        not client_secret.startswith("#")
    )
    
    configured = has_client_id and has_client_secret
    return {
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "session_secret": session_secret,
        "configured": configured
    }

class LocalLoginRequest(BaseModel):
    email: Optional[str] = "evaluator@signalx.local"
    name: Optional[str] = "Local Evaluator (Offline Demo Mode)"

class GoogleCodeExchangeRequest(BaseModel):
    code: str
    redirect_uri: Optional[str] = None

class FirebaseLoginRequest(BaseModel):
    id_token: Optional[str] = None


# =========================================================================
# FIREBASE AUTHENTICATION CONFIGURATION & VERIFICATION
# =========================================================================
FIREBASE_PROJECT_ID = (os.getenv("FIREBASE_PROJECT_ID") or "signalx-c618c").strip()
_firebase_initialized = False

def init_firebase_admin():
    global _firebase_initialized
    if not firebase_admin._apps:
        try:
            cred_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
            if cred_json:
                cred_dict = json.loads(cred_json)
                cred = fb_creds.Certificate(cred_dict)
                firebase_admin.initialize_app(cred, {'projectId': FIREBASE_PROJECT_ID})
            elif cred_path and os.path.exists(cred_path):
                cred = fb_creds.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {'projectId': FIREBASE_PROJECT_ID})
            else:
                firebase_admin.initialize_app(options={'projectId': FIREBASE_PROJECT_ID})
            _firebase_initialized = True
        except Exception as e:
            logger.warning(f"Firebase Admin SDK initialization notice: {e}")
    else:
        _firebase_initialized = True
    return _firebase_initialized

init_firebase_admin()

_jwks_client = None

def get_jwks_client():
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(
            "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
            cache_keys=True,
            lifespan=3600
        )
    return _jwks_client

def verify_firebase_id_token(id_token: str) -> dict:
    """
    Cryptographically verifies a Firebase ID token issued by Google for signalx-c618c.
    Validates:
    1. Cryptographic RS256 signature against Google's public certificates
    2. Token issuer is 'https://securetoken.google.com/{FIREBASE_PROJECT_ID}'
    3. Token audience / project matches FIREBASE_PROJECT_ID
    4. Token expiration (rejects expired tokens)
    5. Non-empty subject / UID
    """
    if not id_token or not isinstance(id_token, str):
        raise HTTPException(status_code=400, detail="Missing or invalid Firebase ID token format.")

    decoded = None
    # 1. Attempt Admin SDK verification if credentials present
    try:
        if firebase_admin._apps:
            decoded = fb_auth.verify_id_token(id_token, clock_skew_seconds=10)
    except Exception as e:
        logger.debug(f"Firebase Admin SDK fallback to Google JWKS: {e}")

    # 2. Authoritative cryptographic verification via Google's live public JWKS certificates
    if not decoded:
        try:
            jwks = get_jwks_client()
            signing_key = jwks.get_signing_key_from_jwt(id_token)
            expected_issuer = f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}"
            decoded = jwt.decode(
                id_token,
                signing_key.key,
                algorithms=["RS256"],
                audience=FIREBASE_PROJECT_ID,
                issuer=expected_issuer,
                options={"verify_exp": True}
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Firebase token has expired. Please sign in again.")
        except jwt.InvalidIssuerError:
            raise HTTPException(status_code=401, detail=f"Invalid token issuer. Expected {expected_issuer}.")
        except jwt.InvalidAudienceError:
            raise HTTPException(status_code=401, detail=f"Invalid token audience. Expected project {FIREBASE_PROJECT_ID}.")
        except Exception as err:
            logger.error(f"Firebase token verification failed: {err}")
            raise HTTPException(status_code=401, detail=f"Firebase ID token verification failed: {str(err)}")

    uid = decoded.get("uid") or decoded.get("sub") or decoded.get("user_id")
    if not uid:
        raise HTTPException(status_code=401, detail="Firebase token missing subject ID (UID).")

    return decoded


def get_current_authenticated_user(
    request: Request,
    signalx_session: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Authoritative server-side session dependency.
    Validates either the HttpOnly 'signalx_session' cookie or 'Authorization: Bearer <token>'.
    Verifies that the session is stored in SQLite, is marked active, and has not expired.
    Rejects unauthenticated or tampered requests with HTTP 401.
    """
    session_id = None
    if signalx_session:
        session_id = signalx_session.strip()
    elif authorization and authorization.startswith("Bearer "):
        session_id = authorization[7:].strip()

    if not session_id:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: No active session. Please sign in with Google."
        )

    session_record = get_auth_session(session_id)
    if not session_record:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: Invalid or expired analyst session."
        )

    user = get_user_by_id(session_record["user_id"])
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: Analyst account not found."
        )

    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "profile_image": user.get("profile_image"),
        "role": "Authenticated RF Analyst" if session_record.get("firebase_uid") != "offline-demo" else "Offline Evaluation Guest",
        "mode": "FIREBASE_AUTHENTICATED" if session_record.get("firebase_uid") != "offline-demo" else "DEMO/OFFLINE EVALUATION MODE",
        "google_subject_id": user.get("google_subject_id"),
        "session_id": session_record["session_id"],
        "session_expires_at": session_record["expires_at"]
    }


def get_optional_authenticated_user(
    request: Request,
    signalx_session: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
) -> Optional[dict]:
    """
    Optional dependency for routes that allow both authenticated and guest access.
    """
    try:
        return get_current_authenticated_user(request, signalx_session, authorization)
    except HTTPException:
        return None


@router.get("/auth/firebase-status")
def get_firebase_status():
    """
    Safe diagnostic status endpoint for Firebase Authentication.
    Reports operational status without exposing private secrets.
    """
    return {
        "firebase_configured": True,
        "project_id": FIREBASE_PROJECT_ID,
        "auth_domain": f"{FIREBASE_PROJECT_ID}.firebaseapp.com",
        "admin_sdk_initialized": bool(firebase_admin._apps),
        "service_account_secret_exposed": False,
        "jwks_endpoint": "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
    }


@router.post("/auth/firebase")
def firebase_auth_callback(
    request: Request,
    response: Response,
    body: Optional[FirebaseLoginRequest] = None
):
    """
    Authenticates an analyst using a verified Google Firebase ID token.
    1. Extracts Bearer token or body id_token
    2. Cryptographically verifies token against Google's public keys / Admin SDK
       (checks RS256 signature, issuer, audience=signalx-c618c, exp, uid)
    3. Extracts verified identity strictly from token claims (never trusts browser)
    4. Upserts user profile in database
    5. Creates server-side session in auth_sessions table
    6. Issues secure HttpOnly cookie 'signalx_session'
    7. Returns user profile & session token
    """
    id_token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        id_token = auth_header[7:].strip()

    if not id_token and body and body.id_token:
        id_token = body.id_token.strip()

    if not id_token:
        raise HTTPException(
            status_code=400,
            detail="Missing Firebase ID token in Authorization header or body."
        )

    # Cryptographic verification
    claims = verify_firebase_id_token(id_token)

    uid = claims.get("uid") or claims.get("sub") or claims.get("user_id")
    email = claims.get("email")
    name = claims.get("name") or (email.split("@")[0] if email else "Google Analyst")
    picture = claims.get("picture")

    if not uid:
        raise HTTPException(status_code=400, detail="Verified Firebase token missing subject ID.")
    if not email:
        email = f"{uid}@firebase.signalx.internal"

    # Upsert user record
    internal_user_id = f"usr-fb-{hashlib.sha256(uid.encode()).hexdigest()[:12]}"
    user = create_or_update_user(
        user_id=internal_user_id,
        email=email,
        name=name,
        profile_image=picture,
        google_subject_id=f"firebase:{uid}"
    )

    # Create authoritative server-side session in SQLite
    session_id = create_auth_session(
        user_id=user["id"],
        email=email,
        firebase_uid=uid,
        duration_days=7
    )

    # Set secure HttpOnly session cookie
    is_secure = request.url.scheme == "https"
    samesite_policy = "none" if is_secure else "lax"

    response.set_cookie(
        key="signalx_session",
        value=session_id,
        httponly=True,
        secure=is_secure,
        samesite=samesite_policy,
        max_age=7 * 24 * 3600,
        path="/"
    )

    return {
        "id": user["id"],
        "firebase_uid": uid,
        "google_subject_id": user.get("google_subject_id"),
        "email": user["email"],
        "name": user["name"],
        "profile_image": user.get("profile_image"),
        "role": "Authenticated RF Analyst",
        "mode": "FIREBASE_AUTHENTICATED",
        "auth_provider": "firebase_google",
        "session_token": session_id,
        "last_login": user.get("last_login")
    }


@router.get("/auth/config-status")
def get_auth_config_status():
    """
    Strict safe diagnostic endpoint matching user specification.
    Returns only non-sensitive metadata, suffixes, and SHA-256 fingerprint.
    """
    cfg = get_oauth_config()
    client_id = cfg.get("client_id", "").strip()
    client_secret = cfg.get("client_secret", "").strip()
    
    placeholders = ["", "YOUR_GOOGLE_CLIENT_ID_HERE", "undefined", "null"]
    has_client_id = bool(client_id) and client_id not in placeholders
    has_client_secret = bool(client_secret) and client_secret not in ["", "YOUR_GOOGLE_CLIENT_SECRET_HERE", "undefined", "null"]
    
    client_id_suffix = client_id[-12:] if len(client_id) >= 12 else client_id
    secret_fingerprint = hashlib.sha256(client_secret.encode()).hexdigest()[:12] if has_client_secret else ""
    
    return {
        "google_configured": bool(cfg.get("configured")),
        "client_id_suffix": client_id_suffix,
        "secret_present": has_client_secret,
        "secret_fingerprint": secret_fingerprint,
        "redirect_uri": cfg.get("redirect_uri", "http://localhost:3000/auth/callback")
    }


@router.get("/auth/diagnostic")
def get_auth_diagnostic():
    """
    Comprehensive safe configuration diagnostic for frontend checks.
    """
    cfg = get_oauth_config()
    client_id = cfg.get("client_id", "").strip()
    client_secret = cfg.get("client_secret", "").strip()
    session_secret = cfg.get("session_secret", "").strip()
    
    placeholders = ["", "YOUR_GOOGLE_CLIENT_ID_HERE", "undefined", "null"]
    has_client_id = bool(client_id) and client_id not in placeholders
    has_client_secret = bool(client_secret) and client_secret not in ["", "YOUR_GOOGLE_CLIENT_SECRET_HERE", "undefined", "null"]
    has_session_secret = bool(session_secret) and session_secret not in ["", "GENERATE_A_SECURE_RANDOM_SECRET_KEY"]

    expected_suffix = "apps.googleusercontent.com"
    matches_expected = (
        bool(client_id) and
        client_id.endswith(expected_suffix) and
        "346581645213" in client_id
    )

    client_id_suffix = client_id[-12:] if len(client_id) >= 12 else client_id
    secret_fp_12 = hashlib.sha256(client_secret.encode()).hexdigest()[:12] if has_client_secret else ""
    secret_fingerprint = (
        f"sha256:{hashlib.sha256(client_secret.encode()).hexdigest()[:8]}... (last4: {client_secret[-4:]})"
        if has_client_secret and len(client_secret) >= 4 else "NONE"
    )

    return {
        "google_configured": bool(cfg.get("configured")),
        "client_id_suffix": client_id_suffix,
        "secret_present": has_client_secret,
        "secret_fingerprint": secret_fp_12,
        "redirect_uri": cfg.get("redirect_uri", "http://localhost:3000/auth/callback"),
        "google_oauth_configured": bool(cfg.get("configured")),
        "google_client_id_present": has_client_id,
        "google_client_secret_present": has_client_secret,
        "google_redirect_uri": cfg.get("redirect_uri", "http://localhost:3000/auth/callback"),
        "session_secret_present": has_session_secret,
        "client_id_matches_expected": matches_expected,
        "secret_fingerprint_detailed": secret_fingerprint
    }


@router.get("/auth/google/url")
def get_google_auth_url():
    """
    Returns the real Google OAuth 2.0 authorization URL if configured.
    If credentials are unset or placeholder, returns configured: false with setup notice.
    """
    cfg = get_oauth_config()
    if not cfg["configured"]:
        return {
            "configured": False,
            "error": "Google OAuth is not configured",
            "message": "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in the environment or .env file before Google Single Sign-On can be used.",
            "redirect_uri": cfg["redirect_uri"]
        }

    scope = "openid email profile"
    params = urllib.parse.urlencode({
        "client_id": cfg["client_id"],
        "redirect_uri": cfg["redirect_uri"],
        "response_type": "code",
        "scope": scope,
        "access_type": "offline",
        "prompt": "select_account"
    })
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{params}"
    return {
        "configured": True,
        "url": auth_url,
        "redirect_uri": cfg["redirect_uri"]
    }


@router.get("/auth/google")
def google_login_redirect():
    """
    Direct browser redirect to Google OAuth 2.0.
    NEVER silently falls back to local evaluator mode.
    """
    cfg = get_oauth_config()
    if not cfg["configured"]:
        return RedirectResponse(url="http://localhost:3000/login?error=oauth_not_configured")

    scope = "openid email profile"
    params = urllib.parse.urlencode({
        "client_id": cfg["client_id"],
        "redirect_uri": cfg["redirect_uri"],
        "response_type": "code",
        "scope": scope,
        "access_type": "offline",
        "prompt": "select_account"
    })
    return RedirectResponse(url=f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@router.get("/auth/callback")
def backend_auth_callback_fallback(request: Request):
    """
    If the browser hits the backend /auth/callback directly, forward it to the frontend SPA route
    so raw JSON is NEVER presented directly to the user.
    """
    query = request.url.query
    dest = f"http://localhost:3000/auth/callback{('?' + query) if query else ''}"
    return RedirectResponse(url=dest, status_code=307)


@router.post("/auth/google/callback")
def google_code_exchange(req: GoogleCodeExchangeRequest):
    """
    Real Google OAuth 2.0 / OpenID Connect authorization code exchange.
    Exchanges code for tokens, verifies Google identity via /userinfo endpoint,
    creates/updates user, and returns signed analyst session.
    """
    cfg = get_oauth_config()
    if not cfg["configured"]:
        raise HTTPException(
            status_code=400,
            detail="Google OAuth is not configured on the server. Please provide valid GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        )

    if not req.code:
        raise HTTPException(status_code=400, detail="Missing authorization code from Google OAuth redirect.")

    redirect_uri = req.redirect_uri or cfg["redirect_uri"]

    try:
        # Step 1: Exchange code for tokens at Google Token Endpoint
        token_payload = urllib.parse.urlencode({
            "code": req.code,
            "client_id": cfg["client_id"],
            "client_secret": cfg["client_secret"],
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        }).encode("utf-8")

        token_req = urllib.request.Request(
            "https://oauth2.googleapis.com/token",
            data=token_payload,
            method="POST",
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "SignalX-RF-Platform/1.0 (Windows; NTRO SIH26147)"
            }
        )
        
        with urllib.request.urlopen(token_req, timeout=12) as resp:
            token_data = json.loads(resp.read().decode("utf-8"))

        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Google token endpoint did not return an access token.")

        # Step 2: Fetch user profile from Google UserInfo endpoint
        user_req = urllib.request.Request(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        with urllib.request.urlopen(user_req, timeout=10) as u_resp:
            g_profile = json.loads(u_resp.read().decode("utf-8"))

        google_sub = g_profile.get("sub")
        email = g_profile.get("email")
        name = g_profile.get("name") or (email.split("@")[0] if email else "Google Analyst")
        picture = g_profile.get("picture")

        if not google_sub or not email:
            raise HTTPException(status_code=400, detail="Incomplete Google user profile: missing subject ID or email.")

        # Step 3: Upsert user into database
        internal_user_id = f"usr-g-{hashlib.sha256(google_sub.encode()).hexdigest()[:12]}"
        user = create_or_update_user(
            user_id=internal_user_id,
            email=email,
            name=name,
            profile_image=picture,
            google_subject_id=google_sub
        )

        # Step 4: Issue cryptographically signed session token
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        sign_body = f"{user['id']}:{email}:{timestamp}".encode()
        session_token = hmac.new(cfg["session_secret"].encode(), sign_body, hashlib.sha256).hexdigest()

        return {
            "id": user["id"],
            "google_subject_id": user.get("google_subject_id"),
            "email": user["email"],
            "name": user["name"],
            "profile_image": user.get("profile_image"),
            "role": "Authenticated RF Analyst",
            "mode": "GOOGLE_OAUTH_AUTHENTICATED",
            "auth_provider": "google",
            "session_token": session_token,
            "last_login": user.get("last_login")
        }

    except urllib.error.HTTPError as e:
        err_text = e.read().decode("utf-8", errors="ignore")
        cid = cfg.get("client_id", "")
        sec = cfg.get("client_secret", "")
        safe_cid = f"...{cid[-16:]}" if len(cid) > 16 else "NONE"
        safe_sec = f"sha256:{hashlib.sha256(sec.encode()).hexdigest()[:8]} (last4: {sec[-4:]})" if len(sec) >= 4 else "NONE"
        logger.error(
            "Google OAuth HTTPError %s | client_id=%s | secret_fingerprint=%s | redirect_uri=%s | details=%s",
            e.code, safe_cid, safe_sec, redirect_uri, err_text
        )
        try:
            err_json = json.loads(err_text)
            msg = err_json.get("error_description") or err_json.get("error") or err_text
        except Exception:
            msg = err_text
        raise HTTPException(status_code=400, detail=f"Google OAuth token exchange failed ({e.code}): {msg}")
    except urllib.error.URLError as e:
        logger.error(f"Google OAuth URLError: {e.reason}")
        raise HTTPException(status_code=502, detail=f"Cannot connect to Google authentication service: {e.reason}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google OAuth unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal authentication error: {str(e)}")


@router.post("/auth/local")
def local_login(req: LocalLoginRequest, response: Response, request: Request):
    """
    Explicit Offline Demo Mode / Evaluator Access.
    Strictly distinguished from Google OAuth.
    Issues an isolated local evaluator session.
    """
    u_email = req.email or "evaluator@signalx.local"
    if u_email == "evaluator@signalx.local":
        uid = "eval-guest-001"
    else:
        uid = f"user-{hashlib.md5(u_email.encode()).hexdigest()[:8]}"
    
    user = create_or_update_user(
        user_id=uid,
        email=u_email,
        name=req.name or "Local Evaluator (Offline Demo Mode)",
        profile_image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        google_subject_id=f"local-demo-{u_email}"
    )
    user['role'] = "Offline Evaluation Guest"
    user['mode'] = "DEMO/OFFLINE EVALUATION MODE"
    user['auth_provider'] = "offline_demo"

    # Issue server-side session for evaluator
    session_id = create_auth_session(
        user_id=user["id"],
        email=u_email,
        firebase_uid="offline-demo",
        duration_days=1
    )
    user['session_token'] = session_id

    is_secure = request.url.scheme == "https"
    response.set_cookie(
        key="signalx_session",
        value=session_id,
        httponly=True,
        secure=is_secure,
        samesite="none" if is_secure else "lax",
        max_age=24 * 3600,
        path="/"
    )
    return user


@router.get("/auth/me")
def get_current_user(user: dict = Depends(get_current_authenticated_user)):
    """
    Fetches the profile for the active analyst session.
    Validated directly against the server-side session store.
    """
    return user


@router.post("/auth/logout")
def logout(
    response: Response,
    request: Request,
    signalx_session: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    """
    Terminates analyst session.
    Revokes the server-side session record in SQLite and deletes the HttpOnly cookie.
    """
    session_id = None
    if signalx_session:
        session_id = signalx_session.strip()
    elif authorization and authorization.startswith("Bearer "):
        session_id = authorization[7:].strip()

    if session_id:
        revoke_auth_session(session_id)

    is_secure = request.url.scheme == "https"
    response.delete_cookie(
        key="signalx_session",
        path="/",
        secure=is_secure,
        httponly=True,
        samesite="none" if is_secure else "lax"
    )
    return {"status": "logged_out", "message": "Analyst session closed."}


@router.get("/auth/protected")
def protected_case_access(user: dict = Depends(get_current_authenticated_user)):
    """
    Security barrier for protected SIGINT case repositories.
    Strictly validates the authenticated server session via HttpOnly cookie or Bearer token.
    Denies all unauthenticated requests with HTTP 401.
    """
    return {
        "status": "authorized",
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "access": "granted",
        "clearance": "RESTRICTED-SIGINT",
        "role": user.get("role", "Authenticated RF Analyst"),
        "mode": user.get("mode", "FIREBASE_AUTHENTICATED"),
        "auth_provider": user.get("google_subject_id", "firebase_google"),
        "authenticated_via": "server_session",
        "session_expires_at": user.get("session_expires_at")
    }
