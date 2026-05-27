import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// Require at minimum apiKey + projectId for Firebase Auth to work
const hasValidConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "__REPLACE_WITH_PRODUCTION_KEY__" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "__REPLACE_WITH_PRODUCTION_PROJECT_ID__";

let app = null;
let auth = null;
let googleProvider = null;
let initError = null;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  } catch (err) {
    initError = err.message || String(err);
  }
} else {
  initError =
    "Missing Firebase configuration. Check that VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are set in your .env file.";
}

export function getFirebaseStatus() {
  return {
    ready: !!(auth && googleProvider),
    error: initError,
    hasConfig: hasValidConfig,
    debug: {
      apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 8) + "..." : null,
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasAppId: !!firebaseConfig.appId,
    },
  };
}

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};

export default app;