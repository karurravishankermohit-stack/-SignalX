import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { signInWithGoogle } from '../../lib/firebase';
import { loginWithFirebase, localLogin, getProtectedCaseStatus } from '../../lib/api';
import { useSignalStore } from '../../store/useSignalStore';

export default function GoogleLoginButton({ 
  variant = 'primary', 
  size = 'md',
  className = '',
  label = 'Continue with Google' 
}) {
  const navigate = useNavigate();
  const setCurrentUser = useSignalStore(s => s.setCurrentUser);
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const [canUseRedirect, setCanUseRedirect] = useState(false);
  const [authPhaseStatus, setAuthPhaseStatus] = useState(null);

  const handleGoogleLogin = async (useRedirect = false) => {
    setLoading(true);
    setErrorNotice(null);
    setErrorCode(null);
    setDiagnosticInfo(null);
    setCanUseRedirect(false);
    setAuthPhaseStatus(null);

    let activeFirebaseUser = null;

    try {
      // Step 1: Firebase Google Authentication (Popup or Redirect)
      const result = await signInWithGoogle(useRedirect);
      
      // If using redirect, Firebase redirects the window away, so result may be void
      if (useRedirect) {
        return;
      }

      const { firebaseUser, idToken } = result;
      if (!idToken || !firebaseUser) {
        throw new Error('No Firebase user credentials returned from Google sign-in.');
      }
      activeFirebaseUser = firebaseUser;

      // Step 2: Backend server-side token verification and secure HttpOnly session creation
      // Token is sent to backend; backend validates signature, issuer, audience, exp, uid via Google live JWKS / Firebase Admin
      let user;
      try {
        user = await loginWithFirebase(idToken);
      } catch (backendErr) {
        setAuthPhaseStatus({
          firebaseGoogle: 'SUCCESS',
          firebaseEmail: firebaseUser.email || firebaseUser.uid,
          backendVerification: 'FAILED'
        });
        throw backendErr;
      }

      if (!user || !user.id) {
        setAuthPhaseStatus({
          firebaseGoogle: 'SUCCESS',
          firebaseEmail: firebaseUser.email || firebaseUser.uid,
          backendVerification: 'FAILED'
        });
        throw new Error('Backend failed to verify Firebase ID token or establish session.');
      }

      // Step 3: Validate that the secure HttpOnly session authorizes access to protected SIGINT APIs
      const authVerification = await getProtectedCaseStatus();
      console.log('[SignalX Auth] Backend session verification passed for:', authVerification.analyst || authVerification.email);

      // Step 4: Store in application state and local session storage
      setCurrentUser(user);
      try {
        localStorage.setItem('signalx_user_session', JSON.stringify({
          id: user.id,
          firebase_uid: user.firebase_uid,
          email: user.email,
          name: user.name,
          role: user.role,
          token: user.session_token,
          mode: user.mode
        }));
      } catch (e) {
        // Local storage access optional
      }

      // Step 5: Navigate to workstation dashboard
      navigate('/dashboard');
    } catch (err) {
      const code = err?.code || (err?.status ? `HTTP_${err.status}` : '');
      const msg = err?.message || '';
      const diag = err?.diagnostic || null;

      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User voluntarily closed popup; do not display error modal
        return;
      }

      setErrorCode(code);
      setDiagnosticInfo(diag);

      if (!activeFirebaseUser) {
        setAuthPhaseStatus({
          firebaseGoogle: 'FAILED',
          firebaseEmail: null,
          backendVerification: 'NOT_ATTEMPTED'
        });
      }

      if (code === 'auth/popup-blocked') {
        setCanUseRedirect(true);
        setErrorNotice(
          'Google Sign-In popup was blocked by your browser settings. You can click below to sign in using direct Google redirect instead.'
        );
        return;
      }

      if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        setErrorNotice(
          `Domain "${host}" is not listed under Authorized Domains in the Firebase Console. Please add "${host}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`
        );
        return;
      }

      if (code === 'auth/network-request-failed') {
        setErrorNotice(
          'Network connection error reaching Google/Firebase authentication services. Please check your internet connection and retry.'
        );
        return;
      }

      setCanUseRedirect(true);
      setErrorNotice(msg || 'Authentication failed. Please try again or use direct redirect.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineDemoLogin = async () => {
    try {
      setLoading(true);
      const user = await localLogin('evaluator@signalx.local', 'Local Evaluator (Offline Demo Mode)');
      setCurrentUser(user);
      setErrorNotice(null);
      navigate('/dashboard');
    } catch (e) {
      alert('Failed to initialize offline demo mode: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs',
    lg: 'px-5 py-2.5 text-sm',
  }[size] || 'px-4 py-2 text-xs';

  const variantClasses = {
    primary: 'bg-white hover:bg-slate-100 text-slate-900 font-semibold border border-slate-300 shadow-sm active:translate-y-px',
    secondary: 'bg-[#161C2B] hover:bg-[#1C2438] text-slate-200 font-medium border border-[#2C374E] active:translate-y-px',
    minimal: 'bg-transparent hover:bg-[#131826] text-slate-300 font-mono border border-[#1E2638] hover:border-[#2C374E]',
  }[variant] || 'bg-white hover:bg-slate-100 text-slate-900 font-semibold border border-slate-300';

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleGoogleLogin(false)}
        aria-label="Continue with Google Authentication"
        className={`inline-flex items-center justify-center gap-2.5 rounded-sm transition-all duration-150 cursor-pointer select-none font-sans ${sizeClasses} ${variantClasses} ${loading ? 'opacity-70 cursor-wait' : ''} ${className}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin text-sky-600" />
        ) : (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>{loading ? 'Authenticating with Google...' : label}</span>
      </button>

      {/* Firebase Auth Notice Dialog */}
      {errorNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-[#0E121C] border border-rose-500/40 rounded-sm max-w-lg w-full p-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3 mb-3">
              <div className="flex items-center gap-2.5 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  {authPhaseStatus?.backendVerification === 'FAILED' 
                    ? 'Backend Session Verification Notice' 
                    : 'Authentication Notice'}
                </span>
              </div>
              {errorCode && (
                <span className="font-mono text-[10px] text-rose-300/80 px-2 py-0.5 bg-rose-950/50 border border-rose-800/40 rounded-xs">
                  {errorCode}
                </span>
              )}
            </div>

            {/* Distinct Phase Indicators */}
            {authPhaseStatus && (
              <div className="mb-4 space-y-1.5 font-mono text-[11px] bg-[#0A0D15] p-3 rounded-xs border border-[#1E2638]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Firebase Google Auth:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-xs ${
                    authPhaseStatus.firebaseGoogle === 'SUCCESS' 
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
                      : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                  }`}>
                    {authPhaseStatus.firebaseGoogle}
                    {authPhaseStatus.firebaseEmail ? ` (${authPhaseStatus.firebaseEmail})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Backend Session Verification:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-xs ${
                    authPhaseStatus.backendVerification === 'FAILED' 
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {authPhaseStatus.backendVerification}
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
              {errorNotice}
            </p>

            {diagnosticInfo && (
              <details className="mb-4 text-[11px] font-mono text-slate-400 bg-[#090D16] p-3 rounded-xs border border-[#1E2638]">
                <summary className="cursor-pointer text-slate-400 hover:text-slate-200 select-none font-semibold mb-1">
                  Technical Diagnostics ({diagnosticInfo.code || 'Diagnostic Info'})
                </summary>
                <div className="mt-2 space-y-1 overflow-x-auto text-[10px] text-slate-400">
                  <div><span className="text-slate-500">Origin:</span> {diagnosticInfo.origin}</div>
                  <div><span className="text-slate-500">Auth Domain:</span> {diagnosticInfo.authDomain}</div>
                  <div><span className="text-slate-500">Project ID:</span> {diagnosticInfo.projectId}</div>
                  <div><span className="text-slate-500">Error Name:</span> {diagnosticInfo.name}</div>
                  <div><span className="text-slate-500">Message:</span> {diagnosticInfo.message}</div>
                </div>
              </details>
            )}

            {canUseRedirect && (
              <div className="bg-[#131826] p-3 rounded-xs border border-sky-900/40 text-xs text-slate-300 mb-4 font-sans space-y-2">
                <div className="font-semibold text-sky-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Alternative Sign-In Mode Available</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  If the browser popup cannot open, you can redirect directly to accounts.google.com and return to SignalX automatically upon sign-in.
                </p>
                <button
                  type="button"
                  onClick={() => handleGoogleLogin(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                >
                  <span>Sign In with Direct Redirect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1E2638]">
              <button
                type="button"
                onClick={handleOfflineDemoLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-[#161C2B] hover:bg-[#1C2438] border border-[#2C374E] text-slate-300 text-xs font-mono rounded-xs transition-colors"
              >
                <span>Enter Offline Demo Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setErrorNotice(null)}
                className="w-full sm:w-auto px-4 py-1.5 bg-[#1E2638] hover:bg-[#2C374E] text-slate-300 text-xs font-mono rounded-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

