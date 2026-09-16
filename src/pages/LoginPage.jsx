import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GoogleLoginButton from '../components/common/GoogleLoginButton';
import { localLogin } from '../lib/api';
import { getAuthDiagnostics } from '../lib/firebase';
import { useSignalStore } from '../store/useSignalStore';
import { Activity, ShieldAlert, ShieldCheck, Terminal, ArrowLeft, Lock, ArrowRight, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setCurrentUser = useSignalStore(s => s.setCurrentUser);
  const [offlineLoading, setOfflineLoading] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const diagnostics = getAuthDiagnostics();
  
  const oauthError = searchParams.get('error');

  const handleOfflineDemoAccess = async () => {
    try {
      setOfflineLoading(true);
      const user = await localLogin('evaluator@signalx.local', 'Local Evaluator (Offline Demo Mode)');
      setCurrentUser(user);
      navigate('/dashboard');
    } catch (e) {
      alert('Failed to launch Offline Demo Mode: ' + e.message);
    } finally {
      setOfflineLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-slate-200 font-sans flex flex-col justify-between selection:bg-sky-500/20 selection:text-sky-300">
      {/* Top minimal bar */}
      <div className="border-b border-[#1E2638] px-6 py-3 flex items-center justify-between text-xs font-mono text-slate-400 bg-[#0A0D15]">
        <a href="/" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
          <span>Return to Homepage</span>
        </a>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>AUTH GATEWAY ACTIVE</span>
        </div>
      </div>

      {/* Main Split Authentication Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full py-10 flex-1 flex flex-col justify-center">
        {oauthError === 'oauth_not_configured' && (
          <div className="mb-6 p-4 bg-amber-950/25 border border-amber-500/40 rounded-xs flex items-start gap-3 text-xs font-sans text-amber-200 shadow-lg">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-mono font-bold uppercase tracking-wider text-amber-300">
                Google OAuth is not configured
              </div>
              <div>
                GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured in your server environment or .env file before Google Single Sign-On can be initiated.
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-1">
                You can use the isolated Offline Demo Mode below to evaluate all signal intelligence features.
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full bg-[#0E121C] border border-[#1E2638] rounded-xs shadow-2xl overflow-hidden">
          {/* LEFT: SignalX Aerospace Product Statement */}
          <div className="lg:col-span-7 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#1E2638] bg-[#0A0D15] flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xs bg-[#131826] border border-[#2C374E] flex items-center justify-center text-sky-400">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-mono font-bold text-base text-white tracking-wider">
                  SIGNALX
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-[#131826] text-slate-400 border border-[#1E2638]">
                  SIH26147
                </span>
              </div>

              <div>
                <div className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2 font-semibold">
                  RF SIGNAL INTELLIGENCE & DSP WORKSTATION
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                  Automated RF Signal Intelligence
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Reverse-engineering workstation for electromagnetic transmissions. Ingests raw .IQ/.WAV baseband, computes Welch spectral estimations, classifies digital modulations, solves forward error correction, and extracts structured intelligence.
              </p>

              <div className="space-y-2 font-mono text-xs text-slate-400 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>National Technical Research Organisation (NTRO) Spec</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Strict zero client-side secret exposure architecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Per-analyst case repository and session isolation</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 pt-4 border-t border-[#1E2638]">
              STATUS: ACCESS LOGGING ACTIVE • SESSION ISOLATED
            </div>
          </div>

          {/* RIGHT: Authenticated Access Terminal */}
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-[#0E121C]">
            <div className="space-y-5">
              <div className="border-b border-[#1E2638] pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>ACCESS GATEWAY</span>
                </div>
                <h2 className="text-xl font-bold text-white font-mono">
                  ANALYST ACCESS
                </h2>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Choose an authentication method to access private signal investigations and DSP cases.
              </p>

              {/* Method 1: Google Sign-In via Firebase Authentication */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-mono font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Google Authentication</span>
                </div>
                <GoogleLoginButton size="lg" variant="primary" label="Continue with Google" className="w-full" />
                <div className="text-[10px] font-mono text-slate-500">
                  Firebase Google Sign-In with server-side identity verification
                </div>
              </div>

              {/* Visual Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#1E2638]"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  OR EVALUATOR MODE
                </span>
                <div className="flex-grow border-t border-[#1E2638]"></div>
              </div>

              {/* Method 2: Explicit Offline Demo Mode */}
              <div className="space-y-2 bg-[#0A0D15] p-3.5 rounded-xs border border-[#1E2638]">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Offline Demo Mode</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-xs">
                    OFFLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-normal">
                  Isolated sandbox for evaluation without configuring Google OAuth secrets.
                </p>
                <button
                  type="button"
                  disabled={offlineLoading}
                  onClick={handleOfflineDemoAccess}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-[#131826] hover:bg-[#1C2438] border border-[#2C374E] text-slate-200 text-xs font-mono rounded-xs transition-colors cursor-pointer"
                >
                  <span>Enter Offline Demo Mode</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2638] font-mono text-[11px] text-slate-500 space-y-0.5">
              <div className="text-slate-400 font-bold">AUTHORIZED NTRO CLEARANCE</div>
              <div>Strict session isolation enforced per analyst identity</div>
            </div>

            {/* Safe Auth Diagnostic Telemetry Panel */}
            <div className="pt-2 border-t border-[#1E2638]">
              <button
                type="button"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${diagnostics.isDomainAuthorized ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span>AUTH TELEMETRY & DIAGNOSTICS</span>
                </span>
                {showDiagnostics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showDiagnostics && (
                <div className="mt-2 p-3 bg-[#07090F] border border-[#1E2638] rounded-xs font-mono text-[10px] text-slate-400 space-y-1.5 select-text">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Firebase Project:</span>
                    <span className="text-sky-400 font-semibold">{diagnostics.projectId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Auth Domain:</span>
                    <span className="text-slate-300">{diagnostics.authDomain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Origin:</span>
                    <span className="text-slate-300">{diagnostics.currentOrigin || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Domain Auth:</span>
                    <span className={`px-1.5 py-0.5 rounded-xs text-[9px] ${diagnostics.isDomainAuthorized ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'}`}>
                      {diagnostics.isDomainAuthorized ? 'VERIFIED AUTHORIZED' : 'UNVERIFIED HOST'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Provider:</span>
                    <span className="text-emerald-400">Google OAuth (google.com)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Session User:</span>
                    <span className="text-slate-300 truncate max-w-[160px]">{diagnostics.currentUser ? diagnostics.currentUser.email : 'None (Ready)'}</span>
                  </div>
                  {diagnostics.lastAuthError && (
                    <div className="pt-1.5 border-t border-[#1E2638] text-rose-400">
                      <span className="text-rose-500 font-bold">Last Error:</span> {diagnostics.lastAuthError.code}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-[#1E2638] px-6 py-3 text-center text-[10px] font-mono text-slate-400 bg-[#080A0F]">
        SIGNALX WORKSTATION • SIH 2026 • NTRO
      </div>
    </div>
  );
}
