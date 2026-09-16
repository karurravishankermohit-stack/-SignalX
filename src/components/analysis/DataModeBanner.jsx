import React, { useState } from 'react';
import { useSignalStore } from '../../store/useSignalStore';
import { AlertTriangle, RefreshCw, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function DataModeBanner() {
  const { dataSource, caseId, filename, backendOnline, checkBackendStatus } = useSignalStore();
  const [retrying, setRetrying] = useState(false);
  const [showDiag, setShowDiag] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await checkBackendStatus();
    setRetrying(false);
  };

  // If backend is genuinely offline
  if (!backendOnline) {
    return (
      <div className="bg-rose-950/95 border-b border-rose-700/80 text-white py-3 px-6 w-full z-50 sticky top-0 shadow-lg font-mono">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
            <div>
              <div className="text-xs font-bold tracking-wider text-rose-200">
                DSP ENGINE OFFLINE — Unable to reach the signal-processing service.
              </div>
              <div className="text-[11px] text-rose-300/80 font-sans">
                Target Backend: <code className="bg-rose-900/60 px-1 py-0.5 rounded-xs font-mono">http://localhost:8000</code>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              <span>{retrying ? 'Connecting...' : 'RETRY CONNECTION'}</span>
            </button>
            <button
              onClick={() => setShowDiag(!showDiag)}
              className="px-3 py-1 bg-black/40 hover:bg-black/60 border border-rose-700 text-rose-200 rounded-xs transition-colors cursor-pointer"
            >
              VIEW DIAGNOSTICS
            </button>
          </div>
        </div>

        {showDiag && (
          <div className="max-w-6xl mx-auto mt-3 pt-3 border-t border-rose-800/60 text-[11px] text-rose-200 space-y-1 font-mono">
            <div>• Ensure FastAPI is running on port 8000 (<code className="bg-black/40 px-1 py-0.5 rounded-xs">start_backend.bat</code>)</div>
            <div>• Verify GET <code className="bg-black/40 px-1 py-0.5 rounded-xs">http://localhost:8000/health</code> returns 200 OK</div>
            <div>• Check CORS origins allow <code className="bg-black/40 px-1 py-0.5 rounded-xs">http://localhost:3000</code></div>
          </div>
        )}
      </div>
    );
  }

  // If no signal is loaded yet
  if (!dataSource) return null;

  const isDemo = dataSource === 'DEMO_DATA';
  return (
    <div
      className={`flex items-center justify-between py-2 px-6 w-full z-40 sticky top-0 font-mono text-xs border-b backdrop-blur-md transition-all duration-200 ${
        isDemo
          ? 'bg-amber-950/40 text-amber-300 border-amber-500/30 shadow-[0_2px_12px_rgba(245,158,11,0.08)]'
          : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30 shadow-[0_2px_12px_rgba(0,240,255,0.08)]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`font-bold tracking-wider px-2 py-0.5 rounded-xs border text-[10px] uppercase flex items-center gap-1.5 ${
          isDemo 
            ? 'bg-amber-950/60 border-amber-500/40 text-amber-200' 
            : 'bg-cyan-950/60 border-cyan-400/50 text-cyan-200 shadow-glow-cyan-sm'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isDemo ? 'bg-amber-400' : 'bg-cyan-400'}`} />
          <span>{isDemo ? 'DEMO SANDBOX — SYNTHETIC RF' : 'TACTICAL STREAM — LIVE SIGINT'}</span>
        </span>
        <span className="text-slate-300 text-[11px] truncate">
          CASE: <strong className="text-white font-mono">{caseId || 'N/A'}</strong> | FILE: <strong className="text-white font-mono">{filename || 'N/A'}</strong>
        </span>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow-emerald" />
        <span className="text-emerald-300/90 font-bold">DSP PIPELINE SYNCHRONIZED</span>
      </div>
    </div>
  );
}

