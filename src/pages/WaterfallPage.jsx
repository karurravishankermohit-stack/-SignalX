import React, { useEffect, useState } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { getWaterfall } from '../lib/api';
import Plot from 'react-plotly.js';
import SourceBadge from '../components/analysis/SourceBadge';
import { Activity, RefreshCw } from 'lucide-react';

export default function WaterfallPage() {
  const { sessionId } = useSignalStore();
  const [data, setData] = useState(null);
  const [nperseg, setNperseg] = useState('256');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWaterfall = () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    getWaterfall(sessionId, parseInt(nperseg))
      .then(setData)
      .catch(e => setError(e.message || 'Failed to compute waterfall spectrogram'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWaterfall();
  }, [sessionId, nperseg]);

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
            DSP STAGE 06 / 17
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">STFT Waterfall Spectrogram</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Short-Time Fourier Transform 2D matrix mapping signal frequency evolution across time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceBadge source={data?.data_source || 'REAL_ANALYSIS'} />
          <button
            onClick={fetchWaterfall}
            disabled={loading}
            className="p-2 bg-[#0E121C] border border-[#1A2238] hover:border-sky-500 rounded-sm text-slate-300 transition-colors cursor-pointer"
            title="Recompute Waterfall"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Control Bar & Quick Readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
          <div className="text-slate-500 text-[10px]">TIME BINS</div>
          <div className="text-base font-bold text-white mt-0.5">
            {data?.n_time_bins || '--'}
          </div>
          <div className="text-[10px] text-slate-500">Temporal resolution</div>
        </div>

        <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
          <div className="text-slate-500 text-[10px]">FREQUENCY BINS</div>
          <div className="text-base font-bold text-sky-400 mt-0.5">
            {data?.n_freq_bins || '--'}
          </div>
          <div className="text-[10px] text-slate-500">Spectral resolution</div>
        </div>

        <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-[10px]">STFT SEGMENT LENGTH</div>
            <select
              value={nperseg}
              onChange={e => setNperseg(e.target.value)}
              className="mt-1 bg-[#0E121C] border border-[#1A2238] text-white px-2 py-1 rounded-xs text-xs focus:outline-hidden focus:border-sky-500"
            >
              <option value="128">128 samples (Fast time)</option>
              <option value="256">256 samples (Balanced)</option>
              <option value="512">512 samples (High freq res)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plotly Heatmap Container */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-4 relative min-h-[520px] flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center font-mono text-xs text-sky-400">
            Computing STFT 2D Spectrogram...
          </div>
        )}
        {error ? (
          <div className="text-rose-400 font-mono text-sm">{error}</div>
        ) : data?.intensities ? (
          <Plot
            data={[
              {
                z: data.intensities,
                x: data.freqs,
                y: data.times,
                type: 'heatmap',
                colorscale: 'Viridis',
                colorbar: {
                  title: { text: 'dBFS', side: 'right' },
                  tickfont: { color: '#94A3B8', family: 'JetBrains Mono, monospace' },
                },
              },
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
                title: 'Time (seconds)',
                gridcolor: '#161F30',
                zerolinecolor: '#2A364F',
              },
              margin: { t: 20, r: 20, b: 50, l: 60 },
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '480px' }}
            config={{ responsive: true, displayModeBar: true, displaylogo: false }}
          />
        ) : (
          <div className="text-slate-500 font-mono text-xs">No spectrogram data available</div>
        )}
      </div>
    </div>
  );
}
