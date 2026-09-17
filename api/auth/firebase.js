import crypto from 'crypto';
import { applyCors, signSession, FIREBASE_PROJECT_ID } from '../_session.js';

let jwksCache = { keys: [], fetchedAt: 0 };

async function getGoogleJwks(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && jwksCache.keys.length > 0 && (now - jwksCache.fetchedAt < 3600000)) {
    return jwksCache.keys;
  }
  const res = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
  if (!res.ok) {
    throw new Error(`Failed to fetch Google Firebase JWKS: HTTP ${res.status}`);
  }
  const data = await res.json();
  jwksCache = { keys: data.keys || [], fetchedAt: now };
  return jwksCache.keys;
}

function safeMaskEmail(email) {
  if (!email || typeof email !== 'string') return 'N/A';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  return `${name.slice(0, 2)}***@${domain}`;
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const authHeader = req.headers?.authorization || '';
  let idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!idToken && req.body && req.body.id_token) idToken = req.body.id_token;

  if (!idToken) {
    return res.status(400).json({ detail: 'Missing Firebase ID token in Authorization header or body.' });
  }

  // 1. Structure validation
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    return res.status(400).json({ detail: 'Invalid Firebase ID token format. Expected 3 segments.' });
  }

  let header, payload;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch (parseErr) {
    return res.status(400).json({ detail: 'Invalid Firebase ID token encoding. Unable to parse JWT header or payload.' });
  }

  // 2. Safe Server-Side Diagnostics (NO SECRETS EXPOSED)
  const nowSec = Math.floor(Date.now() / 1000);
  console.log('[SignalX Auth Server Diagnostics]', {
    token_present: true,
    token_length: idToken.length,
    header_alg: header?.alg,
    header_kid: header?.kid,
    payload_iss: payload?.iss,
    payload_aud: payload?.aud,
    payload_sub_present: Boolean(payload?.sub || payload?.user_id),
    payload_email_masked: safeMaskEmail(payload?.email),
    token_expiry: payload?.exp,
    current_timestamp: nowSec,
    time_to_expiry_seconds: payload?.exp ? (payload.exp - nowSec) : null
  });

  // 3. Algorithm and Header Checks
  if (header?.alg !== 'RS256') {
    return res.status(401).json({ detail: `Invalid token algorithm: ${header?.alg}. Expected RS256.` });
  }
  if (!header?.kid) {
    return res.status(401).json({ detail: 'Invalid token header: missing key ID (kid).' });
  }

  try {
    // 4. Fetch Google's Public JWKS Keys for Firebase (securetoken@system.gserviceaccount.com)
    let keys = await getGoogleJwks(false);
    let jwk = keys.find(k => k.kid === header.kid);
    if (!jwk) {
      keys = await getGoogleJwks(true);
      jwk = keys.find(k => k.kid === header.kid);
    }

    if (!jwk) {
      return res.status(401).json({
        detail: `Unknown signing key ID: ${header.kid}. Token was not signed by Google Firebase Auth certificates.`
      });
    }

    // 5. Authoritative Cryptographic RSA-SHA256 Signature Verification
    const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    const signingInput = `${parts[0]}.${parts[1]}`;
    const signature = Buffer.from(parts[2], 'base64url');
    const isSignatureValid = crypto.verify('RSA-SHA256', Buffer.from(signingInput), publicKey, signature);

    if (!isSignatureValid) {
      return res.status(401).json({
        detail: 'Cryptographic signature verification failed. Token signature does not match Google public key.'
      });
    }

    // 6. Claims Verification
    const expectedIssuer = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
    if (payload.iss !== expectedIssuer) {
      return res.status(401).json({
        detail: `Invalid token issuer. Expected "${expectedIssuer}", received "${payload.iss}".`
      });
    }

    if (payload.aud !== FIREBASE_PROJECT_ID) {
      return res.status(401).json({
        detail: `Invalid token audience. Expected project "${FIREBASE_PROJECT_ID}", received "${payload.aud}".`
      });
    }

    // Clock skew tolerance: 10 seconds for expiration, 300 seconds for issued-at
    if (payload.exp && payload.exp < (nowSec - 10)) {
      return res.status(401).json({
        detail: `Firebase ID token has expired (exp: ${payload.exp}, now: ${nowSec}). Please sign in again.`
      });
    }

    if (payload.iat && payload.iat > (nowSec + 300)) {
      return res.status(401).json({
        detail: `Firebase ID token was issued in the future (iat: ${payload.iat}, now: ${nowSec}).`
      });
    }

    const uid = payload.sub || payload.user_id;
    if (!uid || typeof uid !== 'string') {
      return res.status(401).json({ detail: 'Firebase ID token is missing a valid subject UID.' });
    }

    const email = payload.email || `${uid}@firebase.signalx.internal`;
    const name = payload.name || (payload.email ? payload.email.split('@')[0] : 'Google Analyst');
    const picture = payload.picture || null;

    // 7. Authoritative Server Session Creation
    const internalUserId = `usr-fb-${crypto.createHash('sha256').update(uid).digest('hex').slice(0, 12)}`;
    const sessionData = {
      user_id: internalUserId,
      uid,
      email,
      name,
      picture,
      role: 'Authenticated RF Analyst',
      mode: 'FIREBASE_AUTHENTICATED',
      exp: Date.now() + 7 * 24 * 3600 * 1000
    };

    const signedToken = signSession(sessionData);

    const isSecure = req.headers?.['x-forwarded-proto'] === 'https' || req.headers?.referer?.startsWith('https');
    const cookieHeader = `signalx_session=${signedToken}; Path=/; HttpOnly; Max-Age=${7 * 24 * 3600}; SameSite=${isSecure ? 'None' : 'Lax'}${isSecure ? '; Secure' : ''}`;
    res.setHeader('Set-Cookie', cookieHeader);

    console.log(`[SignalX Auth] Backend session successfully created for analyst: ${safeMaskEmail(email)} (UID: ${uid.slice(0, 6)}...)`);

    return res.status(200).json({
      id: internalUserId,
      firebase_uid: uid,
      google_subject_id: `firebase:${uid}`,
      email,
      name,
      profile_image: picture,
      role: 'Authenticated RF Analyst',
      mode: 'FIREBASE_AUTHENTICATED',
      auth_provider: 'firebase_google',
      session_token: signedToken,
      last_login: new Date().toISOString()
    });
  } catch (e) {
    console.error('[SignalX Auth] Internal error during Firebase token verification:', e);
    return res.status(500).json({ detail: `Internal authentication verification error: ${e.message}` });
  }
}
