import { applyCors, FIREBASE_PROJECT_ID } from '../_session.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;

  const currentOrigin = req.headers?.origin || req.headers?.referer || 'unknown';
  const authorizedDomains = [
    'localhost',
    '127.0.0.1',
    'signalx-c618c.firebaseapp.com',
    'signalx-c618c.web.app',
    'signal-x-ruddy.vercel.app'
  ];

  return res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    firebase_project_id: FIREBASE_PROJECT_ID,
    expected_token_issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    expected_token_audience: FIREBASE_PROJECT_ID,
    auth_domain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
    authorized_domains: authorizedDomains,
    current_request_origin: currentOrigin,
    jwks_endpoint: 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
    verification_standard: 'RS256 with Google authoritative securetoken certificates'
  });
}
