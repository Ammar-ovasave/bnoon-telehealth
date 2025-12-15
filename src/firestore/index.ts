import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = require('./bnoon-476311-cf2969a052a4.json')

export let firebaseApp: App | null = null;

if (!firebaseApp) {
  firebaseApp = initializeApp({
    credential: cert(serviceAccount)
  });
}

export const db = getFirestore();
