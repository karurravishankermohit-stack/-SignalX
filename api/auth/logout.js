import { applyCors } from '../_session.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  res.setHeader('Set-Cookie', 'signalx_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
  return res.status(200).json({ status: 'logged_out', message: 'Analyst session closed.' });
}
