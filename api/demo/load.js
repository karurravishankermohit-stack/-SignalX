import { applyCors } from '../_session.js';
import { generateDemo } from '../_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const body = req.body || {};
  const signalType = body.signal_type || body.signalType || 'QPSK';
  const userId = body.user_id || body.userId || 'guest';

  const demo = generateDemo(signalType, userId);

  return res.status(200).json({
    session_id: demo.session_id,
    case_id: demo.case_id,
    signal_type: demo.signal_type,
    modulation: demo.modulation,
    snr_db: demo.snr_db,
    sample_rate: demo.sample_rate,
    n_samples: demo.n_samples,
    data_source: demo.data_source,
    label: `Demo ${demo.modulation} Signal`,
    ber_available: true,
    results: demo.results,
    note: 'Demo signal synthesized and processed with embedded DSP engine'
  });
}
