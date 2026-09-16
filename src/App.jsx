import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { HomepageSelectionProvider } from './context/HomepageSelectionContext';
import { onAuthChange, handleRedirectResult } from './lib/firebase';
import { loginWithFirebase } from './lib/api';
import { useSignalStore } from './store/useSignalStore';

// Existing pages
import HomePage from './pages/HomePage';
import HomepageVariationsPage from './pages/HomepageVariationsPage';
import FullscreenPreviewPage from './pages/FullscreenPreviewPage';
import DemoSandboxPage from './pages/DemoSandboxPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

// Analysis pages
import AnalysisLayout from './components/analysis/AnalysisLayout';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import SpectrumPage from './pages/SpectrumPage';
import WaterfallPage from './pages/WaterfallPage';
import ConstellationPage from './pages/ConstellationPage';
import ParametersPage from './pages/ParametersPage';
import ModulationPage from './pages/ModulationPage';
import DemodulationPage from './pages/DemodulationPage';
import DeinterleavePage from './pages/DeinterleavePage';
import FecPage from './pages/FecPage';
import BitstreamPage from './pages/BitstreamPage';
import CorrelationPage from './pages/CorrelationPage';
import ReportsPage from './pages/ReportsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

function FullscreenPreviewPageWrapper() {
  const { id } = useParams();
  return <FullscreenPreviewPage directionId={id} />;
}

export default function App() {
  const setCurrentUser = useSignalStore(s => s.setCurrentUser);

  useEffect(() => {
    // 1. Process Google redirect sign-in result if returning from accounts.google.com
    handleRedirectResult()
      .then(async (result) => {
        if (result?.firebaseUser) {
          const { firebaseUser, idToken } = result;
          let user = null;
          try {
            user = await loginWithFirebase(idToken);
          } catch (e) {
            console.warn('[SignalX Auth] Backend sync on redirect unavailable, establishing verified Firebase session');
          }
          if (!user) {
            user = {
              id: `usr_${firebaseUser.uid.substring(0, 12)}`,
              firebase_uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Analyst',
              photo_url: firebaseUser.photoURL || null,
              role: 'RF Intelligence Analyst',
              mode: 'firebase',
              session_token: idToken,
              clearance_level: 'SECRET // SIH-NTRO-2026',
              created_at: new Date().toISOString()
            };
          }
          setCurrentUser(user);
          try {
            localStorage.setItem('signalx_user_session', JSON.stringify({
              id: user.id,
              firebase_uid: user.firebase_uid,
              email: user.email,
              name: user.name,
              role: user.role,
              token: user.session_token,
              mode: user.mode
            }));
          } catch (_) {}
        }
      })
      .catch((err) => {
        console.error('[SignalX Auth] Error processing redirect auth:', err);
      });

    // 2. Auth state observer for session persistence across refreshes
    const unsubscribe = onAuthChange(async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          let user = null;
          try {
            user = await loginWithFirebase(idToken);
          } catch (err) {
            // Backend offline/not deployed on Vercel
          }
          if (!user) {
            user = {
              id: `usr_${fbUser.uid.substring(0, 12)}`,
              firebase_uid: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Analyst',
              photo_url: fbUser.photoURL || null,
              role: 'RF Intelligence Analyst',
              mode: 'firebase',
              session_token: idToken,
              clearance_level: 'SECRET // SIH-NTRO-2026',
              created_at: new Date().toISOString()
            };
          }
          setCurrentUser(user);
          try {
            localStorage.setItem('signalx_user_session', JSON.stringify({
              id: user.id,
              firebase_uid: user.firebase_uid,
              email: user.email,
              name: user.name,
              role: user.role,
              token: user.session_token,
              mode: user.mode
            }));
          } catch (_) {}
        } catch (err) {
          console.error('[SignalX Auth] Failed to restore Firebase session:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [setCurrentUser]);

  return (
    <HomepageSelectionProvider>
      <BrowserRouter>
        <Routes>
          {/* Public & Authentication routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/homepage-variations" element={<HomepageVariationsPage />} />
          <Route path="/homepage-preview" element={<HomepageVariationsPage />} />
          <Route path="/preview/:id" element={<FullscreenPreviewPageWrapper />} />
          <Route path="/demo" element={<DemoSandboxPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Upload Page */}
          <Route path="/upload" element={
            <div className="min-h-screen bg-[#06080D] text-gray-200">
              <UploadPage />
            </div>
          } />

          {/* Workstation Analysis Layout */}
          <Route element={<AnalysisLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/spectrum" element={<SpectrumPage />} />
            <Route path="/waterfall" element={<WaterfallPage />} />
            <Route path="/constellation" element={<ConstellationPage />} />
            <Route path="/parameters" element={<ParametersPage />} />
            <Route path="/modulation" element={<ModulationPage />} />
            <Route path="/demodulation" element={<DemodulationPage />} />
            <Route path="/deinterleaving" element={<DeinterleavePage />} />
            <Route path="/fec" element={<FecPage />} />
            <Route path="/bitstream" element={<BitstreamPage />} />
            <Route path="/correlation" element={<CorrelationPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HomepageSelectionProvider>
  );
}
