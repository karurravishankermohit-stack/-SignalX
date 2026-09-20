import { applyCors } from './_session.js';
import { getSession } from './_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  const urlPath = req.url.split('?')[0];
  const parts = urlPath.split('/').filter(Boolean);
  const type = req.query?.type || parts[parts.length - 1];
  const sid = req.body?.session_id || req.body?.sessionId || 'default';
  const s = getSession(sid);

  if (type === 'interleaving') {
    return res.status(200).json(s.results.interleaving);
  } else if (type === 'fec') {
    return res.status(200).json(s.results.fec);
  }

  return res.status(200).json({ detected: false });
}
