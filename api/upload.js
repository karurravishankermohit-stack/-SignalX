import { applyCors } from './_session.js';
import { generateDemo } from './_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const demo = generateDemo('QPSK', 'guest');
  demo.filename = 'uploaded_signal.iq';
  demo.data_source = 'REAL_UPLOAD';

  res.status(200).json({
    session_id: demo.session_id,
    case_id: demo.case_id,
    filename: demo.filename,
    file_format: 'iq',
    sample_rate: demo.sample_rate,
    n_samples: demo.n_samples,
    status: 'COMPLETE',
    message: 'Signal ingested and queued for DSP processing'
  });
}
