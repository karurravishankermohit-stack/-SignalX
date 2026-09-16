import React, { useState } from 'react';
import { useHomepageSelection } from '../context/HomepageSelectionContext';
import { DIRECTION_COMPONENTS } from '../components/variations';
import ApplyConfirmationModal from '../components/selector/ApplyConfirmationModal';

const DIRECTION_PREVIEWS = {
  cinematic: {
    accent: '#0EA5E9',
    heroText: 'READ THE SIGNAL.',
    heroSub: 'Cinematic RF — Immersive, full-viewport signal visualization with scroll-driven storytelling.',
    panels: ['FFT SPECTRUM', 'SCROLL STORY', 'CONSTELLATION', 'HONESTY MATRIX'],
  },
  editorial: {
    accent: '#10B981',
    heroText: 'FROM RAW SIGNAL TO INTELLIGENCE.',
    heroSub: 'Editorial Engineering — Extreme typography, large whitespace, interactive capability browser.',
    panels: ['CAPABILITY BROWSER', 'PIPELINE DIAGRAM', 'PARAMETER TABLE', 'PRINCIPLES'],
  },
  mission: {
    accent: '#F59E0B',
    heroText: 'MISSION CONTROL.',
    heroSub: 'Mission Control — Dense multi-panel ops center with live instruments, analysis log, classifier.',
    panels: ['SPECTRUM PANEL', 'WATERFALL', 'ANALYSIS LOG', 'CLASSIFIER'],
  },
};

