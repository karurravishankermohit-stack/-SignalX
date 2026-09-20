import { applyCors } from './_session.js';
import { getAllCases } from './_dsp.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  const cases = getAllCases();
  const urlPath = req.url.split('?')[0];
  const parts = urlPath.split('/').filter(Boolean);
  if (parts.length > 2 && parts[2] !== 'cases') {
    const caseId = parts[2];
    const found = cases.find(c => c.case_id === caseId || c.session_id === caseId);
    if (found) return res.status(200).json(found);
    return res.status(404).json({ detail: `Case ${caseId} not found` });
  }
  res.status(200).json(cases);
}
