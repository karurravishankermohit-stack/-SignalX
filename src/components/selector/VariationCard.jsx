import React from 'react';
import { Eye, Check, Sparkles, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import RFVisualizerCanvas from '../common/RFVisualizerCanvas';
import ConstellationCanvas from '../common/ConstellationCanvas';
import OscilloscopeCanvas from '../common/OscilloscopeCanvas';

export default function VariationCard({
  variation,
  isSelected,
  isApplied,
  onSelect,
  onPreview,
  onApplyDirectly,
}) {
  // Mini visual preview tailored to the variation persona
  const renderMiniVisual = () => {
    switch (variation.id) {
      case 1:
        return (
          <div className="relative h-44 rounded bg-signalx-dark border border-cyan-500/30 overflow-hidden group/canvas">
            <RFVisualizerCanvas height={174} mode="fft" showLabel={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-signalx-dark via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono text-cyan-300">
              <span>COMMAND HUD</span>
              <span className="text-slate-400">FFT CASCADE</span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="relative h-44 rounded bg-signalx-dark border border-emerald-500/30 overflow-hidden">
            <OscilloscopeCanvas height={174} showLabel={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-signalx-dark via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono text-emerald-300">
              <span>OSCILLOSCOPE TRACE</span>
              <span className="text-slate-400">I/Q CHANNELS</span>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="relative h-44 rounded bg-[#030614] border border-blue-500/30 overflow-hidden">
            <ConstellationCanvas height={174} modulation="QPSK" showLabel={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-signalx-dark via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono text-blue-300">
              <span>POLAR CONSTELLATION</span>
              <span className="text-slate-400">QPSK PLANE</span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="relative h-44 rounded bg-[#06080F] border border-slate-700 p-3 font-mono text-[10px] text-slate-300 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-slate-500 text-[9px]">PIPELINE ARCHITECTURE</div>
              <div className="text-xs text-white font-bold">SIGNALX CORE</div>
              <div className="text-slate-400 truncate">IQ/WAV → DSP → FEC → BITS</div>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800 text-[9px] space-y-1">
              <div className="flex justify-between"><span>BER METRIC:</span> <span className="text-emerald-400">GROUND TRUTH</span></div>
              <div className="flex justify-between"><span>VITERBI RATE:</span> <span className="text-cyan-300">1/2 (k=7)</span></div>
            </div>
            <div className="text-[9px] text-slate-500 flex justify-between">
              <span>HIGH DENSITY</span>
              <span className="text-slate-400">STARK SLATE</span>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="relative h-44 rounded bg-[#040817] border border-amber-500/30 overflow-hidden">
            <RFVisualizerCanvas height={174} mode="waterfall" showLabel={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-signalx-dark via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-mono text-amber-300">
              <span>SAT DOWNLINK VIEWPORT</span>
              <span className="text-slate-400">437.5 MHz</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-signalx-panel ${
        isSelected
          ? 'border-cyan-400 shadow-2xl shadow-cyan-950/60 ring-2 ring-cyan-400/40'
          : 'border-signalx-border hover:border-slate-600 shadow-lg'
      }`}
    >
      {/* Card Header */}
      <div className="p-5 pb-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white">
              Variation 0{variation.id}
            </span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-semibold ${variation.accentBg} ${variation.accentText} ${variation.accentBorder}`}>
              {variation.badge}
            </span>
          </div>

          {/* Active / Selected Tag */}
          <div className="flex items-center gap-1">
            {isApplied && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> ACTIVE LIVE
              </span>
            )}
            {isSelected && !isApplied && (
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                ✓ SELECTED
              </span>
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="font-mono text-lg font-bold text-white mb-1">
          {variation.name}
        </h3>
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
          {variation.subtitle}
        </p>

        {/* Actual Live Rendered Preview Box */}
        <div className="mb-4">
          <div className="text-[10px] font-mono text-slate-400 uppercase mb-1.5 flex items-center justify-between">
            <span>HOMEPAGE PREVIEW (LIVE CANVAS)</span>
            <span className="text-amber-400">DEMO</span>
          </div>
          {renderMiniVisual()}
        </div>

        {/* Key Features Bullet List */}
        <div className="space-y-1.5 border-t border-signalx-border/60 pt-3 mb-4">
          {variation.keyFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[11px] font-mono text-slate-300">
              <span className="text-cyan-400 mt-0.5">›</span>
              <span className="leading-tight">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 pt-3 bg-signalx-dark/80 border-t border-signalx-border flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Fullscreen Preview Button */}
          <button
            type="button"
            onClick={() => onPreview(variation.id)}
            className="w-full py-2.5 px-3 rounded font-mono text-xs font-semibold text-slate-200 bg-signalx-card hover:bg-signalx-cardHover border border-slate-700 hover:border-slate-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>[ Preview ]</span>
          </button>

          {/* Select Design Button */}
          <button
            type="button"
            onClick={() => onSelect(variation.id)}
            className={`w-full py-2.5 px-3 rounded font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-cyan-glow-sm'
                : 'bg-signalx-panel hover:bg-slate-800 text-white border border-signalx-border hover:border-slate-600'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>✓ SELECTED</span>
              </>
            ) : (
              <span>[ SELECT DESIGN ]</span>
            )}
          </button>
        </div>

        {/* Quick Apply Button if selected */}
        {isSelected && !isApplied && (
          <button
            type="button"
            onClick={() => onApplyDirectly(variation.id)}
            className="w-full py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>APPLY VARIATION 0{variation.id} TO HOMEPAGE</span>
          </button>
        )}
      </div>
    </div>
  );
}
