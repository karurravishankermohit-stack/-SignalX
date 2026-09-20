import { applyCors } from './_session.js';
import { getSession } from './_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  const sid = req.body?.session_id || req.query?.session_id || 'latest';
  const s = getSession(sid);
  res.status(200).json({
    session_id: s.session_id,
    method: req.body?.method || 'BLOCK',
    deinterleaved_bits: s.results.demodulation?.bits || [],
    success: true
  });
}
