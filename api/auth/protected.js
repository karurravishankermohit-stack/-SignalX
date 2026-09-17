import { applyCors, getSessionToken, verifySession } from '../_session.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;

  const sessionToken = getSessionToken(req);
  const session = verifySession(sessionToken);

  if (!session) {
    return res.status(401).json({ detail: 'Authentication required: Invalid or expired analyst session.' });
  }

  return res.status(200).json({
    status: 'authorized',
    user_id: session.user_id,
    email: session.email,
    name: session.name,
    access: 'granted',
    clearance: 'RESTRICTED-SIGINT',
    role: session.role,
    mode: session.mode,
    auth_provider: `firebase:${session.uid}`,
    authenticated_via: 'server_session',
    session_expires_at: new Date(session.exp).toISOString()
  });
}
