import React, { useState } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { useNavigate } from 'react-router-dom';
import { User, Sliders, ShieldCheck, LogOut, Check, Save } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, reset } = useSignalStore();
  const [name, setName] = useState(currentUser?.name || 'NTRO Signal Intelligence Analyst');
  const [email, setEmail] = useState(currentUser?.email || 'analyst@ntro.gov.in');
  const [defaultWindow, setDefaultWindow] = useState('hann');
  const [defaultNfft, setDefaultNfft] = useState('2048');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      name,
      email,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    reset();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2238] pb-4">
        <div>
          <div className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
            PREFERENCES & PROFILE
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workstation Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure analyst identity, default DSP windowing parameters, and authenticated access.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-rose-300 rounded-sm text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Analyst Profile */}
        <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-sm border-b border-[#1A2238] pb-2">
            <User className="w-4 h-4 text-sky-400" />
            <span>ANALYST IDENTITY & CREDENTIALS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">OPERATOR NAME</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">AUTHORIZED EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                required
              />
            </div>
          </div>
        </div>

        {/* DSP Defaults */}
        <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-sm border-b border-[#1A2238] pb-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>DEFAULT DSP PARAMETERS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">DEFAULT FFT WINDOW</label>
              <select
                value={defaultWindow}
                onChange={e => setDefaultWindow(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
              >
                <option value="hann">Hann (Spectral resolution)</option>
                <option value="hamming">Hamming (Narrowband)</option>
                <option value="blackman">Blackman (High dynamic range)</option>
                <option value="rectangular">Rectangular (Transient analysis)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">DEFAULT FFT BINS (NFFT)</label>
              <select
                value={defaultNfft}
                onChange={e => setDefaultNfft(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
              >
                <option value="1024">1024 bins</option>
                <option value="2048">2048 bins (Default)</option>
                <option value="4096">4096 bins</option>
                <option value="8192">8192 bins (High fidelity)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Provenance */}
        <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6 space-y-2 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-sm border-b border-[#1A2238] pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SECURITY SPECIFICATION</span>
          </div>
          <div>• Zero client-side secret exposure: secrets are retained in backend environment.</div>
          <div>• Strict Data Provenance: All computed parameters are attributed to actual physical computation.</div>
          <div>• Session Isolation: SQLite metadata is partitioned by case identifier.</div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {saved && (
            <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences saved
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xs text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
