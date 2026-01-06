import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD_yAGAIbJu2yUDXce5XDaJ9dPYgNhsOyk",
  authDomain: "tracker-41d86.firebaseapp.com",
  projectId: "tracker-41d86",
  storageBucket: "tracker-41d86.firebasestorage.app",
  messagingSenderId: "632609809170",
  appId: "1:632609809170:web:6854cedecc8c1b078649cb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Offline persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Offline persistence not supported by this browser');
  }
});