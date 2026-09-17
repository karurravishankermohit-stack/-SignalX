import crypto from 'crypto';
import { applyCors, signSession, FIREBASE_PROJECT_ID } from '../_session.js';

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

  try {
    // Authoritative Google cryptographic verification via tokeninfo endpoint
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!googleRes.ok) {
      const errText = await googleRes.text();
      console.error('[SignalX Auth] Google tokeninfo verification failed:', googleRes.status, errText);
      return res.status(401).json({ detail: `Google verification failed: ${errText}` });
    }

    const claims = await googleRes.json();
    const uid = claims.user_id || claims.sub;
    const aud = claims.aud;
    const email = claims.email || `${uid}@firebase.signalx.internal`;
    const name = claims.name || (email.split('@')[0] || 'Google Analyst');
    const picture = claims.picture || null;

    // Validate Audience & Project Match
    if (aud !== FIREBASE_PROJECT_ID) {
      return res.status(401).json({ detail: `Invalid token audience. Expected project ${FIREBASE_PROJECT_ID}.` });
    }

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
    console.error('[SignalX Auth] Internal error during Firebase token exchange:', e);
    return res.status(500).json({ detail: `Authentication error: ${e.message}` });
  }
}
