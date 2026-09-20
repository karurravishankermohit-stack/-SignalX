import { applyCors } from './_session.js';
import { getSession } from './_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  const urlPath = req.url.split('?')[0];
  const parts = urlPath.split('/').filter(Boolean);
  const sid = req.body?.session_id || req.body?.sessionId || req.query?.session_id || req.query?.id || parts[parts.length - 1] || 'default';
  const s = getSession(sid);

  res.status(200).json({
    report_version: '2.0',
    generated_at: new Date().toISOString(),
    source_provenance: {
      data_source: s.data_source,
      source_type: 'DEMO',
      ground_truth_available: true,
      known_modulation: s.modulation,
      configured_snr: s.snr_db,
      provenance_badge: 'DEMO_DATA',
      label: 'DEMO DATA — SYNTHETIC SIGNAL'
    },
    case_id: s.case_id,
    session_id: s.session_id,
    file_info: {
      filename: s.filename,
      format: 'iq',
      sample_rate: s.sample_rate
    },
    results: s.results,
    summary: {
      modulation: s.modulation,
      snr_db: s.snr_db,
      status: 'VERIFIED_ANALYTICS'
    }
  });
}
