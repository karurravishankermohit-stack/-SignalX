import React, { useState, useEffect } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { correlate, getBitstream } from '../lib/api';
import Plot from 'react-plotly.js';
import SourceBadge from '../components/analysis/SourceBadge';
import { Activity, Play, Crosshair, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function CorrelationPage() {
  const { sessionId, demodulation, setSession } = useSignalStore();
  const [syncPattern, setSyncPattern] = useState('11010010'); // Default 8-bit Barker-like preamble
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId && (!demodulation?.bits || demodulation.bits.length === 0)) {
      getBitstream(sessionId)
        .then(res => {
          if (res?.bits) {
            setSession({ demodulation: res });
          }
        })
        .catch(console.error);
    }
  }, [sessionId, demodulation]);

  if (!sessionId) {
    return (
      <div className="text-center py-24 font-mono text-slate-400 space-y-2">
        <Activity className="w-10 h-10 text-slate-600 mx-auto" />
        <p>No signal session active. Please ingest a signal file first.</p>
      </div>
    );
  }

  const allBits = demodulation?.bits || [];

  const handleCorrelate = async (e) => {
    e.preventDefault();
    let currentBits = allBits;
    if (currentBits.length === 0 && sessionId) {
      try {
        const bs = await getBitstream(sessionId);
        if (bs?.bits && bs.bits.length > 0) {
          currentBits = bs.bits;
          setSession({ demodulation: bs });
        }
      } catch (err) {
        // continue
      }
    }

    if (currentBits.length === 0) {
      setError('Demodulated bitstream is empty. Please demodulate a signal first.');
      return;
    }

    try {
      setRunning(true);
      setError(null);
      const patArray = syncPattern.split('').map(c => parseInt(c.trim())).filter(n => !isNaN(n));
      const res = await correlate(currentBits, null, patArray, sessionId);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Correlation analysis failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2238] pb-4">
        <div>
          <div className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
            DSP STAGE 16 / 17
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bitstream Correlation & Frame Boundary Detection</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Normalized cross-correlation, preamble sync detection, candidate packet header and payload boundaries. Correlation peaks indicate candidate periodic framing; never designated as certified protocol frames without higher-layer decoding.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceBadge source={result?.source || 'DSP_COMPUTED'} />
        </div>
      </div>

      {error && <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-sm text-xs font-mono">{error}</div>}

      {/* Control Input */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6 font-mono text-xs">
        <form onSubmit={handleCorrelate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1">
                PREAMBLE / SYNC PATTERN BITS (0s & 1s)
              </label>
              <input
                type="text"
                value={syncPattern}
                onChange={e => setSyncPattern(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden tracking-widest"
                placeholder="e.g. 11010010"
                required
              />
              <span className="text-[10px] text-slate-500">
                Known sync words: Barker-7 (1110010), Barker-8 (11010010), Barker-11 (11100010010), CCSDS (11010010)
              </span>
            </div>

            <div>
              <button
                type="submit"
                disabled={running}
                className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Crosshair className="w-4 h-4" />
                <span>{running ? 'Correlating Stream...' : 'Detect Sync & Boundaries'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
              <div className="text-slate-500 text-[10px]">SYNC DETECTIONS</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {result.locations?.length || 0} peaks
              </div>
              <div className="text-[10px] text-slate-500">Threshold ≥ {result.threshold || 0.8}</div>
            </div>

            <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
              <div className="text-slate-500 text-[10px]">
                {result.source_type === 'DEMO' && result.ground_truth_available ? 'VERIFIED FRAME PERIOD' : 'CANDIDATE FRAME PERIOD'}
              </div>
              <div className="text-base font-bold text-sky-400 mt-0.5 truncate">
                {result.period_label || (result.estimated_period ? `${result.estimated_period} bits` : 'Undetermined')}
              </div>
              <div className="text-[10px] text-slate-500">
                Confidence: {result.period_confidence || 0}% | {result.source_type === 'DEMO' ? 'Ground Truth: 128 bits' : 'Candidate'}
              </div>
            </div>

            <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
              <div className="text-slate-500 text-[10px]">FRAME PERIODICITY</div>
              <div className={`text-base font-bold mt-0.5 ${result.is_periodic ? 'text-emerald-400' : 'text-amber-400'}`}>
                {result.is_periodic ? 'PERIODIC EVIDENCE' : 'NON-PERIODIC'}
              </div>
              <div className="text-[10px] text-slate-500">{result.is_periodic ? 'Harmonic alignment verified' : 'No repeating grid'}</div>
            </div>

            <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
              <div className="text-slate-500 text-[10px]">SPACING STATISTICS</div>
              <div className="text-xs text-slate-300 mt-1">
                {result.spacing_stats ? `Mean: ${result.spacing_stats.mean} | Med: ${result.spacing_stats.median} | σ: ${result.spacing_stats.std}` : 'Single peak'}
              </div>
              <div className="text-[10px] text-slate-500">Min: {result.spacing_stats?.min ?? '—'} / Max: {result.spacing_stats?.max ?? '—'}</div>
            </div>
          </div>

          {/* Sync Peaks Table with Normalized Correlation Values */}
          <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-4 font-mono text-xs space-y-3">
            <div className="text-slate-300 font-bold border-b border-[#1A2238] pb-2 flex items-center justify-between">
              <span>DETECTED CORRELATION PEAKS & NORMALIZED SCORES:</span>
              <span className="text-slate-500 font-normal text-[11px]">Normalized Scale: [-1.0 .. +1.0]</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {result.peak_locations?.map((loc, i) => (
                <div key={i} className="p-2 bg-[#06080D] border border-[#1A2238] rounded-xs flex flex-col">
                  <span className="text-slate-500 text-[10px]">PEAK #{i + 1}</span>
                  <span className="text-sky-400 font-bold text-xs">Bit Offset: {loc}</span>
                  <span className="text-emerald-400 text-[11px]">Score: {result.peak_scores?.[i] !== undefined ? result.peak_scores[i].toFixed(3) : '1.000'}</span>
                </div>
              )) || <div className="text-slate-500 col-span-full py-2">No correlation peaks found.</div>}
            </div>
          </div>

          {/* Sync Locations & Candidate Boundaries Table */}
          <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-4 font-mono text-xs space-y-3">
            <div className="text-slate-300 font-bold border-b border-[#1A2238] pb-2">
              CANDIDATE FRAME BOUNDARIES & PREAMBLES:
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-[#1A2238]/60">
              {result.frame_analysis?.candidates?.map((c, i) => (
                <div key={i} className="py-2 flex items-center justify-between hover:bg-[#0E121C] px-2 rounded-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-sky-400 font-bold">OFFSET: {c.offset}</span>
                    <span className="px-2 py-0.5 bg-[#161F30] text-slate-300 rounded-xs text-[10px]">{c.type}</span>
                  </div>
                  <div className="text-slate-400 text-xs font-sans">{c.note}</div>
                </div>
              )) || <div className="text-slate-500 py-4">No sync occurrences matched current threshold.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
