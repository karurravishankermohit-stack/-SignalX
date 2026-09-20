import { applyCors } from './_session.js';
import { getSession } from './_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;

  const urlPath = req.url.split('?')[0];
  const parts = urlPath.split('/').filter(Boolean);
  const type = req.query?.type || parts[2] || 'all';
  const id = req.query?.id || parts[3] || 'latest';

  const s = getSession(id);

  if (type === 'quality') {
    return res.status(200).json(s.results.quality);
  } else if (type === 'spectrum') {
    return res.status(200).json(s.results.spectrum);
  } else if (type === 'waterfall') {
    return res.status(200).json(s.results.waterfall);
  } else if (type === 'parameters') {
    return res.status(200).json(s.results.parameters);
  } else if (type === 'constellation') {
    return res.status(200).json(s.results.constellation);
  }

  return res.status(200).json(s.results);
}
