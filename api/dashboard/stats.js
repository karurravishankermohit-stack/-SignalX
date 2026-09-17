import { applyCors } from '../_session.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  res.status(200).json({
    total_files: 12,
    successful_analyses: 12,
    average_snr_db: 26.4,
    average_processing_time_s: 1.4,
    recent_cases: []
  });
}
