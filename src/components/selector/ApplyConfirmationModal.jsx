import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useHomepageSelection } from '../../context/HomepageSelectionContext';

export default function ApplyConfirmationModal() {
  const {
    isConfirmModalOpen,
    pendingDirectionToApply,
    directions,
    closeApplyConfirmation,
    confirmApply,
  } = useHomepageSelection();

  if (!isConfirmModalOpen) return null;

  const targetDir = directions.find(d => d.id === pendingDirectionToApply) || directions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
      <div className="bg-[#0E121C] border border-[#2C374E] rounded-xs max-w-md w-full p-5 shadow-2xl relative text-left">
        <button
          onClick={closeApplyConfirmation}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-4">
          <div className="border-b border-[#1E2638] pb-2.5">
            <div className="text-[10px] text-sky-400 uppercase tracking-wider font-bold">
              HOMEPAGE APPLICATION CONFIRMATION
            </div>
            <h2 className="text-base font-bold text-white font-mono mt-0.5">
              Apply [ {targetDir.code} ] as Live Homepage?
            </h2>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            This will set <strong className="text-white font-mono">{targetDir.name}</strong> as the official public homepage for SignalX at <code className="text-sky-300 bg-[#05070B] px-1 py-0.5 rounded-xs">/</code>.
          </p>

          <div className="p-3 bg-[#05070B] border border-[#1E2638] rounded-xs text-[11px] text-slate-400 space-y-1">
            <div className="text-slate-300 font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              NON-DESTRUCTIVE APPLICATION
            </div>
            <div>• All backend DSP routines, APIs, and authentication remain untouched.</div>
            <div>• You can switch or test any direction anytime in the Design Lab.</div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E2638]">
            <button
              type="button"
              onClick={closeApplyConfirmation}
              className="px-3.5 py-1.5 bg-[#131826] hover:bg-[#1C2438] text-slate-300 text-xs font-semibold rounded-xs border border-[#1E2638] cursor-pointer"
            >
              [ Cancel ]
            </button>
            <button
              type="button"
              onClick={confirmApply}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xs cursor-pointer shadow-sm"
            >
              [ Apply Design ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
