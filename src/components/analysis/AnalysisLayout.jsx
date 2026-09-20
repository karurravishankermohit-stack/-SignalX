import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import DataModeBanner from './DataModeBanner';
import { PageTransition } from '../common/motion';
import { useSignalStore } from '../../store/useSignalStore';

export default function AnalysisLayout() {
  const location = useLocation();
  const sessionId = useSignalStore(s => s.sessionId);
  const checkBackendStatus = useSignalStore(s => s.checkBackendStatus);
  const ensureDemoSession = useSignalStore(s => s.ensureDemoSession);

  useEffect(() => {
    checkBackendStatus();
    const timer = setInterval(() => {
      checkBackendStatus();
    }, 8000);
    return () => clearInterval(timer);
  }, [checkBackendStatus]);

  useEffect(() => {
    if (!sessionId) {
      ensureDemoSession();
    }
  }, [sessionId, ensureDemoSession]);

  return (
    <div className="flex h-screen bg-abyss-mesh text-slate-100 overflow-hidden font-sans relative">
      {/* Subtle Aerospace Instrument Ambient Lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Glassmorphic Tactical Sidebar */}
      <Sidebar />

      {/* Primary Workstation Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <DataModeBanner />
        
        <main className="flex-1 overflow-auto p-6 relative">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

