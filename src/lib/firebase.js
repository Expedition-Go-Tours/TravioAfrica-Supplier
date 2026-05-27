import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import config from "@/config";

const firebaseConfig = {
  apiKey: config.auth.firebase.apiKey,
  authDomain: config.auth.firebase.authDomain,
  projectId: config.auth.firebase.projectId,
  appId: config.auth.firebase.appId,
  messagingSenderId: config.auth.firebase.messagingSenderId,
};

let app = null;
let auth = null;
let googleProvider = null;
let initError = null;

const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

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
  initError = "Missing Firebase configuration values. Check VITE_FIREBASE_* env vars.";
}

export function getFirebaseStatus() {
  return {
    ready: !!(auth && googleProvider),
    error: initError,
    hasConfig: hasValidConfig,
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