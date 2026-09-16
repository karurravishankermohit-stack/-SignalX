import React, { useEffect, useState } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { getSpectrum } from '../lib/api';
import Plot from 'react-plotly.js';
import SourceBadge from '../components/analysis/SourceBadge';
import { Activity, RefreshCw } from 'lucide-react';

export default function SpectrumPage() {
  const { sessionId } = useSignalStore();
  const [data, setData] = useState(null);
  const [windowType, setWindowType] = useState('hann');
  const [nfft, setNfft] = useState('2048');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSpectrum = () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    getSpectrum(sessionId, windowType, parseInt(nfft))
      .then(setData)
      .catch(e => setError(e.message || 'Failed to compute FFT spectrum'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSpectrum();
  }, [sessionId, windowType, nfft]);

  if (!sessionId) {
    return (
      <div className="text-center py-24 font-mono text-slate-400 space-y-2">
        <Activity className="w-10 h-10 text-slate-600 mx-auto" />
        <p>No signal session active. Please ingest a signal file first.</p>
      </div>
    );
  }

  const yData = data?.power_db || data?.power || [];
  const xData = data?.freqs || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2238] pb-4">
        <div>
          <div className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
            DSP STAGE 05 / 17
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">FFT Power Spectrum Analysis</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real windowed Fast Fourier Transform with peak-preserving downsampling (max 2000 display points).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceBadge source={data?.snr_source || 'DSP_ESTIMATED'} />
          <button
            onClick={fetchSpectrum}
            disabled={loading}
            className="p-2 bg-[#0E121C] border border-[#1A2238] hover:border-sky-500 rounded-sm text-slate-300 transition-colors cursor-pointer"
            title="Recompute FFT"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Control Bar & Quick Readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
          <div className="text-slate-500 text-[10px]">PEAK FREQUENCY</div>
          <div className="text-base font-bold text-white mt-0.5">
            {data?.peak_freq_hz !== undefined ? `${(data.peak_freq_hz / 1000).toFixed(2)} kHz` : '--'}
          </div>
          <div className="text-[10px] text-slate-500">Baseband-relative</div>
        </div>

        <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
          <div className="text-slate-500 text-[10px]">ESTIMATED SNR</div>
          <div className="text-base font-bold text-emerald-400 mt-0.5">
            {data?.snr_db !== undefined ? `${data.snr_db.toFixed(1)} dB` : '--'}
          </div>
          <div className="text-[10px] text-slate-500">Peak vs Noise Floor</div>
        </div>

        <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
          <div className="text-slate-500 text-[10px]">-3 dB OCCUPIED BW</div>
          <div className="text-base font-bold text-sky-400 mt-0.5">
            {data?.bandwidth_3db?.bandwidth_hz ? `${(data.bandwidth_3db.bandwidth_hz / 1000).toFixed(2)} kHz` : 'Estimating'}
          </div>
          <div className="text-[10px] text-slate-500">-3 dB Power Threshold</div>
        </div>

        <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-[10px]">WINDOW FUNCTION</div>
            <select
              value={windowType}
              onChange={e => setWindowType(e.target.value)}
              className="mt-1 bg-[#0E121C] border border-[#1A2238] text-white px-2 py-1 rounded-xs text-xs focus:outline-hidden focus:border-sky-500"
            >
              <option value="hann">Hann</option>
              <option value="hamming">Hamming</option>
              <option value="blackman">Blackman</option>
              <option value="rectangular">Rectangular</option>
            </select>
          </div>

          <div>
            <div className="text-slate-500 text-[10px]">NFFT BINS</div>
            <select
              value={nfft}
              onChange={e => setNfft(e.target.value)}
              className="mt-1 bg-[#0E121C] border border-[#1A2238] text-white px-2 py-1 rounded-xs text-xs focus:outline-hidden focus:border-sky-500"
            >
              <option value="1024">1024</option>
              <option value="2048">2048</option>
              <option value="4096">4096</option>
              <option value="8192">8192</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plotly Chart Container */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-4 relative min-h-[520px] flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center font-mono text-xs text-sky-400">
            Computing FFT Power Spectrum...
          </div>
        )}
        {error ? (
          <div className="text-rose-400 font-mono text-sm">{error}</div>
        ) : (
          <Plot
            data={[
              {
                x: xData,
                y: yData,
                type: 'scatter',
                mode: 'lines',
                line: { color: '#0EA5E9', width: 1.5 },
                name: 'PSD (dBFS)',
              },
              ...(data?.noise_floor_db !== undefined ? [{
                x: [xData[0], xData[xData.length - 1]],
                y: [data.noise_floor_db, data.noise_floor_db],
                type: 'scatter',
                mode: 'lines',
                line: { color: '#64748B', width: 1, dash: 'dash' },
                name: `Noise Floor (${data.noise_floor_db.toFixed(1)} dBFS)`,
              }] : []),
            ]}
            layout={{
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              font: { color: '#94A3B8', family: 'JetBrains Mono, monospace', size: 11 },
              xaxis: {
                title: 'Frequency (Hz)',
                gridcolor: '#161F30',
                zerolinecolor: '#2A364F',
                tickformat: '~s',
              },
              yaxis: {
                title: 'Magnitude (dBFS)',
                gridcolor: '#161F30',
                zerolinecolor: '#2A364F',
              },
              margin: { t: 30, r: 30, b: 50, l: 60 },
              legend: { orientation: 'h', y: 1.1, x: 0 },
              hovermode: 'closest',
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '480px' }}
            config={{ responsive: true, displayModeBar: true, displaylogo: false }}
          />
        )}
      </div>
    </div>
  );
}
