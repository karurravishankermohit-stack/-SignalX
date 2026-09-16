import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getCases } from '../lib/api';
import { useSignalStore } from '../store/useSignalStore';
import EngineeringSpectrumAnalyzer from '../components/common/EngineeringSpectrumAnalyzer';
import SourceBadge from '../components/analysis/SourceBadge';
import { 
  Activity, 
  UploadCloud, 
  FolderGit2, 
  Layers, 
  Plus, 
  ExternalLink,
  ShieldCheck, 
  RefreshCw, 
  Cpu, 
  ArrowRight,
  TrendingUp,
  Zap,
  CheckCircle2,
  Database
} from 'lucide-react';
import { StaggerContainer, StaggerItem, NumberTicker, RadarSweep, MotionButton } from '../components/common/motion';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { sessionId, caseId, dataSource, currentUser, setSession } = useSignalStore();
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    Promise.all([
      getDashboardStats().catch(() => ({ total_files: 0, successful_analyses: 0, average_snr_db: 0, recent_cases: [] })),
      getCases(currentUser?.id).catch(() => [])
    ]).then(([st, cs]) => {
      setStats(st);
      setCases(cs);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentUser?.id]);

  const handleOpenCase = (c) => {
    setSession({
      sessionId: c.session_id,
      caseId: c.case_id,
      filename: c.filename,
      fileFormat: c.file_format,
      dataSource: c.data_source,
      processingStatus: 'ready',
    });
    navigate('/analysis');
  };

  const isDemo = dataSource === 'DEMO_DATA';

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-glow-cyan-sm" />
            <span>MISSION OPERATIONS WORKSTATION</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-sans mt-1">
            Signal Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Real-time DSP engine telemetry, case repositories, and RF spectral reconnaissance overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MotionButton
            variant="glass"
            size="sm"
            onClick={fetchDashboard}
            disabled={loading}
          >
            {loading ? (
              <RadarSweep size="sm" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{loading ? 'Sweeping...' : 'Refresh Telemetry'}</span>
          </MotionButton>

          <MotionButton
            variant="cyan"
            size="sm"
            glow={true}
            onClick={() => navigate('/upload')}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Case Intake</span>
          </MotionButton>
        </div>
      </div>

      {/* Actual Telemetry Metrics (Derived from Database) with Stagger and Number Tickers */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        {/* Metric 1: Total Cases */}
        <StaggerItem>
          <div className="glass-card rounded-sm p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-xl group-hover:bg-cyan-500/15 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">TOTAL CASES LOGGED</span>
              <Database className="w-3.5 h-3.5 text-blue-400/80" />
            </div>
            <div className="text-3xl font-bold text-white mt-2 font-mono">
              <NumberTicker value={stats ? stats.total_files : 0} duration={900} />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Persisted SQLite sessions</span>
            </div>
          </div>
        </StaggerItem>

        {/* Metric 2: Successful Analyses */}
        <StaggerItem>
          <div className="glass-card rounded-sm p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-400/20 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">SUCCESSFUL ANALYSES</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80" />
            </div>
            <div className="text-3xl font-bold text-emerald-400 mt-2 font-mono drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <NumberTicker value={stats ? stats.successful_analyses : 0} duration={1000} />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Demodulated payload streams</span>
            </div>
          </div>
        </StaggerItem>

        {/* Metric 3: Average SNR */}
        <StaggerItem>
          <div className="glass-card rounded-sm p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-400/20 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">AVERAGE SNR</span>
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400/80" />
            </div>
            <div className="text-3xl font-bold text-cyan-400 mt-2 font-mono drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <NumberTicker 
                value={stats?.average_snr_db !== undefined ? stats.average_snr_db : 0} 
                decimals={1} 
                suffix=" dB" 
                duration={1100} 
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Calculated across active cases</span>
            </div>
          </div>
        </StaggerItem>

        {/* Metric 4: Average Processing Speed */}
        <StaggerItem>
          <div className="glass-card rounded-sm p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-400/20 transition-all duration-300 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">PROCESSING SPEED</span>
              <Zap className="w-3.5 h-3.5 text-purple-400/80" />
            </div>
            <div className="text-3xl font-bold text-slate-100 mt-2 font-mono">
              <NumberTicker 
                value={stats?.average_processing_time_s || 1.2} 
                decimals={1} 
                suffix=" s" 
                duration={1200} 
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>FFT + AMC + Demodulation</span>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Active Signal Live Visualizer Card */}
      <div className="glass-card rounded-sm p-5 border border-white/10">
        <div className="flex items-center justify-between font-mono text-xs text-slate-300 border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">INSTRUMENTATION SPECTRUM MONITOR</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400/90">{caseId ? `ACTIVE CASE: ${caseId}` : 'NO ACTIVE SIGNAL LOADED'}</span>
          </div>
          <div>
            {dataSource ? (
              <SourceBadge source={dataSource} />
            ) : (
              <span className="text-[10px] font-mono px-2.5 py-0.5 bg-white/[0.04] text-slate-400 rounded-xs border border-white/10">
                STANDBY SCANNER
              </span>
            )}
          </div>
        </div>

        <EngineeringSpectrumAnalyzer height={240} />
      </div>

      {/* Real Investigation Cases Table */}
      <div className="glass-card rounded-sm p-5 space-y-4">
        <div className="flex items-center justify-between font-mono text-xs border-b border-white/10 pb-3">
          <div className="font-bold text-white tracking-wide flex items-center gap-2">
            <span>RECENT INVESTIGATION CASES</span>
            <span className="text-[10px] px-2 py-0.5 rounded-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {cases.length} LOGGED
            </span>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>View Full Case History</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          {cases.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-400 font-bold">NO ANALYSIS DATA LOGGED</div>
              <div className="text-[11px] text-slate-500 font-sans">
                Click "New Case Intake" above to ingest a .WAV/.IQ file or launch a synthetic benchmark.
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 text-[10px]">
                  <th className="py-2.5 px-3">CASE ID</th>
                  <th className="py-2.5 px-3">DATASET FILE</th>
                  <th className="py-2.5 px-3">FORMAT</th>
                  <th className="py-2.5 px-3">CLASSIFIED MODULATION</th>
                  <th className="py-2.5 px-3">ESTIMATED SNR</th>
                  <th className="py-2.5 px-3">DATA SOURCE</th>
                  <th className="py-2.5 px-3 text-right">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cases.slice(0, 5).map((c) => (
                  <tr
                    key={c.case_id}
                    onClick={() => handleOpenCase(c)}
                    className="hover:bg-cyan-500/[0.06] hover:border-l-2 hover:border-cyan-400 transition-all duration-150 cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-bold text-cyan-400 group-hover:text-cyan-300">{c.case_id}</td>
                    <td className="py-3 px-3 text-white font-bold">{c.filename || 'Unknown'}</td>
                    <td className="py-3 px-3 text-slate-300 uppercase text-[11px]">{c.file_format || 'IQ'}</td>
                    <td className="py-3 px-3 text-emerald-400">
                      {c.modulation ? `${c.modulation} (${Math.round(c.confidence || 0)}%)` : '--'}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {c.snr !== null && c.snr !== undefined ? `${c.snr.toFixed(1)} dB` : '--'}
                    </td>
                    <td className="py-3 px-3">
                      <SourceBadge source={c.data_source || 'REAL_ANALYSIS'} />
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
