import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK (server-side only)
// Uses Application Default Credentials on Vercel, or service account JSON locally
function initAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // If a service account JSON is provided via env var, use it
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount: ServiceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    );
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  // Fallback: use project ID only (works with Vercel + Google Cloud IAM)
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const adminApp = initAdmin();
export const adminDb = getFirestore(adminApp);
