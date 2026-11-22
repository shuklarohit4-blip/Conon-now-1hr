import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Firebase config is injected via Vite build-time env vars (VITE_ prefix),
 * falling back to verified project defaults when env vars are not set.
 */
const firebaseConfig = {
  apiKey:
    (import.meta.env.VITE_FIREBASE_API_KEY as string) ||
    "AIzaSyAjNknMqmVm-JAW6fKJP4IZmwaJwUxm764",
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) ||
    "conon-app-edff3.firebaseapp.com",
  projectId:
    (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) ||
    "conon-app-edff3",
  storageBucket:
    (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) ||
    "conon-app-edff3.firebasestorage.app",
  messagingSenderId:
    (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) ||
    "610178226747",
  appId:
    (import.meta.env.VITE_FIREBASE_APP_ID as string) ||
    "1:610178226747:web:9cd4670aeeec540186da1e",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
