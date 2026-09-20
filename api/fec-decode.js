import { applyCors } from './_session.js';
import { getSession } from './_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  const sid = req.body?.session_id || req.query?.session_id || 'latest';
  const s = getSession(sid);
  res.status(200).json({
    session_id: s.session_id,
    fec_type: req.body?.fec_type || 'CONVOLUTIONAL',
    decoded_bits: s.results.demodulation?.bits || [],
    errors_corrected: 0,
    success: true
  });
}
