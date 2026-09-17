import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBx6PMSa-JTEEu4vqB8akkSo_Gp5iuMR7o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "signalx-c618c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "signalx-c618c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "signalx-c618c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1080755618726",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1080755618726:web:cb558c849828e738270567",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-W7LSZ9XFG8"
};

// Initialize single consistent Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

let _lastAuthError = null;

/**
 * Initiates Google Sign-In with Firebase popup, with optional redirect mode.
 */
export async function signInWithGoogle(useRedirect = false) {
  _lastAuthError = null;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  console.log(`[SignalX Auth] Starting Google Sign-In: origin=${origin}, authDomain=${firebaseConfig.authDomain}, projectId=${firebaseConfig.projectId}, mode=${useRedirect ? 'redirect' : 'popup'}`);

  if (useRedirect) {
    try {
      return await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      const diag = {
        code: err?.code || 'auth/redirect-init-failed',
        message: err?.message || 'Failed to initiate redirect sign-in',
        name: err?.name || 'FirebaseError',
        customData: err?.customData || null,
        currentUser: auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null,
        origin,
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        timestamp: new Date().toISOString()
      };
      _lastAuthError = diag;
      console.error("[SignalX Auth Diagnostics] signInWithRedirect initialization failure:", diag);
      err.diagnostic = diag;
      throw err;
    }
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken(true);
    console.log(`[SignalX Auth] Google authentication successful: uid=${result.user.uid}, email=${result.user.email}`);
    return {
      firebaseUser: result.user,
      idToken
    };
  } catch (err) {
    const diag = {
      code: err?.code || 'auth/unknown',
      message: err?.message || 'Unknown error during popup authentication',
      name: err?.name || 'FirebaseError',
      customData: err?.customData || null,
      currentUser: auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null,
      origin,
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      timestamp: new Date().toISOString()
    };
    _lastAuthError = diag;
    console.error("[SignalX Auth Diagnostics] signInWithPopup failure:", diag);
    err.diagnostic = diag;
    throw err;
  }
}

/**
 * Checks for user credentials returned from a redirect flow.
 */
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.log(`[SignalX Auth] Captured redirect sign-in result for: ${result.user.email}`);
      const idToken = await result.user.getIdToken(true);
      return {
        firebaseUser: result.user,
        idToken
      };
    }
  } catch (err) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const diag = {
      code: err?.code || 'auth/redirect-error',
      message: err?.message || 'Error processing redirect result',
      name: err?.name || 'FirebaseError',
      customData: err?.customData || null,
      currentUser: auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null,
      origin,
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      timestamp: new Date().toISOString()
    };
    _lastAuthError = diag;
    console.error("[SignalX Auth Diagnostics] getRedirectResult failure:", diag);
    err.diagnostic = diag;
    throw err;
  }
  return null;
}

/**
 * Signs out from Firebase Authentication.
 */
export async function signOutFirebase() {
  return signOut(auth);
}

/**
 * Subscribes to Firebase auth state changes.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Safe diagnostic status reporter (zero secrets).
 */
export function getAuthDiagnostics() {
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const authorizedDomains = [
    'localhost',
    '127.0.0.1',
    'signalx-c618c.firebaseapp.com',
    'signalx-c618c.web.app',
    'signal-x-ruddy.vercel.app'
  ];

  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    appId: firebaseConfig.appId,
    currentOrigin: typeof window !== 'undefined' ? window.location.origin : '',
    currentHostname,
    isDomainAuthorized: authorizedDomains.includes(currentHostname),
    currentUser: auth.currentUser ? {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName
    } : null,
    providerId: 'google.com',
    lastAuthError: _lastAuthError
  };
}

export default auth;

