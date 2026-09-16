import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
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

// Initialize or reuse Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Initiates Google Sign-In with Firebase popup.
 * Returns the authenticated user and their Firebase ID token.
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken(true);
  return {
    firebaseUser: result.user,
    idToken
  };
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

export default auth;
