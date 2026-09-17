import { applyCors, FIREBASE_PROJECT_ID } from '../_session.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  res.status(200).json({
    firebase_configured: true,
    project_id: FIREBASE_PROJECT_ID,
    auth_domain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
    expected_issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    expected_audience: FIREBASE_PROJECT_ID,
    service_account_secret_exposed: false,
    jwks_endpoint: 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
    verification_method: 'Google Live Public JWKS Cryptographic RS256 Verification'
  });
}
