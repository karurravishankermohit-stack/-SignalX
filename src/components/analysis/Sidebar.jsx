import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSignalStore } from '../../store/useSignalStore';
import {
  LayoutDashboard,
  UploadCloud,
  Layers,
  Activity,
  Waves,
  ScatterChart,
  SlidersHorizontal,
  Cpu,
  Binary,
  SplitSquareVertical,
  ShieldAlert,
  FileCode,
  Crosshair,
  FileText,
  Clock,
  Settings,
  LogOut,
  Radio
} from 'lucide-react';

import { signOutFirebase } from '../../lib/firebase';
import { logoutUser } from '../../lib/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const { sessionId, currentUser, setCurrentUser, reset } = useSignalStore();
  const disabledClass = "opacity-40 cursor-not-allowed pointer-events-none";

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, reqSession: false },
    { to: '/upload', label: 'Ingestion & Upload', icon: UploadCloud, reqSession: false },
    { to: '/analysis', label: 'Analysis Pipeline', icon: Layers, reqSession: true },
    { to: '/spectrum', label: 'FFT Spectrum', icon: Activity, reqSession: true },
    { to: '/waterfall', label: 'STFT Waterfall', icon: Waves, reqSession: true },
    { to: '/constellation', label: 'I/Q Constellation', icon: ScatterChart, reqSession: true },
    { to: '/parameters', label: 'Parameters', icon: SlidersHorizontal, reqSession: true },
    { to: '/modulation', label: 'Modulation (AMC)', icon: Cpu, reqSession: true },
    { to: '/demodulation', label: 'Demodulation', icon: Binary, reqSession: true },
    { to: '/deinterleaving', label: 'De-interleaving', icon: SplitSquareVertical, reqSession: true },
    { to: '/fec', label: 'FEC Decoder', icon: ShieldAlert, reqSession: true },
    { to: '/bitstream', label: 'Bit Stream', icon: FileCode, reqSession: true },
    { to: '/correlation', label: 'Correlation', icon: Crosshair, reqSession: true },
    { to: '/reports', label: 'Intelligence Report', icon: FileText, reqSession: true },
    { to: '/history', label: 'Case History', icon: Clock, reqSession: false },
    { to: '/settings', label: 'Settings', icon: Settings, reqSession: false },
  ];

  const handleLogout = async () => {
    try {
      await signOutFirebase();
      await logoutUser();
    } catch (e) {
      // ignore
    }
    try {
      localStorage.removeItem('signalx_user_session');
    } catch (e) {
      // ignore
    }
    if (setCurrentUser) {
      setCurrentUser(null);
    }
    reset();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-[#070A14]/80 backdrop-blur-xl border-r border-white/10 flex flex-col h-full flex-shrink-0 select-none font-mono relative z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 rounded-xs flex items-center justify-center text-cyan-400 shadow-glow-cyan-sm">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-widest font-sans flex items-center gap-1.5">
              <span>SIGNALX</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider">NTRO SIH26147</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto text-xs">
        {links.map(l => {
          const Icon = l.icon;
          const isDisabled = l.reqSession && !sessionId;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent text-cyan-300 font-bold border-l-2 border-cyan-400 shadow-[inset_0_0_12px_rgba(0,240,255,0.08)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] hover:border-l-2 hover:border-cyan-500/40'
                } ${isDisabled ? disabledClass : ''}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{l.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Info */}
      <div className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-950 to-blue-900 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold shrink-0 shadow-glow-cyan-sm">
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'A'}
          </div>
          <div className="min-w-0 truncate">
            <div className="text-white font-bold truncate font-sans">{currentUser?.name || 'Analyst'}</div>
            <div className="text-[9px] text-cyan-400/80 truncate font-mono">{currentUser?.email || 'Authorized Analyst'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 hover:text-rose-400 hover:bg-rose-950/40 rounded-xs text-slate-400 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
