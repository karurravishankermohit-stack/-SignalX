import { applyCors } from './_session.js';
import { getSession } from './_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  const sid = req.body?.session_id || req.body?.sessionId || 'default';
  const s = getSession(sid);
  res.status(200).json(s.results.demodulation);
}
