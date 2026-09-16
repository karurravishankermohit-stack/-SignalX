import React from 'react';
import GoogleLoginButton from '../common/GoogleLoginButton';
import { ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-16 border-b border-[#1E2638] bg-[#0A0D15]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs bg-[#0E121C] border border-[#1E2638] text-slate-400 font-mono text-xs">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span>PRODUCTION RF WORKSTATION • SIH26147</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
          Ready to Analyze a Signal?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
          Upload IQ/WAV data and move from raw samples to explainable signal intelligence, verified demodulation, and error-corrected bitstreams.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
          <GoogleLoginButton size="lg" variant="primary" label="START ANALYSIS" className="w-full sm:w-auto" />
          <a
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xs font-mono text-xs font-semibold text-slate-200 bg-[#0E121C] hover:bg-[#161C2B] border border-[#1E2638] hover:border-[#2C374E] transition-colors"
          >
            <span>Launch Demo Station</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        <div className="pt-2 flex items-center justify-center gap-4 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Secure analyst access via Google
          </span>
          <span>•</span>
          <span>FastAPI + NumPy/SciPy Engine</span>
        </div>
      </div>
    </section>
  );
}
