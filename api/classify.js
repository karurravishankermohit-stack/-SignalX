import { applyCors } from './_session.js';
import { getSession } from './_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;

  const urlPath = req.url.split('?')[0];
  const parts = urlPath.split('/').filter(Boolean);
  const id = req.query?.id || parts[parts.length - 1] || 'latest';

  const s = getSession(id);
  return res.status(200).json(s.results.modulation);
}
