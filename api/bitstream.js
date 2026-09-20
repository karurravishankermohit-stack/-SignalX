import { applyCors } from './_session.js';
import { getSession } from './_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  const sid = req.query?.session_id || 'latest';
  const s = getSession(sid);
  res.status(200).json({
    session_id: s.session_id,
    bits: s.results.demodulation?.bits || [],
    bits_preview: s.results.demodulation?.bits_preview || [],
    total_bits: s.results.demodulation?.bits_recovered || 0
  });
}
