import React, { useEffect, useState } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { detectInterleaving, deinterleave } from '../lib/api';
import SourceBadge from '../components/analysis/SourceBadge';
import { Activity, Play, RefreshCw, CheckCircle, SplitSquareVertical } from 'lucide-react';

export default function DeinterleavePage() {
  const { sessionId } = useSignalStore();
  const [detection, setDetection] = useState(null);
  const [method, setMethod] = useState('block');
  const [blockM, setBlockM] = useState('8');
  const [blockN, setBlockN] = useState('16');
  const [convDepth, setConvDepth] = useState('8');
  const [diagRows, setDiagRows] = useState('8');
  const [diagCols, setDiagCols] = useState('16');
  const [prnSeed, setPrnSeed] = useState('42');
  const [result, setResult] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const runDetection = () => {
    if (!sessionId) return;
    setDetecting(true);
    setError(null);
    detectInterleaving(sessionId)
      .then(res => {
        setDetection(res);
        if (res?.best?.type && res.best.type !== 'none') {
          setMethod(res.best.type);
          if (res.best.params?.M) setBlockM(res.best.params.M.toString());
          if (res.best.params?.N) setBlockN(res.best.params.N.toString());
          if (res.best.params?.depth) setConvDepth(res.best.params.depth.toString());
          if (res.best.params?.seed) setPrnSeed(res.best.params.seed.toString());
        }
      })
      .catch(e => setError(e.message || 'Interleaving detection failed. Ensure signal is demodulated first.'))
      .finally(() => setDetecting(false));
  };

  useEffect(() => {
    runDetection();
  }, [sessionId]);

  const handleDeinterleave = async (e) => {
    e.preventDefault();
    if (!sessionId) return;
    try {
      setRunning(true);
      setError(null);
      let params = {};
      if (method === 'block') params = { M: parseInt(blockM), N: parseInt(blockN) };
      else if (method === 'convolutional') params = { depth: parseInt(convDepth) };
      else if (method === 'diagonal') params = { rows: parseInt(diagRows), cols: parseInt(diagCols) };
      else if (method === 'pseudorandom') params = { seed: parseInt(prnSeed) };

      const res = await deinterleave(sessionId, method, params);
      setResult(res);
    } catch (err) {
      setError(err.message || 'De-interleaving failed');
    } finally {
      setRunning(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="text-center py-24 font-mono text-slate-400 space-y-2">
        <Activity className="w-10 h-10 text-slate-600 mx-auto" />
        <p>No signal session active. Please ingest a signal file first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2238] pb-4">
        <div>
          <div className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
            DSP STAGE 11 & 12 / 17
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Interleaving Identification & De-interleaver</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-detection of bit dispersal patterns and 4 deterministic de-interleaving algorithms.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceBadge source={detection?.source || 'AUTO_CLASSIFIED'} />
          <button
            onClick={runDetection}
            disabled={detecting}
            className="p-2 bg-[#0E121C] border border-[#1A2238] hover:border-sky-500 rounded-sm text-slate-300 transition-colors cursor-pointer"
            title="Re-run Auto Detection"
          >
            <RefreshCw className={`w-4 h-4 ${detecting ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-sm text-xs font-mono">{error}</div>}

      {/* Auto-Detection Candidate Banner */}
      {detection && (
        <div className="bg-[#090C13] border border-[#1A2238] p-4 rounded-sm font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 uppercase font-bold">AUTOMATIC IDENTIFICATION CANDIDATE:</span>
            <span className={`px-2 py-0.5 rounded-xs border ${
              detection.status === 'NO_RELIABLE_INTERLEAVING_DETECTED'
                ? 'bg-amber-950/40 border-amber-800 text-amber-400'
                : 'bg-sky-950/60 border-sky-800 text-sky-400'
            }`}>
              {detection.status === 'NO_RELIABLE_INTERLEAVING_DETECTED'
                ? 'NO RELIABLE INTERLEAVING DETECTED'
                : (detection.best ? `${detection.best.type.toUpperCase()} (${detection.best.confidence}%)` : 'NONE')}
            </span>
          </div>
          <div className="text-slate-400 space-y-1">
            {detection.evidence && detection.evidence.map((ev, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-slate-600">•</span>
                <span>{ev}</span>
              </div>
            ))}
          </div>
          {detection.alternatives && detection.alternatives.length > 0 && (
            <div className="text-[11px] text-slate-500 pt-1 border-t border-[#1A2238] flex items-center gap-3">
              <span className="text-slate-600">TESTED SCHEMES:</span>
              {detection.alternatives.map((alt, i) => (
                <span key={i} className="bg-[#121826] px-1.5 py-0.5 rounded text-slate-400">
                  {alt.type} ({alt.confidence}%)
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Method Selection & Execution Form */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6">
        <form onSubmit={handleDeinterleave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">DE-INTERLEAVING METHOD</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
              >
                <option value="block">Block Interleaver (MxN)</option>
                <option value="convolutional">Convolutional Interleaver</option>
                <option value="diagonal">Diagonal / Helical Interleaver</option>
                <option value="pseudorandom">Pseudo-Random Permutation</option>
              </select>
            </div>

            {method === 'block' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1">ROWS (M)</label>
                  <input
                    type="number"
                    value={blockM}
                    onChange={e => setBlockM(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">COLUMNS (N)</label>
                  <input
                    type="number"
                    value={blockN}
                    onChange={e => setBlockN(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                    required
                  />
                </div>
              </>
            )}

            {method === 'convolutional' && (
              <div>
                <label className="block text-slate-400 mb-1">INTERLEAVER DEPTH</label>
                <input
                  type="number"
                  value={convDepth}
                  onChange={e => setConvDepth(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                  required
                />
              </div>
            )}

            {method === 'diagonal' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1">ROWS</label>
                  <input
                    type="number"
                    value={diagRows}
                    onChange={e => setDiagRows(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">COLS</label>
                  <input
                    type="number"
                    value={diagCols}
                    onChange={e => setDiagCols(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                    required
                  />
                </div>
              </>
            )}

            {method === 'pseudorandom' && (
              <div>
                <label className="block text-slate-400 mb-1">PRN SEED</label>
                <input
                  type="number"
                  value={prnSeed}
                  onChange={e => setPrnSeed(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                  required
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={running}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xs text-xs font-mono transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{running ? 'Transforming Bits...' : 'Run De-interleaving'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Before and After Bit Comparison */}
      {result && (
        <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 border-b border-[#1A2238] pb-3 text-slate-200 font-bold">
            <SplitSquareVertical className="w-4 h-4 text-sky-400" />
            <span>BITSTREAM REORGANIZATION (BEFORE VS AFTER — FIRST 128 BITS)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-slate-400 font-bold">RAW DEMODULATED (BEFORE):</div>
              <div className="p-3 bg-[#06080D] border border-[#1A2238] rounded-xs text-slate-400 break-all select-all font-mono tracking-widest leading-relaxed">
                {result.before_128?.join('') || 'None'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-emerald-400 font-bold">DE-INTERLEAVED (AFTER):</div>
              <div className="p-3 bg-[#06080D] border border-emerald-950/60 rounded-xs text-emerald-400 break-all select-all font-mono tracking-widest leading-relaxed">
                {result.after_128?.join('') || 'None'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
