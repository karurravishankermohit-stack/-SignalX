export function getBackendUrl() {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl !== undefined && envUrl !== null && envUrl !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  return '';
}

const BASE = getBackendUrl();

export function getStoredSessionToken() {
  try {
    const raw = localStorage.getItem('signalx_user_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || parsed.session_token || null;
    }
  } catch (_) {}
  return null;
}

/**
 * Universal secure fetch wrapper:
 * 1. Automatically transports HttpOnly cookies via credentials: 'include'
 * 2. Attaches session Authorization Bearer header if present
 * 3. Handles base URL routing
 */
export async function secureFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE}${endpoint}`;
  const headers = {
    ...(options.headers || {})
  };
  const token = getStoredSessionToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
}

export async function checkHealth() {
  const endpoint = BASE ? `${BASE}/health` : '/health';
  try {
    const res = await fetch(endpoint, { method: 'GET', cache: 'no-cache', credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data?.status === 'ok') return true;
    }
  } catch (e) {
    // In local development only, attempt direct fallback if VITE_BACKEND_URL is not set
    if (import.meta.env.DEV && !BASE) {
      try {
        const res2 = await fetch('http://localhost:8000/health', { method: 'GET', cache: 'no-cache', credentials: 'include' });
        if (res2.ok) {
          const data2 = await res2.json();
          return data2?.status === 'ok';
        }
      } catch (err2) {
        return false;
      }
    }
    return false;
  }
  return false;
}



export async function uploadFile(file, iqConfig = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (iqConfig && Object.keys(iqConfig).length > 0) {
    formData.append('config', JSON.stringify(iqConfig));
  }
  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function getCases(userId = null) {
  const url = userId ? `${BASE}/api/cases?user_id=${encodeURIComponent(userId)}` : `${BASE}/api/cases`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function getCaseById(caseId) {
  const res = await fetch(`${BASE}/api/cases/${encodeURIComponent(caseId)}`);
  if (!res.ok) throw new Error(`Failed to fetch case ${caseId}`);
  return res.json();
}

export async function deleteCase(caseId) {
  const res = await fetch(`${BASE}/api/cases/${encodeURIComponent(caseId)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete case ${caseId}`);
  return res.json();
}

export async function getDashboardStats() {
  const res = await fetch(`${BASE}/api/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function getQuality(sessionId) {
  const res = await fetch(`${BASE}/api/analyze/quality/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch quality');
  return res.json();
}

export async function getSpectrum(sessionId, window = 'hann', nfft = 2048) {
  const res = await fetch(`${BASE}/api/analyze/spectrum/${sessionId}?window=${window}&nfft=${nfft}`);
  if (!res.ok) throw new Error('Failed to fetch spectrum');
  return res.json();
}

export async function getWaterfall(sessionId, nperseg = 256) {
  const res = await fetch(`${BASE}/api/analyze/waterfall/${sessionId}?nperseg=${nperseg}`);
  if (!res.ok) throw new Error('Failed to fetch waterfall');
  return res.json();
}

export async function getParameters(sessionId) {
  const res = await fetch(`${BASE}/api/analyze/parameters/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch parameters');
  return res.json();
}

export async function getConstellation(sessionId) {
  const res = await fetch(`${BASE}/api/analyze/constellation/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch constellation');
  return res.json();
}

export async function classifyModulation(sessionId) {
  const res = await fetch(`${BASE}/api/classify/modulation/${sessionId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to classify modulation');
  return res.json();
}

export async function demodulate(sessionId, params) {
  const res = await fetch(`${BASE}/api/demodulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, ...params })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Demodulation failed' }));
    throw new Error(err.detail || 'Demodulation failed');
  }
  return res.json();
}

export async function getBitstream(sessionId) {
  const res = await fetch(`${BASE}/api/bitstream/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch bitstream');
  return res.json();
}


export async function detectInterleaving(sessionId) {
  const res = await fetch(`${BASE}/api/detect/interleaving`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Interleaving detection failed' }));
    throw new Error(err.detail || 'Failed to detect interleaving');
  }
  return res.json();
}

export async function deinterleave(sessionId, method, params = {}) {
  const res = await fetch(`${BASE}/api/deinterleave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, method, params })
  });
  if (!res.ok) throw new Error('Failed to de-interleave');
  return res.json();
}

export async function detectFec(sessionId) {
  const res = await fetch(`${BASE}/api/detect/fec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'FEC detection failed' }));
    throw new Error(err.detail || 'Failed to detect FEC');
  }
  return res.json();
}

export async function fecDecode(sessionId, fecType, params = {}) {
  const res = await fetch(`${BASE}/api/fec-decode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, fec_type: fecType, params })
  });
  if (!res.ok) throw new Error('Failed to decode FEC');
  return res.json();
}

export async function correlate(bitsA, bitsB = null, syncPattern = null, sessionId = null) {
  const res = await fetch(`${BASE}/api/correlate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bits_a: bitsA, bits_b: bitsB, sync_pattern: syncPattern, session_id: sessionId })
  });
  if (!res.ok) throw new Error('Failed to correlate');
  return res.json();
}

export async function getReport(sessionId) {
  const res = await fetch(`${BASE}/api/report/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function loadDemo(signalType, userId = null) {
  const payload = { signal_type: signalType };
  if (userId) payload.user_id = userId;
  const res = await fetch(`${BASE}/api/demo/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to load demo signal');
  return res.json();
}

export async function getAuthDiagnostic() {
  const res = await fetch(`${BASE}/api/auth/diagnostic`);
  if (!res.ok) throw new Error('Failed to query authentication diagnostic');
  return res.json();
}

export async function getGoogleAuthUrl() {
  const res = await fetch(`${BASE}/api/auth/google/url`);
  if (!res.ok) throw new Error('Failed to query Google OAuth configuration');
  return res.json();
}

export async function exchangeGoogleCode(code, redirectUri = null) {
  const payload = { code };
  if (redirectUri) payload.redirect_uri = redirectUri;
  const res = await fetch(`${BASE}/api/auth/google/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Google OAuth exchange failed' }));
    throw new Error(err.detail || 'Google authentication exchange failed');
  }
  return res.json();
}

export async function loginWithFirebase(idToken) {
  const res = await secureFetch('/api/auth/firebase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ id_token: idToken })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Firebase authentication failed' }));
    throw new Error(err.detail || 'Firebase authentication failed');
  }
  return res.json();
}

export async function getFirebaseStatus() {
  const res = await secureFetch('/api/auth/firebase-status');
  if (!res.ok) throw new Error('Failed to query Firebase auth status');
  return res.json();
}

export async function localLogin(email = 'evaluator@signalx.local', name = 'Local Evaluator (Offline Demo Mode)') {
  const res = await secureFetch('/api/auth/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function logoutUser() {
  const res = await secureFetch('/api/auth/logout', { method: 'POST' });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

export async function getProtectedCaseStatus() {
  const res = await secureFetch('/api/auth/protected');
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unauthorized' }));
    throw new Error(err.detail || 'Access denied');
  }
  return res.json();
}

export async function getCurrentUserSession() {
  const res = await secureFetch('/api/auth/me');
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unauthorized' }));
    throw new Error(err.detail || 'Session expired');
  }
  return res.json();
}



