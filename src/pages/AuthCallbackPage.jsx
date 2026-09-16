import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignalStore } from '../store/useSignalStore';
import { exchangeGoogleCode, localLogin } from '../lib/api';
import { Activity, ShieldAlert, CheckCircle2, ArrowRight, RotateCcw, Lock } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setCurrentUser = useSignalStore(s => s.setCurrentUser);

  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [userName, setUserName] = useState('');
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    // Case 1: Google returned an explicit authorization error (e.g. access_denied)
    if (oauthError) {
      setStatus('error');
      setErrorMessage(
        `Google authorization was not completed (${oauthError})${errorDesc ? ': ' + errorDesc : '.'}`
      );
      return;
    }

    // Case 2: Valid authorization code received from Google
    if (code) {
      setStatus('processing');
      exchangeGoogleCode(code, window.location.origin + '/auth/callback')
        .then(user => {
          setCurrentUser(user);
          setUserName(user.name || user.email || 'Analyst');
          setStatus('success');
          try {
            localStorage.setItem('signalx_user_session', JSON.stringify({
              id: user.id,
              email: user.email,
              name: user.name,
              token: user.session_token,
              mode: user.mode
            }));
          } catch (e) {
            // Local storage access optional
          }
          setTimeout(() => {
            navigate('/dashboard');
          }, 800);
        })
        .catch(err => {
          setStatus('error');
          setErrorMessage(err.message || 'Failed to exchange authorization code with Google OAuth service.');
        });
      return;
    }

    // Case 3: No code or error in query parameters
    setStatus('error');
    setErrorMessage('No authorization code was detected in the callback query parameters.');
  }, [searchParams, navigate, setCurrentUser]);

  const handleLaunchOfflineDemo = async () => {
    try {
      const guest = await localLogin('evaluator@signalx.local', 'Local Evaluator (Offline Demo Mode)');
      setCurrentUser(guest);
      navigate('/dashboard');
    } catch (e) {
      alert('Offline Demo Mode initialization error: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="max-w-md w-full bg-[#0E121C] border border-[#1E2638] rounded-xs shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xs bg-[#131826] border border-sky-800 flex items-center justify-center text-sky-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono font-bold text-sm text-white tracking-wider">
              SIGNALX AUTH GATEWAY
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#131826] text-slate-400 border border-[#1E2638]">
            OAUTH 2.0
          </span>
        </div>

        {/* Status Views */}
        {status === 'processing' && (
          <div className="text-center py-6 space-y-4 font-mono">
            <Activity className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Exchanging Credentials
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Verifying Google identity tokens and establishing isolated analyst session...
              </p>
            </div>
            <div className="text-[11px] text-sky-400/80 bg-[#0A0D15] p-2 rounded-xs border border-[#1E2638]">
              Target: accounts.google.com/o/oauth2/token
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-6 space-y-4 font-mono">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Authentication Verified
              </h2>
              <p className="text-xs text-slate-300 font-sans">
                Welcome, <span className="text-sky-400 font-semibold">{userName}</span>. Redirecting to workspace...
              </p>
            </div>
            <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded-xs border border-emerald-800/50">
              Session authorized • Loading SignalX workstation...
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 bg-rose-950/20 border border-rose-800/40 rounded-xs">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                  Authentication Failed
                </div>
                <div className="text-xs text-slate-300 font-sans leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            </div>

            <div className="bg-[#05070B] p-3 rounded-xs border border-[#1E2638] font-mono text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-200 font-semibold">Diagnostic Information:</div>
              <div>• Callback Route: /auth/callback (Frontend React SPA)</div>
              <div>• Backend Exchange: POST /api/auth/google/callback</div>
              <div>• Zero raw credentials exposed</div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>

              <button
                type="button"
                onClick={handleLaunchOfflineDemo}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#131826] hover:bg-[#1C2438] border border-[#1E2638] text-slate-300 text-xs font-mono rounded-xs transition-colors cursor-pointer"
              >
                <span>Proceed in Offline Demo Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-[10px] font-mono text-center text-slate-500 border-t border-[#1E2638] pt-3">
          SIGNALX SECURE AUTH PROTOCOL • SIH26147
        </div>
      </div>
    </div>
  );
}
