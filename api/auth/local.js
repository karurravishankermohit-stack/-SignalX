import { applyCors, signSession } from '../_session.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;

  const u_email = req.body?.email || 'evaluator@signalx.local';
  const name = req.body?.name || 'Local Evaluator (Offline Demo Mode)';
  const uid = 'eval-guest-001';

  const sessionData = {
    user_id: uid,
    uid: 'offline-demo',
    email: u_email,
    name,
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'Offline Evaluation Guest',
    mode: 'DEMO/OFFLINE EVALUATION MODE',
    exp: Date.now() + 24 * 3600 * 1000
  };

  const signedToken = signSession(sessionData);
  const isSecure = req.headers?.['x-forwarded-proto'] === 'https' || req.headers?.referer?.startsWith('https');
  res.setHeader('Set-Cookie', `signalx_session=${signedToken}; Path=/; HttpOnly; Max-Age=${24 * 3600}; SameSite=${isSecure ? 'None' : 'Lax'}${isSecure ? '; Secure' : ''}`);

  return res.status(200).json({
    id: uid,
    email: u_email,
    name,
    role: 'Offline Evaluation Guest',
    mode: 'DEMO/OFFLINE EVALUATION MODE',
    auth_provider: 'offline_demo',
    session_token: signedToken
  });
}
