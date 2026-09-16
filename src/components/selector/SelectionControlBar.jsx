import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Home, Eye } from 'lucide-react';
import { useHomepageSelection } from '../../context/HomepageSelectionContext';

export default function SelectionControlBar() {
  const {
    appliedVariationId,
    selectedVariationId,
    activeVariation,
    selectedVariation,
    openApplyConfirmation,
  } = useHomepageSelection();

  const isSelectedDifferentFromApplied = selectedVariationId !== appliedVariationId;

  return (
    <div className="bg-signalx-panel/95 backdrop-blur-md border-b border-cyan-500/30 sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Design Lab Title & Context */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="font-mono text-lg sm:text-xl font-bold text-white tracking-wider">
                SIGNAL<span className="text-cyan-400">X</span> HOMEPAGE DESIGN LAB
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hidden sm:inline">
                5 DESIGN VARIATIONS
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Compare 5 visual directions. Inspect fullscreens, stage your choice with <strong className="text-white">SELECT</strong>, then click <strong className="text-emerald-400">APPLY</strong> to confirm.
            </p>
          </div>

          {/* Right: State Readouts & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Active Pill */}
            <div className="px-3 py-1.5 rounded bg-signalx-dark border border-signalx-border font-mono text-xs flex items-center gap-2">
              <span className="text-slate-500">LIVE HOMEPAGE:</span>
              <span className="text-emerald-400 font-bold">
                V0{appliedVariationId} ({activeVariation.name})
              </span>
              <a
                href="/"
                className="text-cyan-400 hover:text-cyan-300 ml-1 underline underline-offset-2 flex items-center gap-1"
                title="View current public homepage"
              >
                <Home className="w-3 h-3" />
                <span className="text-[11px]">View Live</span>
              </a>
            </div>

            {/* Staged Selection Pill */}
            <div className={`px-3 py-1.5 rounded font-mono text-xs flex items-center gap-2 border ${
              isSelectedDifferentFromApplied
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 shadow-cyan-glow-sm'
                : 'bg-signalx-dark text-slate-300 border-signalx-border'
            }`}>
              <span className="text-slate-400">STAGE SELECTION:</span>
              <span className="font-bold text-white">
                V0{selectedVariationId} ({selectedVariation.name})
              </span>
            </div>

            {/* Fullscreen Preview Shortcut for current selection */}
            <a
              href={`/preview/${selectedVariationId}`}
              className="px-3.5 py-2 rounded bg-signalx-card hover:bg-signalx-cardHover text-slate-200 border border-slate-700 hover:border-slate-500 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fullscreen</span>
            </a>

            {/* Apply Button */}
            <button
              type="button"
              onClick={() => openApplyConfirmation(selectedVariationId)}
              disabled={!isSelectedDifferentFromApplied}
              className={`px-4 py-2 rounded font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isSelectedDifferentFromApplied
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/50 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSelectedDifferentFromApplied
                  ? `APPLY VARIATION 0${selectedVariationId} TO HOMEPAGE`
                  : 'VARIATION IS CURRENTLY LIVE'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
