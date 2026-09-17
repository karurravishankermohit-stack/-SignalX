export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('signalx_backend_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
    if (window.__SIGNALX_BACKEND_URL__) {
      return window.__SIGNALX_BACKEND_URL__.replace(/\/+$/, '');
    }
  }

  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl !== undefined && envUrl !== null && envUrl !== '') {
    return envUrl.replace(/\/+$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000';
  }

  // Active production FastAPI DSP backend service
  return 'https://dean-gluten-fifth.ngrok-free.dev';
}

export function setCustomBackendUrl(url) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('signalx_backend_url', url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem('signalx_backend_url');
    }
  }
}

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
 * Universal API fetch wrapper:
 * 1. Resolves dynamic backend URL (Production FastAPI vs Dev localhost)
 * 2. Automatically bypasses tunnel warnings (ngrok-skip-browser-warning)
 * 3. Transports HttpOnly session cookies via credentials: 'include'
 * 4. Attaches session Authorization Bearer header if present
 */
export async function apiFetch(endpoint, options = {}) {
  const base = getBackendUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;
  const headers = {
    'ngrok-skip-browser-warning': 'true',
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

export async function secureFetch(endpoint, options = {}) {
  return apiFetch(endpoint, options);
}

/**
 * Real Python DSP Backend Health Check
 * Validates that the endpoint returns status: 'ok' and dsp: true
 */
export async function checkHealth() {
  const base = getBackendUrl();
  const endpoint = `${base}/api/health`;
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.status === 'ok' && (data?.dsp === true || data?.service === 'signalx-dsp' || data?.dsp_engine === 'available')) {
        return true;
      }
    }
  } catch (e) {
    console.warn('[SignalX Health] Health check failed for target:', endpoint, e);
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
  const res = await apiFetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function getCases(userId = null) {
  const url = userId ? `/api/cases?user_id=${encodeURIComponent(userId)}` : '/api/cases';
  const res = await apiFetch(url);
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function getCaseById(caseId) {
  const res = await apiFetch(`/api/cases/${encodeURIComponent(caseId)}`);
  if (!res.ok) throw new Error(`Failed to fetch case ${caseId}`);
  return res.json();
}

export async function deleteCase(caseId) {
  const res = await apiFetch(`/api/cases/${encodeURIComponent(caseId)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete case ${caseId}`);
  return res.json();
}

export async function getDashboardStats() {
  const res = await apiFetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function getQuality(sessionId) {
  const res = await apiFetch(`/api/analyze/quality/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch quality');
  return res.json();
}

export async function getSpectrum(sessionId, window = 'hann', nfft = 2048) {
  const res = await apiFetch(`/api/analyze/spectrum/${sessionId}?window=${window}&nfft=${nfft}`);
  if (!res.ok) throw new Error('Failed to fetch spectrum');
  return res.json();
}

export async function getWaterfall(sessionId, nperseg = 256) {
  const res = await apiFetch(`/api/analyze/waterfall/${sessionId}?nperseg=${nperseg}`);
  if (!res.ok) throw new Error('Failed to fetch waterfall');
  return res.json();
}

export async function getParameters(sessionId) {
  const res = await apiFetch(`/api/analyze/parameters/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch parameters');
  return res.json();
}

export async function getConstellation(sessionId) {
  const res = await apiFetch(`/api/analyze/constellation/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch constellation');
  return res.json();
}

export async function classifyModulation(sessionId) {
  const res = await apiFetch(`/api/classify/modulation/${sessionId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to classify modulation');
  return res.json();
}

export async function demodulate(sessionId, params) {
  const res = await apiFetch('/api/demodulate', {
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
  const res = await apiFetch(`/api/bitstream/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch bitstream');
  return res.json();
}

export async function detectInterleaving(sessionId) {
  const res = await apiFetch('/api/detect/interleaving', {
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
  const res = await apiFetch('/api/deinterleave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, method, params })
  });
  if (!res.ok) throw new Error('Failed to de-interleave');
  return res.json();
}

export async function detectFec(sessionId) {
  const res = await apiFetch('/api/detect/fec', {
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
  const res = await apiFetch('/api/fec-decode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, fec_type: fecType, params })
  });
  if (!res.ok) throw new Error('Failed to decode FEC');
  return res.json();
}

export async function correlate(bitsA, bitsB = null, syncPattern = null, sessionId = null) {
  const res = await apiFetch('/api/correlate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bits_a: bitsA, bits_b: bitsB, sync_pattern: syncPattern, session_id: sessionId })
  });
  if (!res.ok) throw new Error('Failed to correlate');
  return res.json();
}

export async function getReport(sessionId) {
  const res = await apiFetch(`/api/report/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function loadDemo(signalType, userId = null) {
  const payload = { signal_type: signalType };
  if (userId) payload.user_id = userId;
  const res = await apiFetch('/api/demo/load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to load demo signal');
  return res.json();
}

export async function getAuthDiagnostic() {
  const res = await apiFetch('/api/auth/diagnostic');
  if (!res.ok) throw new Error('Failed to query authentication diagnostic');
  return res.json();
}

export async function getGoogleAuthUrl() {
  const res = await apiFetch('/api/auth/google/url');
  if (!res.ok) throw new Error('Failed to query Google OAuth configuration');
  return res.json();
}

export async function exchangeGoogleCode(code, redirectUri = null) {
  const payload = { code };
  if (redirectUri) payload.redirect_uri = redirectUri;
  const res = await apiFetch('/api/auth/google/callback', {
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
  const res = await apiFetch('/api/auth/firebase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ id_token: idToken })
  });
  if (!res.ok) {
    let detail = '';
    try {
      const data = await res.json();
      detail = data.detail || data.message || JSON.stringify(data);
    } catch (_) {
      try {
        const text = await res.text();
        detail = text ? text.slice(0, 200) : res.statusText;
      } catch (__) {
        detail = res.statusText;
      }
    }
    const err = new Error(`Backend token exchange failed [HTTP ${res.status}]: ${detail || 'Unknown server response'}`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  return res.json();
}

export async function getFirebaseStatus() {
  const res = await apiFetch('/api/auth/firebase-status');
  if (!res.ok) throw new Error('Failed to query Firebase auth status');
  return res.json();
}

export async function localLogin(email = 'evaluator@signalx.local', name = 'Local Evaluator (Offline Demo Mode)') {
  const res = await apiFetch('/api/auth/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function logoutUser() {
  const res = await apiFetch('/api/auth/logout', { method: 'POST' });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

export async function getProtectedCaseStatus() {
  const res = await apiFetch('/api/auth/protected');
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unauthorized' }));
    throw new Error(err.detail || 'Access denied');
  }
  return res.json();
}

export async function getCurrentUserSession() {
  const res = await apiFetch('/api/auth/me');
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unauthorized' }));
    throw new Error(err.detail || 'Session expired');
  }
  return res.json();
}
