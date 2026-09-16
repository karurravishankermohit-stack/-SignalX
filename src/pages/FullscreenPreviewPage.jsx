import React, { useState } from 'react';
import { DIRECTION_COMPONENTS } from '../components/variations';
import { useHomepageSelection } from '../context/HomepageSelectionContext';
import ApplyConfirmationModal from '../components/selector/ApplyConfirmationModal';
import { ArrowLeft, Monitor, Tablet, Smartphone, Check, Sparkles } from 'lucide-react';

export default function FullscreenPreviewPage({ directionId = 'cinematic' }) {
  const {
    directions,
    appliedDirectionId,
    selectedDirectionId,
    selectDirection,
    openApplyConfirmation,
    toastMessage,
  } = useHomepageSelection();

  // Normalize ID — support legacy numeric, old string IDs, and new premium IDs
  const normalizeId = (id) => {
    if (id === '1' || id === 1 || id === 'aerospace') return 'cinematic';
    if (id === '2' || id === 2 || id === 'rflab') return 'editorial';
    if (id === '3' || id === 3 || id === '4' || id === 4 || id === '5' || id === 5 || id === 'engineering') return 'mission';
    return id || 'cinematic';
  };

  const [currentId, setCurrentId] = useState(normalizeId(directionId));
  const [viewportMode, setViewportMode] = useState('desktop');

  const currentDir = directions.find(d => d.id === currentId) || directions[0];
  const ComponentToRender = DIRECTION_COMPONENTS[currentId] || DIRECTION_COMPONENTS.cinematic;

  const isSelected = selectedDirectionId === currentId;
  const isApplied = appliedDirectionId === currentId;

  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'max-w-[768px] mx-auto border-x border-[#1E2638] shadow-2xl my-4',
    mobile: 'max-w-[390px] mx-auto border-x border-[#1E2638] shadow-2xl my-4',
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-200 font-sans flex flex-col">
      {/* Top Floating Inspection Bar */}
      <div className="sticky top-0 z-50 bg-[#0A0D15]/95 border-b border-[#1E2638] px-4 py-2 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          {/* Left: Back Link & Direction Info */}
          <div className="flex items-center gap-3">
            <a
              href="/homepage-variations"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#131826] hover:bg-[#1C2438] text-slate-300 rounded-xs border border-[#1E2638] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>[ ← Back to Lab ]</span>
            </a>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-white font-bold">
                PREVIEW: {currentDir.name.toUpperCase()}
              </span>
              {isApplied && (
                <span className="text-[10px] text-emerald-400 font-bold bg-[#131E17] border border-emerald-800 px-1.5 py-0.2 rounded-xs">
                  CURRENTLY LIVE
                </span>
              )}
            </div>
          </div>

          {/* Center: Direction Switcher */}
          <div className="flex items-center gap-1 bg-[#05070B] p-1 rounded-xs border border-[#1E2638]">
            {directions.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setCurrentId(d.id)}
                className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer text-xs ${
                  currentId === d.id
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                [ {d.code} ]
              </button>
            ))}
          </div>

          {/* Viewport Toggles */}
          <div className="hidden lg:flex items-center gap-1 bg-[#05070B] p-1 rounded-xs border border-[#1E2638]">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1 rounded-xs ${viewportMode === 'desktop' ? 'bg-[#131826] text-sky-400' : 'text-slate-500'}`}
              title="Desktop 100%"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1 rounded-xs ${viewportMode === 'tablet' ? 'bg-[#131826] text-sky-400' : 'text-slate-500'}`}
              title="Tablet 768px"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1 rounded-xs ${viewportMode === 'mobile' ? 'bg-[#131826] text-sky-400' : 'text-slate-500'}`}
              title="Mobile 390px"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Select & Apply Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => selectDirection(currentId)}
              className={`px-3 py-1 rounded-xs font-bold transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#131826] text-sky-400 border border-sky-500'
                  : 'bg-[#131826] hover:bg-[#1C2438] text-slate-300 border border-[#1E2638]'
              }`}
            >
              {isSelected ? '✓ SELECTED' : '[ SELECT ]'}
            </button>

            <button
              type="button"
              onClick={() => openApplyConfirmation(currentId)}
              className="px-3.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xs cursor-pointer"
            >
              APPLY TO HOMEPAGE
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className={`flex-1 ${viewportWidths[viewportMode]}`}>
        <ComponentToRender />
      </div>

      {/* Confirmation Modal */}
      <ApplyConfirmationModal />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#0E121C] border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-xs font-mono text-xs flex items-center gap-2 shadow-2xl">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
