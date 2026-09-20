import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { checkHealth, loadDemo } from '../lib/api';

export const useSignalStore = create(
  persist(
    (set, get) => ({
      // User / Auth
      currentUser: {
        id: 'eval-guest-001',
        name: 'Local Evaluator (Offline Demo Mode)',
        email: 'evaluator@signalx.local',
        role: 'Offline Evaluation Guest',
        mode: 'DEMO/OFFLINE EVALUATION MODE'
      },
      setCurrentUser: (user) => set({ currentUser: user }),

      // Session
      sessionId: null,
      caseId: null,
      filename: null,
      fileFormat: null,
      dataSource: null, // 'REAL_ANALYSIS' | 'DEMO_DATA'
      processingStatus: 'idle', // idle | uploading | processing | complete | error

      // Backend status
      backendOnline: true,
      backendStatus: 'ONLINE', // 'ONLINE' | 'OFFLINE' | 'PROCESSING' | 'ERROR'
      backendChecked: true,

      // Analysis results
      quality: null,
      spectrum: null,
      waterfall: null,
      parameters: null,
      modulation: null,
      constellation: null,
      demodulation: null,
      interleaving: null,
      deinterleaved: null,
      fec: null,
      fecDecoded: null,
      bitstream: null,
      correlation: null,
      report: null,

      // Actions
      setSession: (data) => set(data),
      setBackendOnline: (v) => set({ 
        backendOnline: v, 
        backendStatus: v ? 'ONLINE' : 'OFFLINE',
        backendChecked: true 
      }),
      setResult: (key, data) => set({ [key]: data }),
      
      checkBackendStatus: async () => {
        set({ backendStatus: 'CONNECTING' });
        try {
          const isAlive = await checkHealth();
          set({
            backendOnline: isAlive,
            backendStatus: isAlive ? 'ONLINE' : 'OFFLINE',
            backendChecked: true
          });
          return isAlive;
        } catch {
          set({
            backendOnline: false,
            backendStatus: 'OFFLINE',
            backendChecked: true
          });
          return false;
        }
      },

      ensureDemoSession: async (signalType = 'QPSK') => {
        const currentSid = get().sessionId;
        if (currentSid) return currentSid;
        try {
          const res = await loadDemo(signalType);
          const sid = res.session_id || res.sessionId;
          const cid = res.case_id || res.caseId;
          const r = res.results || {};
          set({
            sessionId: sid,
            caseId: cid,
            filename: `demo_${signalType.toLowerCase()}.iq`,
            fileFormat: 'iq',
            dataSource: 'DEMO_DATA',
            processingStatus: 'ready',
            modulation: r.modulation || null,
            demodulation: r.demodulation || null,
            quality: r.quality || null,
            parameters: r.parameters || null,
            interleaving: r.interleaving || null,
            fec: r.fec || null,
            spectrum: r.spectrum || null,
            waterfall: r.waterfall || null,
            constellation: r.constellation || null,
            bitstream: r.demodulation?.bits || null,
            correlation: r.correlation || null,
            report: r.report || null
          });
          return sid;
        } catch (err) {
          console.error('Failed to auto-seed demo session:', err);
          return null;
        }
      },

      reset: () => set({
        sessionId: null,
        caseId: null,
        filename: null,
        fileFormat: null,
        dataSource: null,
        processingStatus: 'idle',
        quality: null,
        spectrum: null,
        waterfall: null,
        parameters: null,
        modulation: null,
        constellation: null,
        demodulation: null,
        interleaving: null,
        deinterleaved: null,
        fec: null,
        fecDecoded: null,
        bitstream: null,
        correlation: null,
        report: null
      }),
    }),
    {
      name: 'signalx-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        sessionId: state.sessionId,
        caseId: state.caseId,
        filename: state.filename,
        fileFormat: state.fileFormat,
        dataSource: state.dataSource,
        quality: state.quality,
        parameters: state.parameters,
        modulation: state.modulation,
        demodulation: state.demodulation,
        interleaving: state.interleaving,
        fec: state.fec,
        spectrum: state.spectrum,
        waterfall: state.waterfall,
        constellation: state.constellation,
        correlation: state.correlation,
        report: state.report
      }),
    }
  )
);
