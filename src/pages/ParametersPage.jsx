import React, { useEffect, useState } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { getParameters } from '../lib/api';
import SourceBadge from '../components/analysis/SourceBadge';
import { Activity, RefreshCw, AlertCircle, Info } from 'lucide-react';

export default function ParametersPage() {
  const { sessionId } = useSignalStore();
  const [params, setParams] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchParameters = () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    getParameters(sessionId)
      .then(setParams)
      .catch(e => setError(e.message || 'Failed to extract parameters'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchParameters();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="text-center py-24 font-mono text-slate-400 space-y-2">
        <Activity className="w-10 h-10 text-slate-600 mx-auto" />
        <p>No signal session active. Please ingest a signal file first.</p>
      </div>
    );
  }

  const tableRows = params ? [
    {
      name: 'Sampling Rate',
      value: params.sample_rate?.value ? `${Number(params.sample_rate.value).toLocaleString()} Hz` : 'Unavailable',
      source: params.sample_rate?.source,
      note: 'Derived from WAV header or specified by analyst for raw IQ.',
    },
    {
      name: 'Sample Count',
      value: params.n_samples?.value ? Number(params.n_samples.value).toLocaleString() : 'Unavailable',
      source: params.n_samples?.source,
      note: 'Total digital sample records in capture.',
    },
    {
      name: 'Signal Duration',
      value: params.duration?.value ? `${params.duration.value} s` : 'Unavailable',
      source: params.duration?.source,
      note: 'Sample count divided by sampling rate.',
    },
    {
      name: 'Absolute RF Center Frequency',
      value: params.center_frequency_rf?.value ? `${(params.center_frequency_rf.value / 1e6).toFixed(3)} MHz` : 'UNAVAILABLE',
      source: params.center_frequency_rf?.source || 'UNAVAILABLE',
      note: params.center_frequency_rf?.note || 'Cannot be recovered from raw baseband IQ samples alone without metadata.',
      isWarning: !params.center_frequency_rf?.value,
    },
    {
      name: 'Baseband Peak Frequency',
      value: params.baseband_peak_freq?.value ? `${params.baseband_peak_freq.value.toFixed(1)} Hz` : 'Unavailable',
      source: params.baseband_peak_freq?.source,
      note: 'Relative peak carrier frequency in baseband spectrum.',
    },
    {
      name: '-3 dB Occupied Bandwidth',
      value: params.occupied_bandwidth_3db?.value ? `${(params.occupied_bandwidth_3db.value / 1000).toFixed(2)} kHz` : 'Unavailable',
      source: params.occupied_bandwidth_3db?.source,
      note: 'Measured at 3 dB below spectral peak power.',
    },
    {
      name: '-20 dB Occupied Bandwidth',
      value: params.occupied_bandwidth_20db?.value ? `${(params.occupied_bandwidth_20db.value / 1000).toFixed(2)} kHz` : 'Unavailable',
      source: params.occupied_bandwidth_20db?.source,
      note: 'Measured at 20 dB below spectral peak power.',
    },
    {
      name: 'Signal-to-Noise Ratio (SNR)',
      value: params.snr?.value !== null && params.snr?.value !== undefined ? `${params.snr.value} dB` : 'Unavailable',
      source: params.snr?.source,
      note: 'Estimated from spectral peak vs median noise floor.',
    },
    {
      name: 'Spectral Noise Floor',
      value: params.noise_floor?.value !== undefined ? `${params.noise_floor.value} dBFS` : 'Unavailable',
      source: params.noise_floor?.source,
      note: '80th-percentile median filter noise floor.',
    },
    {
      name: 'Relative Signal Power',
      value: params.signal_power?.value !== undefined ? `${params.signal_power.value} dBW` : 'Unavailable',
      source: params.signal_power?.source,
      note: 'Relative RMS power 10*log10(mean(|x|²)).',
    },
    {
      name: 'Dynamic Range',
      value: params.dynamic_range?.value !== undefined ? `${params.dynamic_range.value} dB` : 'Unavailable',
      source: params.dynamic_range?.source,
      note: 'Peak power minus estimated noise floor.',
    },
    {
      name: 'Estimated Symbol Rate',
      value: params.estimated_symbol_rate?.symbol_rate_hz ? `${(params.estimated_symbol_rate.symbol_rate_hz).toFixed(1)} Baud (Hz)` : 'Unavailable',
      source: params.estimated_symbol_rate?.source,
      note: `Squared magnitude periodicity (|x|² FFT). Confidence: ${params.estimated_symbol_rate?.confidence || 0}%.`,
    },
  ] : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2238] pb-4">
        <div>
          <div className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
            DSP STAGE 07 / 17
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Signal Parameter Extraction</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical measurement table with strict data provenance attribution. Zero fabricated values.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceBadge source="DSP_ESTIMATED" />
          <button
            onClick={fetchParameters}
            disabled={loading}
            className="p-2 bg-[#0E121C] border border-[#1A2238] hover:border-sky-500 rounded-sm text-slate-300 transition-colors cursor-pointer"
            title="Refresh Parameters"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Honesty Callout */}
      <div className="bg-[#090C13] border border-[#1A2238] p-4 rounded-sm flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-200">Scientific Integrity Principle: </span>
          Baseband signals do not physically carry the tuning frequency of the receiver mixer. Absolute RF center frequency is only stated when verified by file metadata or analyst specification.
        </div>
      </div>

      {/* Parameters Table */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1A2238] bg-[#0E121C] text-slate-400 text-[11px]">
                <th className="py-3 px-4 font-bold">PARAMETER NAME</th>
                <th className="py-3 px-4 font-bold">PHYSICAL VALUE</th>
                <th className="py-3 px-4 font-bold">DATA PROVENANCE</th>
                <th className="py-3 px-4 font-bold font-sans">SCIENTIFIC METHOD / NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2238]/60">
              {tableRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#0E121C]/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-300">{row.name}</td>
                  <td className={`py-3 px-4 font-bold ${row.isWarning ? 'text-amber-400' : 'text-white'}`}>
                    {row.value}
                  </td>
                  <td className="py-3 px-4">
                    <SourceBadge source={row.source || 'UNAVAILABLE'} />
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 text-xs">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
