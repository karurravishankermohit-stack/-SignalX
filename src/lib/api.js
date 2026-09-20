export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('signalx_backend_url');
    if (custom && custom.trim()) {
      const cleanCustom = custom.trim().replace(/\/+$/, '');
      if (!cleanCustom.includes('signalx-dsp-backend.onrender.com') && !cleanCustom.includes('ngrok')) {
        return cleanCustom;
      }
      localStorage.removeItem('signalx_backend_url');
    }
    if (window.__SIGNALX_BACKEND_URL__) {
      const cleanWin = window.__SIGNALX_BACKEND_URL__.replace(/\/+$/, '');
      if (!cleanWin.includes('signalx-dsp-backend.onrender.com') && !cleanWin.includes('ngrok')) {
        return cleanWin;
      }
    }
  }

  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (envApiUrl !== undefined && envApiUrl !== null && envApiUrl !== '') {
    return envApiUrl.replace(/\/+$/, '');
  }

  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl !== undefined && envUrl !== null && envUrl !== '') {
    return envUrl.replace(/\/+$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000';
  }

  // Same-origin Vercel serverless FastAPI DSP backend
  return '';
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
 * Same-Origin Auth Fetch:
 * Always executes on the primary website origin to guarantee 100% reliable
 * session cookie issuance, zero cross-origin CORS/preflight latency, and
 * uninterrupted authentication availability.
 */
export async function authFetch(endpoint, options = {}) {
  const isDev = import.meta.env.DEV;
  const base = isDev ? getBackendUrl() : '';
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

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

/**
 * DSP Engine Fetch:
 * Dispatches signal processing requests (FFT, demodulation, AMC, FEC, uploads)
 * directly to the real Python FastAPI DSP backend.
 */
export async function dspFetch(endpoint, options = {}) {
  const base = getBackendUrl();
  const url = endpoint.startsWith('http') ? endpoint : (base ? `${base}${endpoint}` : endpoint);

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

export async function secureFetch(endpoint, options = {}) {
  if (endpoint.includes('/api/auth/')) {
    return authFetch(endpoint, options);
  }
  return dspFetch(endpoint, options);
}

export async function apiFetch(endpoint, options = {}) {
  return secureFetch(endpoint, options);
}

/**
 * Real Python DSP Backend Health Check
 * Validates that the endpoint returns status: 'ok' and dsp: true
 * Supports up to 35s timeout to gracefully accommodate cloud cold starts.
 */
export async function checkHealth(customUrl = null) {
  const base = customUrl !== null && customUrl !== undefined ? customUrl : getBackendUrl();
  if (base === null || base === undefined) return false;
  
  for (const path of ['/api/health', '/health']) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);
      const targetUrl = base ? `${base}${path}` : path;
      const res = await fetch(targetUrl, {
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          if (data?.status === 'ok' && (data?.dsp === true || data?.dsp_engine === 'available' || data?.service === 'SignalX DSP Engine' || data?.service === 'signalx-dsp')) {
            return true;
          }
        }
      }
    } catch (_) {}
  }
  return false;
}

/**
 * Comprehensive Diagnostics Probe:
 * Queries the active backend and calculates exact roundtrip latency and HTTP status
 */
export async function measureBackendDiagnostics(customUrl = null) {
  const base = customUrl !== null && customUrl !== undefined ? customUrl : getBackendUrl();
  const displayBackendUrl = base || (typeof window !== 'undefined' ? `${window.location.origin} (Same-Origin)` : 'Same-Origin (/api)');
  const start = performance.now();
  const diag = {
    frontendUrl: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    backendUrl: displayBackendUrl,
    backendOnline: false,
    httpStatus: 'N/A',
    latencyMs: 0,
    timestamp: new Date().toISOString(),
    lastSuccess: null,
    lastFailure: null,
    environment: import.meta.env.MODE || 'production',
    service: 'Unknown',
    version: '1.0.0'
  };

  if (base === null || base === undefined) {
    diag.httpStatus = 'No Backend URL configured';
    return diag;
  }

  for (const path of ['/api/health', '/health']) {
    try {
      const targetUrl = base ? `${base}${path}` : path;
      const res = await fetch(targetUrl, {
        method: 'GET',
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
      });
      const end = performance.now();
      diag.latencyMs = Math.round(end - start);
      diag.httpStatus = `${res.status} ${res.statusText || 'OK'}`;
      
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          diag.backendOnline = true;
          diag.service = data.service || 'SignalX DSP Engine';
          diag.version = data.version || '1.0.0';
          diag.environment = data.environment || 'production';
          diag.lastSuccess = new Date().toLocaleTimeString();
          return diag;
        }
      }
    } catch (err) {
      diag.httpStatus = err.message || 'Connection Refused / Network Error';
      diag.lastFailure = new Date().toLocaleTimeString();
    }
  }
  return diag;
}

