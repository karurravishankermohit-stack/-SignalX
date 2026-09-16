import React, { useState } from 'react';
import { Activity, Menu, X } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';
import { useHomepageSelection } from '../../context/HomepageSelectionContext';
import { useSignalStore } from '../../store/useSignalStore';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { appliedVariationId } = useHomepageSelection();
  const backendOnline = useSignalStore(s => s.backendOnline);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#080A0F]/95 border-b border-[#1E2638] text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Left */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-xs bg-[#131826] border border-[#2C374E] flex items-center justify-center text-sky-400 group-hover:border-sky-500/60 transition-colors">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-sm tracking-wider text-white">
                    SIGNALX
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded-xs bg-[#131826] text-slate-400 border border-[#1E2638]">
                    v1.0
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest -mt-0.5">
                  RF SIGNAL INTELLIGENCE
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-mono text-slate-300">
              <a href="#platform" className="hover:text-white transition-colors">
                Platform
              </a>
              <a href="#pipeline" className="hover:text-white transition-colors">
                Analysis
              </a>
              <a href="#capabilities" className="hover:text-white transition-colors">
                Capabilities
              </a>
              <a href="/demo" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Demo
              </a>
              <a href="#trust" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a
                href="/homepage-variations"
                className="text-sky-400 hover:text-sky-300 font-semibold px-2 py-0.5 rounded-xs bg-[#131826] border border-[#1E2638] hover:border-[#2C374E] transition-colors"
                title="View and apply homepage design directions"
              >
                [ Design Lab ]
              </a>
            </nav>
          </div>

          {/* Right Header Status & CTA */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Real System Status */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 px-2.5 py-1 rounded-xs bg-[#0E121C] border border-[#1E2638]">
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-[#10B981]' : 'bg-[#F87171]'}`} />
              <span className="text-[11px] text-slate-300">{backendOnline ? 'SYSTEM READY' : 'OFFLINE'}</span>
            </div>

            <GoogleLoginButton size="sm" variant="primary" />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <a
              href="/homepage-variations"
              className="text-[10px] font-mono text-sky-400 px-2 py-1 bg-[#131826] border border-[#1E2638] rounded-xs"
            >
              Lab
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xs focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#1E2638] space-y-2 bg-[#080A0F] font-mono text-xs">
            <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-300 hover:text-white">
              Platform
            </a>
            <a href="#pipeline" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-300 hover:text-white">
              Analysis Pipeline
            </a>
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-300 hover:text-white">
              Capabilities
            </a>
            <a href="/demo" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-emerald-400">
              Demo Station
            </a>
            <a href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sky-400">
              Analyst Workstation
            </a>
            <a href="/homepage-variations" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-amber-400">
              Homepage Design Lab
            </a>
            <div className="pt-2 border-t border-[#1E2638]">
              <GoogleLoginButton size="sm" className="w-full" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
