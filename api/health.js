import { applyCors, FIREBASE_PROJECT_ID } from './_session.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  res.status(200).json({
    status: 'ok',
    service: 'SignalX DSP Engine',
    version: '1.0.0',
    platform: 'SignalX NTRO SIH26147',
    dsp: true,
    dsp_engine: 'available',
    environment: 'production',
    firebase_project: FIREBASE_PROJECT_ID
  });
}
