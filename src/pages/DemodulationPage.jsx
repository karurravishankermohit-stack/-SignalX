import React, { useEffect, useState } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { demodulate } from '../lib/api';
import SourceBadge from '../components/analysis/SourceBadge';
import { Activity, Play, Terminal, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DemodulationPage() {
  const { sessionId, modulation, parameters, setSession } = useSignalStore();
  const [selectedMod, setSelectedMod] = useState(modulation?.best || 'QPSK');
  const [symbolRate, setSymbolRate] = useState('4800');
  const [freqOffset, setFreqOffset] = useState('0');
  const [phaseOffset, setPhaseOffset] = useState('0');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (modulation?.best && modulation.best !== 'UNKNOWN') {
      setSelectedMod(modulation.best);
    }
    if (parameters?.estimated_symbol_rate?.symbol_rate_hz) {
      setSymbolRate(Math.round(parameters.estimated_symbol_rate.symbol_rate_hz).toString());
    }
  }, [modulation, parameters]);

  const handleDemodulate = async (e) => {
    e.preventDefault();
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await demodulate(sessionId, {
        modulation: selectedMod,
        symbol_rate: parseFloat(symbolRate) || 4800,
        freq_offset: parseFloat(freqOffset) || 0,
        phase_offset: parseFloat(phaseOffset) || 0,
      });
      setResult(res);
      setSession({ demodulation: res });
    } catch (err) {
      setError(err.message || 'Demodulation failed');
    } finally {
      setLoading(false);
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

  const bits = result?.bits_preview || [];
  const hexPreview = bits.length > 0 ? (
    Array.from({ length: Math.ceil(bits.length / 8) }, (_, i) => {
      const byteBits = bits.slice(i * 8, (i + 1) * 8);
      const byteVal = byteBits.reduce((acc, b, idx) => acc | (b << (7 - idx)), 0);
      return byteVal.toString(16).padStart(2, '0').toUpperCase();
    }).join(' ')
  ) : '';

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2238] pb-4">
        <div>
          <div className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
            DSP STAGE 10 / 17
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Signal Demodulation Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real sample-by-sample decision slicing for FSK, PSK, and QAM. Manual override available after automatic classification.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceBadge source={result?.source || 'DSP_COMPUTED'} />
        </div>
      </div>

      {error && <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-sm text-xs font-mono">{error}</div>}

      {/* Control Panel */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6">
        <form onSubmit={handleDemodulate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">MODULATION SCHEME</label>
              <select
                value={selectedMod}
                onChange={e => setSelectedMod(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
              >
                <option value="BPSK">BPSK (1 bit/sym)</option>
                <option value="QPSK">QPSK (2 bits/sym, Gray)</option>
                <option value="8PSK">8PSK (3 bits/sym)</option>
                <option value="2FSK">2FSK (Frequency Shift)</option>
                <option value="4FSK">4FSK (4-Tone Shift)</option>
                <option value="16QAM">16-QAM (4 bits/sym grid)</option>
                <option value="64QAM">64-QAM (6 bits/sym grid)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">SYMBOL RATE (BAUD / HZ)</label>
              <input
                type="number"
                value={symbolRate}
                onChange={e => setSymbolRate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                placeholder="e.g. 4800"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">CARRIER FREQ OFFSET (HZ)</label>
              <input
                type="number"
                value={freqOffset}
                onChange={e => setFreqOffset(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">PHASE OFFSET (RAD)</label>
              <input
                type="number"
                step="0.05"
                value={phaseOffset}
                onChange={e => setPhaseOffset(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xs text-xs font-mono transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Demodulating Physical Samples...' : 'Execute Demodulation'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Demodulation Outputs */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
              <div className="text-slate-500 text-[10px]">TOTAL RECOVERED BITS</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{result.bit_count} bits</div>
              <div className="text-[10px] text-slate-500">{result.symbol_count} symbols sliced</div>
            </div>

            <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
              <div className="text-slate-500 text-[10px]">BIT ERROR RATE (BER)</div>
              <div className="text-sm font-bold text-white mt-1">
                {result.ber?.ber !== null && result.ber?.ber !== undefined
                  ? `${result.ber.ber.toFixed(6)} (${result.ber.errors} err / ${result.ber.n_compared} bits)`
                  : 'NOT AVAILABLE'}
              </div>
              <div className="text-[10px] text-slate-500">
                {result.ber?.ber !== null && result.ber?.ber !== undefined
                  ? 'Verified against known reference bits (DEMO)'
                  : 'BER: NOT AVAILABLE — ground truth/reference bits unavailable.'}
              </div>
            </div>

            <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
              <div className="text-slate-500 text-[10px]">DOWNSTREAM READY</div>
              <div className="text-sm font-bold text-sky-400 mt-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Bits loaded into pipeline session</span>
              </div>
            </div>
          </div>

          {/* Hex & Binary Bitstream View */}
          <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-4 font-mono text-xs space-y-4">
            <div>
              <div className="text-slate-400 font-bold mb-1">FIRST 256 BITS (HEXADECIMAL):</div>
              <div className="p-3 bg-[#06080D] border border-[#1A2238] rounded-xs text-sky-300 tracking-wider break-all select-all">
                {hexPreview || 'No bits recovered'}
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-bold mb-1">FIRST 128 BITS (BINARY):</div>
              <div className="p-3 bg-[#06080D] border border-[#1A2238] rounded-xs text-slate-300 font-mono tracking-widest break-all select-all">
                {bits.slice(0, 128).join('') || 'No bits recovered'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
