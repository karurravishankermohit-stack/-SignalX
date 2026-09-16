import React, { useEffect, useState } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { classifyModulation } from '../lib/api';
import SourceBadge from '../components/analysis/SourceBadge';
import { Activity, RefreshCw, Cpu, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function ModulationPage() {
  const { sessionId, modulation, setSession } = useSignalStore();
  const [data, setData] = useState(modulation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runClassification = () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    classifyModulation(sessionId)
      .then(res => {
        setData(res);
        setSession({ modulation: res });
      })
      .catch(e => setError(e.message || 'Failed to classify modulation'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!data && sessionId) {
      runClassification();
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="text-center py-24 font-mono text-slate-400 space-y-2">
        <Activity className="w-10 h-10 text-slate-600 mx-auto" />
        <p>No signal session active. Please ingest a signal file first.</p>
      </div>
    );
  }

  const getConfidenceLevel = (score) => {
    if (score >= 90) return { label: 'HIGH', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
    if (score >= 70) return { label: 'MEDIUM-HIGH', color: 'text-sky-400 bg-sky-950/60 border-sky-800' };
    if (score >= 50) return { label: 'MEDIUM', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
    if (score >= 30) return { label: 'LOW', color: 'text-orange-400 bg-orange-950/60 border-orange-800' };
    return { label: 'VERY LOW', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
  };

  const confLevel = getConfidenceLevel(data?.confidence || 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2238] pb-4">
        <div>
          <div className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
            DSP STAGE 08 / 17
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Automatic Modulation Classification (AMC)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic statistical cumulants, phase distribution entropy, and decision logic.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceBadge source={data?.source || 'AUTO_CLASSIFIED'} />
          <button
            onClick={runClassification}
            disabled={loading}
            className="px-3 py-1.5 bg-[#0E121C] border border-[#1A2238] hover:border-sky-500 rounded-sm text-xs font-mono text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Re-classify</span>
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-sm text-xs">{error}</div>}

      {/* Main Candidate Card */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-500 uppercase">IDENTIFIED MODULATION CANDIDATE</span>
            <span className={`font-mono text-xs px-2 py-0.5 border rounded-xs ${confLevel.color}`}>
              {confLevel.label} ({data?.confidence || 0}%)
            </span>
          </div>

          <div className="font-mono text-4xl font-bold text-white tracking-wide flex items-center gap-3">
            <span>{data?.best || 'CLASSIFYING...'}</span>
          </div>

          {/* Confidence Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-[#161F30] h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, data?.confidence || 0)}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>0% (Random Guess)</span>
              <span>Confidence Threshold: 50%</span>
              <span>100% (Definite)</span>
            </div>
          </div>

          {/* Physical Evidence */}
          <div className="pt-2">
            <div className="font-mono text-xs font-bold text-slate-300 uppercase mb-2">
              DERIVED PHYSICAL EVIDENCE:
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-slate-400">
              {data?.evidence?.map((ev, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-400">✓</span>
                  <span>{ev}</span>
                </li>
              )) || <li>Awaiting feature calculation...</li>}
            </ul>
          </div>
        </div>

        {/* Alternative Candidates */}
        <div className="bg-[#0E121C] border border-[#1A2238] p-4 rounded-sm space-y-3 font-mono">
          <div className="text-xs font-bold text-slate-300 uppercase">
            ALTERNATIVE CANDIDATES:
          </div>
          <div className="space-y-2">
            {data?.alternatives?.map((alt, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 bg-[#06080D] border border-[#1A2238] rounded-xs">
                <span className="font-bold text-slate-200">{alt.modulation}</span>
                <span className="text-slate-400">{alt.confidence}%</span>
              </div>
            )) || <div className="text-xs text-slate-500">No alternatives found</div>}
          </div>
        </div>
      </div>

      {/* Required Analysis Explanation Panel */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1A2238] pb-3">
          <Cpu className="w-5 h-5 text-sky-400" />
          <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
            ANALYST EXPLANATION PANEL
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="space-y-1 p-3 bg-[#0E121C] border border-[#1A2238] rounded-xs">
            <div className="text-slate-500 text-[10px]">WHAT WAS CLASSIFIED</div>
            <div className="text-sm font-bold text-white">{data?.best || '--'}</div>
            <div className="text-slate-400 font-sans text-xs">
              Statistical feature vector evaluated across constant-envelope, cumulants, and phase entropy.
            </div>
          </div>

          <div className="space-y-1 p-3 bg-[#0E121C] border border-[#1A2238] rounded-xs">
            <div className="text-slate-500 text-[10px]">CONFIDENCE RATING</div>
            <div className="text-sm font-bold text-sky-400">{data?.confidence || 0}% ({confLevel.label})</div>
            <div className="text-slate-400 font-sans text-xs">
              Based on distance from ideal feature boundaries. Scaled from actual mathematical metrics.
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-950/20 border border-amber-800/40 text-amber-300 rounded-xs text-xs font-sans flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Operational Limitation Note: </span>
            {data?.limitations || 'Automatic classification is probabilistic; analyst confirmation recommended before cryptanalysis or mission action.'}
          </div>
        </div>
      </div>
    </div>
  );
}
