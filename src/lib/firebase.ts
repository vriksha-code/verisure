import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: 'studio-2842943389-a020e',
  appId: '1:46403258694:web:45203d36137c2eacc97d47',
  apiKey: 'AIzaSyDuheYFM5sXKzSpLUeRk_4IjwVzYSuhOow',
  authDomain: 'studio-2842943389-a020e.firebaseapp.com',
  storageBucket: 'studio-2842943389-a020e.appspot.com',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
