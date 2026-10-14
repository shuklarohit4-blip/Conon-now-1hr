import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Firebase config is injected via Vite build-time env vars (VITE_ prefix).
 * Set these in Replit Secrets (or a local .env file for VS Code dev).
 *
 * Required secrets:
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             as string,
};

/* Warn in dev if any key is missing — helps catch misconfiguration early. */
if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => `VITE_FIREBASE_${k.replace(/([A-Z])/g, "_$1").toUpperCase()}`);
  if (missing.length) {
    console.warn(
      "[CONON] Firebase: missing env vars →",
      missing.join(", "),
      "\nSet them in Replit Secrets (or .env locally) and restart.",
    );
  }
}

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
