import React, { useState, useEffect } from 'react';
import { useSignalStore } from '../../store/useSignalStore';
import { AlertTriangle, RefreshCw, Server, ShieldCheck, CheckCircle2, Activity, Wifi, Terminal, Clock, Link2 } from 'lucide-react';
import { getBackendUrl, setCustomBackendUrl, measureBackendDiagnostics } from '../../lib/api';

export default function DataModeBanner() {
  const { dataSource, caseId, sessionId, filename, backendOnline, backendStatus, checkBackendStatus } = useSignalStore();
  const [retrying, setRetrying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showDiag, setShowDiag] = useState(false);
  const [diagData, setDiagData] = useState(null);
  const [customUrlInput, setCustomUrlInput] = useState('');

  const configuredBackend = getBackendUrl() || (typeof window !== 'undefined' ? `${window.location.origin}` : 'http://localhost:8000');

  const runDiagnostics = async () => {
    const data = await measureBackendDiagnostics();
    setDiagData(data);
    return data;
  };

  useEffect(() => {
    if (showDiag && !diagData) {
      runDiagnostics();
    }
  }, [showDiag]);

  const handleRetry = async () => {
    setRetrying(true);
    setStatusMessage('Checking DSP Engine...');
    
    // Real measurement and health verification
    const [diag, isAlive] = await Promise.all([
      runDiagnostics(),
      checkBackendStatus()
    ]);
    
    if (isAlive || diag.backendOnline) {
      setStatusMessage('DSP ENGINE ONLINE');
    } else {
      setStatusMessage('DSP ENGINE OFFLINE');
    }

    setTimeout(() => {
      setRetrying(false);
      setStatusMessage(null);
    }, 2500);
  };

  const handleApplyCustomUrl = async (e) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setCustomBackendUrl(customUrlInput.trim());
    await handleRetry();
  };

  const handleResetDefaultUrl = async () => {
    setCustomBackendUrl(null);
    setCustomUrlInput('');
    await handleRetry();
  };

  // If backend is in cold-start connecting state
  if (backendStatus === 'CONNECTING') {
    return (
      <div className="bg-amber-950/95 border-b border-amber-700/80 text-white py-3 px-6 w-full z-50 sticky top-0 shadow-lg font-mono">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
            <div>
              <div className="text-xs font-bold tracking-wider text-amber-200 flex items-center gap-2">
                <span>CONNECTING TO DSP ENGINE...</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-900/60 border border-amber-600/40 text-amber-300 rounded-xs font-normal">
                  COLD START PROBE
                </span>
              </div>
              <div className="text-[11px] text-amber-300/80 font-sans">
                Target Backend: <code className="bg-amber-900/60 px-1 py-0.5 rounded-xs font-mono">{configuredBackend}</code>
                <span className="text-slate-400 ml-2">(Free-tier cloud instances may take up to 40s to spin up)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Target Backend: <code className="bg-rose-900/60 px-1 py-0.5 rounded-xs font-mono">{configuredBackend}</code>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              <span>{statusMessage || (retrying ? 'Checking DSP Engine...' : 'RETRY CONNECTION')}</span>
            </button>
            <button
              onClick={() => {
                setShowDiag(!showDiag);
                if (!showDiag) runDiagnostics();
              }}
              className="px-3 py-1 bg-black/40 hover:bg-black/60 border border-rose-700 text-rose-200 rounded-xs transition-colors cursor-pointer"
            >
              {showDiag ? 'HIDE DIAGNOSTICS' : 'VIEW DIAGNOSTICS'}
            </button>
          </div>
        </div>

        {/* Rich Diagnostics Modal / Panel (No secrets exposed) */}
        {showDiag && (
          <div className="max-w-6xl mx-auto mt-3 pt-3 border-t border-rose-800/60 text-xs text-rose-200 font-mono space-y-3">
            <div className="flex items-center justify-between text-[11px] text-rose-300">
              <span className="font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-rose-400" />
                SYSTEM DIAGNOSTICS & TELEMETRY PROBE
              </span>
              <button 
                onClick={runDiagnostics} 
                className="text-rose-400 hover:text-white underline cursor-pointer text-[10px]"
              >
                Refresh Probe
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-black/50 p-3 rounded-xs border border-rose-900/80 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">FRONTEND ORIGIN</span>
                <span className="text-slate-200 truncate block">{typeof window !== 'undefined' ? window.location.origin : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TARGET BACKEND URL</span>
                <span className="text-cyan-300 truncate block">{configuredBackend}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">HTTP STATUS</span>
                <span className="text-rose-400 font-bold block">{diagData?.httpStatus || 'Testing...'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ROUNDTRIP LATENCY</span>
                <span className="text-slate-200 block">{diagData?.latencyMs !== undefined ? `${diagData.latencyMs} ms` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ENVIRONMENT</span>
                <span className="text-slate-200 uppercase block">{diagData?.environment || 'production'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ACTIVE CASE / SESSION</span>
                <span className="text-slate-200 truncate block">{caseId || sessionId || 'No active session'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">LAST CONNECTED</span>
                <span className="text-emerald-400 block">{diagData?.lastSuccess || 'Never in this tab'}</span>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="text-slate-400 block text-[10px]">LAST FAILED PROBE</span>
                <span className="text-rose-300 block">{diagData?.lastFailure || new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Quick Backend Override for Live Verification */}
            <form onSubmit={handleApplyCustomUrl} className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-300">CUSTOM BACKEND:</span>
              <input
                type="text"
                placeholder="https://signal-x-ruddy.vercel.app or http://localhost:8000"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="bg-black/60 border border-rose-800 text-white px-2 py-1 text-[11px] rounded-xs font-mono flex-1 min-w-[240px] focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-xs transition-colors cursor-pointer text-[10px]"
              >
                Apply & Test
              </button>
              <button
                type="button"
                onClick={handleResetDefaultUrl}
                className="px-2.5 py-1 bg-black/40 hover:bg-black/60 border border-rose-800 text-rose-300 rounded-xs transition-colors cursor-pointer text-[10px]"
              >
                Reset Default
              </button>
            </form>
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
