import { applyCors, getSessionToken, verifySession } from '../_session.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;

  const sessionToken = getSessionToken(req);
  const session = verifySession(sessionToken);

  if (!session) {
    return res.status(401).json({ detail: 'Authentication required: Invalid or expired analyst session.' });
  }

  return res.status(200).json({
    id: session.user_id,
    email: session.email,
    name: session.name,
    profile_image: session.picture,
    role: session.role || 'Authenticated RF Analyst',
    mode: session.mode || 'FIREBASE_AUTHENTICATED',
    google_subject_id: `firebase:${session.uid}`,
    session_id: sessionToken,
    session_expires_at: new Date(session.exp).toISOString()
  });
}
