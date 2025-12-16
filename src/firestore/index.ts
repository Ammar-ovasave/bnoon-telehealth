import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs'
import path from 'path'

const serviceAccount = JSON.parse(fs.readFileSync(path.join('src', 'firestore', 'bnoon-476311-cf2969a052a4.json'), 'utf8'));

export let firebaseApp: App | null = null;

if (!firebaseApp) {
  firebaseApp = initializeApp({
    credential: cert(serviceAccount)
  });
}

export const db = getFirestore();
