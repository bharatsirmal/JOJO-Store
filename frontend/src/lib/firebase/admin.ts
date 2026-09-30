import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const isConfigured = !!projectId && !!clientEmail && !!privateKey;

if (getApps().length === 0 && isConfigured) {
  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log("Firebase Admin successfully initialized on Vercel.");
  } catch (error) {
    console.error("FATAL: Firebase Admin initialization failed! Your FIREBASE_PRIVATE_KEY is likely malformed in Vercel Environment Variables.", error);
  }
}

export const adminDb = getApps().length > 0 ? getFirestore(getApp()) : null;
export const adminAuth = getApps().length > 0 ? getAuth(getApp()) : null;
export const adminStorage = getApps().length > 0 ? getStorage(getApp()) : null;