function DirectionCard({ direction, isSelected, isApplied, onSelect, onPreview, onApply }) {
  const preview = DIRECTION_PREVIEWS[direction.id];
  const accent = preview?.accent || '#0EA5E9';

  return (
    <div
      className={`relative flex flex-col border rounded-sm transition-all cursor-pointer ${
        isSelected
          ? 'border-[#0EA5E9]/60 bg-[#0B1420]'
          : 'border-[#1A2238] bg-[#090C13] hover:border-[#253044]'
      }`}
      onClick={() => onSelect(direction.id)}
    >
      {/* Applied badge */}
      {isApplied && (
        <div className="absolute top-3 right-3 font-mono text-[8px] px-1.5 py-0.5 bg-emerald-900/70 border border-emerald-700 text-emerald-400 rounded-xs z-10">
          LIVE
        </div>
      )}

      {/* Static preview block */}
      <div
        className="p-6 border-b border-[#1A2238] min-h-[180px] flex flex-col justify-between bg-[#06080D] rounded-t-sm"
        style={{ borderTop: `3px solid ${accent}` }}
      >
        <div>
          <div className="font-mono text-[9px] mb-3" style={{ color: accent }}>
            {direction.num} / DIRECTION — {direction.code}
          </div>
          <div
            className="editorial-heading text-white mb-4"
            style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', lineHeight: 1 }}
          >
            {preview?.heroText}
          </div>
        </div>

        {/* Mini panels grid */}
        <div className="grid grid-cols-2 gap-1">
          {preview?.panels.map((p) => (
            <div key={p} className="font-mono text-[7px] px-1.5 py-1 bg-[#0A0E18] border border-[#1A2238] text-slate-500">
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* Direction info */}
      <div className="p-5 flex-1">
        <div className="font-mono font-bold text-sm text-white mb-1.5">{direction.name}</div>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">{preview?.heroSub}</p>
        <div className="space-y-1 mb-5">
          {direction.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <span style={{ color: accent }} className="mt-0.5 shrink-0">→</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <a
          href={`/preview/${direction.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 font-mono text-[10px] font-semibold border border-[#253044] hover:border-slate-500 text-slate-300 rounded-xs transition-colors"
        >
          FULLSCREEN PREVIEW
        </a>
        <button
          onClick={(e) => { e.stopPropagation(); onApply(direction.id); }}
          className={`flex-1 px-3 py-2 font-mono text-[10px] font-semibold rounded-xs transition-colors border ${
            isApplied
              ? 'border-emerald-700 text-emerald-400 bg-emerald-900/30'
              : `border-transparent text-[#06080D] bg-[${accent}] hover:opacity-90`
          }`}
          style={!isApplied ? { background: accent, color: '#06080D' } : {}}
        >
          {isApplied ? '✓ APPLIED' : 'APPLY AS HOMEPAGE'}
        </button>
      </div>
    </div>
  );
}

export default function HomepageVariationsPage() {
  const {
    directions,
    appliedDirectionId,
    selectedDirectionId,
    selectDirection,
    openApplyConfirmation,
    isConfirmModalOpen,
    toastMessage,
  } = useHomepageSelection();

  return (
    <div className="min-h-screen bg-[#06080D] text-slate-200 font-sans">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#06080D]/95 border-b border-[#1A2238] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to Homepage
            </a>
            <span className="text-[#1A2238]">|</span>
            <div>
              <div className="editorial-label text-[#0EA5E9]">DESIGN LAB</div>
            </div>
          </div>
          <div className="font-mono text-[9px] text-slate-500 hidden sm:block">
            LIVE: <span className="text-emerald-400 font-bold uppercase">{appliedDirectionId}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">

        {/* Page header */}
        <div className="mb-12">
          <div className="editorial-label text-[#0EA5E9] mb-4">SIGNALX / HOMEPAGE DESIGN LAB</div>
          <h1 className="editorial-heading text-[clamp(32px,5vw,64px)] text-white mb-4">
            THREE ART DIRECTIONS.
          </h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            Select a homepage art direction, preview it fullscreen, and apply it as the public homepage.
            Each direction is a genuinely different visual language — not a color swap.
          </p>
        </div>

        {/* Direction cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {directions.map((dir) => (
            <DirectionCard
              key={dir.id}
              direction={dir}
              isSelected={selectedDirectionId === dir.id}
              isApplied={appliedDirectionId === dir.id}
              onSelect={selectDirection}
              onPreview={(id) => window.location.href = `/preview/${id}`}
              onApply={openApplyConfirmation}
            />
          ))}
        </div>

        {/* Comparison table */}
        <div className="border border-[#1A2238] rounded-sm overflow-hidden">
          <div className="bg-[#090C13] border-b border-[#1A2238] px-5 py-3">
            <div className="font-mono text-xs font-bold text-slate-300">DIRECTION COMPARISON</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1A2238] bg-[#06080D]">
                  <th className="px-5 py-3 text-left text-slate-500">Attribute</th>
                  {directions.map((d) => (
                    <th key={d.id} className="px-5 py-3 text-left text-slate-300">{d.code}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { attr: 'Visual language', vals: ['Cinematic / Immersive', 'Editorial / Sparse', 'Dense / Technical'] },
                  { attr: 'Typography scale', vals: ['Massive editorial', 'Extreme hierarchy', 'Compact precision'] },
                  { attr: 'Hero treatment', vals: ['Full spectrum canvas', 'Pure typography', 'Multi-panel ops'] },
                  { attr: 'Visualization style', vals: ['Full-width + interactive', 'Inline contextual', 'Multi-panel live'] },
                  { attr: 'Information density', vals: ['Low / impactful', 'Medium / deliberate', 'High / dense'] },
                  { attr: 'Motion', vals: ['Entrance + scroll story', 'Fade-in entrance', 'Live canvas animation'] },
                ].map(({ attr, vals }, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-[#06080D]' : 'bg-[#090C13]'}>
                    <td className="px-5 py-2.5 text-slate-400">{attr}</td>
                    {vals.map((v, j) => (
                      <td key={j} className="px-5 py-2.5 text-slate-300">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals & Toast */}
      {isConfirmModalOpen && <ApplyConfirmationModal />}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-emerald-900/90 border border-emerald-700 text-emerald-300 font-mono text-xs rounded-sm shadow-lg">
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
}
