import React from 'react';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#06080D] border-t border-[#1E2638] text-slate-400 text-xs font-mono py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#1E2638]">
          {/* Brand & Platform Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-xs bg-[#131826] border border-[#2C374E] flex items-center justify-center text-sky-400">
                <Activity className="w-3 h-3" />
              </div>
              <span className="font-bold text-sm text-white tracking-wider">
                SIGNALX
              </span>
              <span className="text-[10px] text-slate-400 px-1.5 py-0.2 bg-[#0E121C] border border-[#1E2638] rounded-xs">
                SignalX v1.0
              </span>
            </div>
            <p className="text-slate-400 font-sans text-xs max-w-lg leading-relaxed">
              Automated RF Signal Intelligence & Analysis Platform. Transforming raw .IQ and .WAV transmissions into explainable DSP parameters, digital demodulation, and verified bitstream intelligence.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300">
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#trust" className="hover:text-white transition-colors">Documentation</a>
            <a href="/demo" className="hover:text-emerald-400 transition-colors">Demo</a>
            <a href="/dashboard" className="hover:text-sky-400 transition-colors">Workstation</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <div>
            SIH 2026 • Problem Statement: SIH26147 • National Technical Research Organisation (NTRO)
          </div>
          <div className="flex items-center gap-4">
            <a href="/homepage-variations" className="text-sky-400 hover:underline">
              [ Homepage Design Lab ]
            </a>
            <span>© {new Date().getFullYear()} SignalX</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