export async function uploadFile(file, iqConfig = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (iqConfig && Object.keys(iqConfig).length > 0) {
    formData.append('config', JSON.stringify(iqConfig));
  }
  const res = await dspFetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function getCases(userId = null) {
  const url = userId ? `/api/cases?user_id=${encodeURIComponent(userId)}` : '/api/cases';
  try {
    const res = await dspFetch(url);
    if (res.ok) return await res.json();
  } catch (_) {}
  // Fallback to same-origin cases repository if DSP backend is initializing
  const resFallback = await authFetch(url);
  if (!resFallback.ok) throw new Error('Failed to fetch cases');
  return resFallback.json();
}

export async function getCaseById(caseId) {
  try {
    const res = await dspFetch(`/api/cases/${encodeURIComponent(caseId)}`);
    if (res.ok) return await res.json();
  } catch (_) {}
  const resFallback = await authFetch(`/api/cases/${encodeURIComponent(caseId)}`);
  if (!resFallback.ok) throw new Error(`Failed to fetch case ${caseId}`);
  return resFallback.json();
}

export async function deleteCase(caseId) {
  try {
    const res = await dspFetch(`/api/cases/${encodeURIComponent(caseId)}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (_) {}
  const resFallback = await authFetch(`/api/cases/${encodeURIComponent(caseId)}`, { method: 'DELETE' });
  if (!resFallback.ok) throw new Error(`Failed to delete case ${caseId}`);
  return resFallback.json();
}

export async function getDashboardStats() {
  try {
    const res = await dspFetch('/api/dashboard/stats');
    if (res.ok) return await res.json();
  } catch (_) {}
  const resFallback = await authFetch('/api/dashboard/stats');
  if (!resFallback.ok) throw new Error('Failed to fetch dashboard stats');
  return resFallback.json();
}

export async function getQuality(sessionId) {
  const res = await dspFetch(`/api/analyze/quality/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch quality');
  return res.json();
}

export async function getSpectrum(sessionId, window = 'hann', nfft = 2048) {
  const res = await dspFetch(`/api/analyze/spectrum/${sessionId}?window=${window}&nfft=${nfft}`);
  if (!res.ok) throw new Error('Failed to fetch spectrum');
  return res.json();
}

export async function getWaterfall(sessionId, nperseg = 256) {
  const res = await dspFetch(`/api/analyze/waterfall/${sessionId}?nperseg=${nperseg}`);
  if (!res.ok) throw new Error('Failed to fetch waterfall');
  return res.json();
}

export async function getParameters(sessionId) {
  const res = await dspFetch(`/api/analyze/parameters/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch parameters');
  return res.json();
}

export async function getConstellation(sessionId) {
  const res = await dspFetch(`/api/analyze/constellation/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch constellation');
  return res.json();
}

export async function classifyModulation(sessionId) {
  const res = await dspFetch(`/api/classify/modulation/${sessionId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to classify modulation');
  return res.json();
}

export async function demodulate(sessionId, params) {
  const res = await dspFetch('/api/demodulate', {
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
  const res = await dspFetch(`/api/bitstream/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch bitstream');
  return res.json();
}

export async function detectInterleaving(sessionId) {
  const res = await dspFetch('/api/detect/interleaving', {
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
  const res = await dspFetch('/api/deinterleave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, method, params })
  });
  if (!res.ok) throw new Error('Failed to de-interleave');
  return res.json();
}

export async function detectFec(sessionId) {
  const res = await dspFetch('/api/detect/fec', {
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
  const res = await dspFetch('/api/fec-decode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, fec_type: fecType, params })
  });
  if (!res.ok) throw new Error('Failed to decode FEC');
  return res.json();
}

export async function correlate(bitsA, bitsB = null, syncPattern = null, sessionId = null) {
  const res = await dspFetch('/api/correlate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bits_a: bitsA, bits_b: bitsB, sync_pattern: syncPattern, session_id: sessionId })
  });
  if (!res.ok) throw new Error('Failed to correlate');
  return res.json();
}

export async function getReport(sessionId) {
  const res = await dspFetch(`/api/report/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function loadDemo(signalType, userId = null) {
  const payload = { signal_type: signalType };
  if (userId) payload.user_id = userId;
  const res = await dspFetch('/api/demo/load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to load demo signal');
  return res.json();
}

export async function getAuthDiagnostic() {
  const res = await authFetch('/api/auth/diagnostic');
  if (!res.ok) throw new Error('Failed to query authentication diagnostic');
  return res.json();
}

export async function getGoogleAuthUrl() {
  const res = await authFetch('/api/auth/google/url');
  if (!res.ok) throw new Error('Failed to query Google OAuth configuration');
  return res.json();
}

export async function exchangeGoogleCode(code, redirectUri = null) {
  const payload = { code };
  if (redirectUri) payload.redirect_uri = redirectUri;
  const res = await authFetch('/api/auth/google/callback', {
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
  const res = await authFetch('/api/auth/firebase', {
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
  const res = await authFetch('/api/auth/firebase-status');
  if (!res.ok) throw new Error('Failed to query Firebase auth status');
  return res.json();
}

export async function localLogin(email = 'evaluator@signalx.local', name = 'Local Evaluator (Offline Demo Mode)') {
  const res = await authFetch('/api/auth/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function logoutUser() {
  const res = await authFetch('/api/auth/logout', { method: 'POST' });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

export async function getProtectedCaseStatus() {
  const res = await authFetch('/api/auth/protected');
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unauthorized' }));
    throw new Error(err.detail || 'Access denied');
  }
  return res.json();
}

export async function getCurrentUserSession() {
  const res = await authFetch('/api/auth/me');
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unauthorized' }));
    throw new Error(err.detail || 'Session expired');
  }
  return res.json();
}
