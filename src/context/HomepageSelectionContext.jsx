import React, { createContext, useContext, useState } from 'react';

export const DIRECTIONS = [
  {
    id: 'cinematic',
    num: '01',
    code: 'CINEMATIC RF',
    name: 'Cinematic RF',
    badge: 'IMMERSIVE',
    tagline: 'Full-viewport signal visualization with cinematic entrance, scroll-driven story, and massive editorial typography.',
    features: [
      'Animated full-width spectrum analyzer hero with hover tooltip',
      'Scroll-driven pipeline story — 5 sections with visual transitions',
      'Massive editorial headings: "READ THE SIGNAL." / "FROM SIGNAL TO STRUCTURE."',
      'Interactive constellation showcase (BPSK / QPSK / 16QAM / 64QAM)',
    ],
  },
  {
    id: 'editorial',
    num: '02',
    code: 'EDITORIAL',
    name: 'Editorial Engineering',
    badge: 'TYPOGRAPHY-FIRST',
    tagline: 'Engineering-journal visual language — extreme typography, large whitespace, interactive capability browser.',
    features: [
      'Extreme editorial heading hierarchy with maximum whitespace',
      'Interactive capability browser with numbered list navigation',
      'Physical signal parameter reference table',
      'Horizontal scrolling pipeline block diagram',
    ],
  },
  {
    id: 'mission',
    num: '03',
    code: 'MISSION CTRL',
    name: 'Mission Control',
    badge: 'OPERATIONS',
    tagline: 'Dense multi-panel instrumentation layout — live spectrum, waterfall, analysis log, classifier confidence panel.',
    features: [
      'Three-column ops center layout: telemetry · instruments · analysis log',
      'Live animated mini spectrum, waterfall, and sideband panels',
      'Classifier confidence chart across 8 modulation classes',
      'Compact 8-column capabilities matrix',
    ],
  },
];

const HomepageSelectionContext = createContext(null);

export function HomepageSelectionProvider({ children }) {
  const [appliedDirectionId, setAppliedDirectionId] = useState(() => {
    try {
      const saved = localStorage.getItem('signalx_applied_direction');
      // Map old IDs to new
      const idMap = { aerospace: 'cinematic', rflab: 'editorial', engineering: 'mission' };
      const mapped = idMap[saved] || saved;
      return mapped && DIRECTIONS.some(d => d.id === mapped) ? mapped : 'cinematic';
    } catch {
      return 'cinematic';
    }
  });

  const [selectedDirectionId, setSelectedDirectionId] = useState(() => {
    try {
      const saved = localStorage.getItem('signalx_selected_direction');
      const idMap = { aerospace: 'cinematic', rflab: 'editorial', engineering: 'mission' };
      const mapped = idMap[saved] || saved;
      return mapped && DIRECTIONS.some(d => d.id === mapped) ? mapped : 'cinematic';
    } catch {
      return 'cinematic';
    }
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingDirectionToApply, setPendingDirectionToApply] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const selectDirection = (id) => {
    setSelectedDirectionId(id);
    try { localStorage.setItem('signalx_selected_direction', id); } catch {}
  };

  const openApplyConfirmation = (directionId = null) => {
    setPendingDirectionToApply(directionId || selectedDirectionId);
    setIsConfirmModalOpen(true);
  };

  const closeApplyConfirmation = () => {
    setIsConfirmModalOpen(false);
    setPendingDirectionToApply(null);
  };

  const confirmApply = () => {
    if (pendingDirectionToApply) {
      setAppliedDirectionId(pendingDirectionToApply);
      setSelectedDirectionId(pendingDirectionToApply);
      try {
        localStorage.setItem('signalx_applied_direction', pendingDirectionToApply);
        localStorage.setItem('signalx_selected_direction', pendingDirectionToApply);
      } catch {}
      const dir = DIRECTIONS.find(d => d.id === pendingDirectionToApply);
      showToast(`Applied "${dir?.name}" as the public homepage.`);
    }
    closeApplyConfirmation();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <HomepageSelectionContext.Provider value={{
      directions: DIRECTIONS,
      appliedDirectionId,
      selectedDirectionId,
      activeDirection: DIRECTIONS.find(d => d.id === appliedDirectionId) || DIRECTIONS[0],
      selectedDirection: DIRECTIONS.find(d => d.id === selectedDirectionId) || DIRECTIONS[0],
      selectDirection,
      openApplyConfirmation,
      closeApplyConfirmation,
      confirmApply,
      isConfirmModalOpen,
      pendingDirectionToApply,
      toastMessage,
    }}>
      {children}
    </HomepageSelectionContext.Provider>
  );
}

export function useHomepageSelection() {
  const context = useContext(HomepageSelectionContext);
  if (!context) throw new Error('useHomepageSelection must be within HomepageSelectionProvider');
  return context;
}
