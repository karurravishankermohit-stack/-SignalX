import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.database import (
    create_or_update_user, 
    get_user_by_id, 
    create_auth_session, 
    get_auth_session, 
    revoke_auth_session
)

client = TestClient(app)

def test_firebase_status_endpoint():
    res = client.get("/api/auth/firebase-status")
    assert res.status_code == 200
    data = res.json()
    assert data.get("firebase_configured") is True
    assert data.get("project_id") == "signalx-c618c"
    assert "jwks_endpoint" in data
    assert data.get("service_account_secret_exposed") is False

def test_firebase_auth_missing_token():
    res = client.post("/api/auth/firebase", json={})
    assert res.status_code == 400
    assert "Missing Firebase ID token" in res.json().get("detail", "")

def test_firebase_auth_invalid_token():
    res = client.post("/api/auth/firebase", json={"id_token": "invalid.jwt.token"})
    assert res.status_code == 401
    assert "verification failed" in res.json().get("detail", "").lower() or "invalid" in res.json().get("detail", "").lower()

def test_firebase_user_upsert_and_isolation():
    uid = "test-evaluator-fb-001"
    email = "evaluator.fb@signalx.org"
    name = "Firebase Evaluator"
    
    user = create_or_update_user(
        user_id="usr-fb-test001",
        email=email,
        name=name,
        profile_image="https://example.com/avatar.png",
        google_subject_id=f"firebase:{uid}"
    )
    
    assert user["id"] == "usr-fb-test001"
    assert user["email"] == email
    assert user["name"] == name
    assert user["google_subject_id"] == f"firebase:{uid}"
    
    fetched = get_user_by_id("usr-fb-test001")
    assert fetched is not None
    assert fetched["email"] == email

def test_protected_route_without_session_fails():
    # Unauthenticated access to /api/auth/protected MUST return HTTP 401
    res = client.get("/api/auth/protected")
    assert res.status_code == 401
    assert "Authentication required" in res.json().get("detail", "")

def test_protected_route_with_tampered_cookie_fails():
    # Forged session token in cookie MUST return HTTP 401
    client.cookies.set("signalx_session", "forged_malicious_session_token_xyz")
    res = client.get("/api/auth/protected")
    assert res.status_code == 401
    assert "Authentication required" in res.json().get("detail", "")
    client.cookies.clear()

def test_full_auth_flow_token_to_cookie_to_protected_api():
    """
    End-to-end authentication flow:
    1. Mock verified claims from Firebase Admin SDK / Google JWKS
    2. POST /api/auth/firebase
    3. Assert HttpOnly cookie 'signalx_session' is set
    4. Access /api/auth/protected with cookie -> HTTP 200 authorized
    5. Access /api/auth/me with cookie -> HTTP 200 with user profile
    6. Access /api/auth/protected with Bearer header -> HTTP 200 authorized
    7. POST /api/auth/logout -> revokes session
    8. Access /api/auth/protected after logout -> HTTP 401
    """
    mock_claims = {
        "uid": "google-test-uid-8877",
        "sub": "google-test-uid-8877",
        "email": "analyst.google@sih2026.ntro.gov.in",
        "name": "Dr. Sarah Mitchell",
        "picture": "https://lh3.googleusercontent.com/a/test-pic",
        "iss": "https://securetoken.google.com/signalx-c618c",
        "aud": "signalx-c618c"
    }

    with patch("app.routers.auth.verify_firebase_id_token", return_value=mock_claims):
        # 1. Login with Firebase ID token
        res = client.post("/api/auth/firebase", json={"id_token": "valid.mock.google.idtoken"})
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == "analyst.google@sih2026.ntro.gov.in"
        assert data["name"] == "Dr. Sarah Mitchell"
        assert data["mode"] == "FIREBASE_AUTHENTICATED"
        session_token = data.get("session_token")
        assert session_token is not None

        # 2. Verify HttpOnly cookie
        session_cookie = res.cookies.get("signalx_session")
        assert session_cookie is not None
        assert session_cookie == session_token

        # 3. Access protected API using the HttpOnly cookie
        client.cookies.set("signalx_session", session_cookie)
        prot_res = client.get("/api/auth/protected")
        assert prot_res.status_code == 200
        prot_data = prot_res.json()
        assert prot_data["status"] == "authorized"
        assert prot_data["access"] == "granted"
        assert prot_data["email"] == "analyst.google@sih2026.ntro.gov.in"
        assert prot_data["clearance"] == "RESTRICTED-SIGINT"

        # 4. Access /api/auth/me using cookie
        me_res = client.get("/api/auth/me")
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == "analyst.google@sih2026.ntro.gov.in"

        # 5. Access protected API using Authorization Bearer header (defense-in-depth)
        client.cookies.clear()
        bearer_res = client.get("/api/auth/protected", headers={"Authorization": f"Bearer {session_token}"})
        assert bearer_res.status_code == 200
        assert bearer_res.json()["status"] == "authorized"

        # 6. Logout and revoke session
        logout_res = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {session_token}"})
        assert logout_res.status_code == 200
        assert logout_res.json()["status"] == "logged_out"

        # 7. Verify session revocation
        revoked_res = client.get("/api/auth/protected", headers={"Authorization": f"Bearer {session_token}"})
        assert revoked_res.status_code == 401
        assert "Authentication required" in revoked_res.json().get("detail", "")

def test_offline_demo_mode_issues_valid_session():
    """
    Verifies that offline demo mode creates an active session and sets cookie
    so evaluators can access protected endpoints in isolated sandbox.
    """
    res = client.post("/api/auth/local", json={"email": "evaluator@signalx.local", "name": "Local Evaluator"})
    assert res.status_code == 200
    demo_cookie = res.cookies.get("signalx_session")
    assert demo_cookie is not None

    client.cookies.set("signalx_session", demo_cookie)
    prot_res = client.get("/api/auth/protected")
    assert prot_res.status_code == 200
    assert prot_res.json()["status"] == "authorized"
    client.cookies.clear()
