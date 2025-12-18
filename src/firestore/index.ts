import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount() {
  return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? "");
}

const serviceAccount = getServiceAccount();

export let firebaseApp: App | null = null;
if (getApps().length === 0) {
  firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  firebaseApp = getApp();
}

export const db = getFirestore(firebaseApp!);
