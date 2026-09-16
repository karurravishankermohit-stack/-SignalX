import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '../../lib/firebase';
import { loginWithFirebase, localLogin } from '../../lib/api';
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      // Step 1: Firebase Web SDK Google Sign-in Popup
      const { firebaseUser, idToken } = await signInWithGoogle();
      if (!idToken) {
        throw new Error('No Firebase ID token returned from Google sign-in.');
      }

      // Step 2: Backend server-side verification and session creation
      const user = await loginWithFirebase(idToken);

      // Step 3: Store in application state and local session storage
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

      // Step 4: Navigate to workstation dashboard
      navigate('/dashboard');
    } catch (err) {
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User voluntarily closed popup; do not display error dialog
        return;
      }

      if (code === 'auth/popup-blocked') {
        setErrorNotice('Popup was blocked by your browser. Please allow popups for localhost:3000 to complete Google sign-in.');
        return;
      }

      if (code === 'auth/unauthorized-domain') {
        setErrorNotice('Authorized domain error in Firebase console. Please ensure "localhost" is listed in Firebase Auth Settings > Authorized domains.');
        return;
      }

      setErrorNotice(msg || 'Google Authentication failed. Please try again or use Offline Demo Mode.');
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
        onClick={handleGoogleLogin}
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
            <div className="flex items-center gap-2.5 text-rose-400 mb-3 border-b border-[#1E2638] pb-3 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Authentication Notice</span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
              {errorNotice}
            </p>

            <div className="bg-[#131826] p-3 rounded-xs border border-sky-900/40 text-xs text-slate-300 mb-5 font-sans">
              <span className="font-semibold text-sky-400">Offline Evaluation:</span> You may also evaluate all DSP signal features in isolated Offline Demo Mode.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1E2638]">
              <button
                type="button"
                onClick={handleOfflineDemoLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xs transition-colors"
              >
                <span>Enter Offline Demo Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setErrorNotice(null)}
                className="w-full sm:w-auto px-4 py-2 bg-[#1E2638] hover:bg-[#2C374E] text-slate-300 text-xs font-mono rounded-xs transition-colors"
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

