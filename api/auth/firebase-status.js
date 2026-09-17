import { applyCors, FIREBASE_PROJECT_ID } from '../_session.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  res.status(200).json({
    firebase_configured: true,
    project_id: FIREBASE_PROJECT_ID,
    auth_domain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
    service_account_secret_exposed: false,
    tokeninfo_endpoint: 'https://oauth2.googleapis.com/tokeninfo'
  });
}
