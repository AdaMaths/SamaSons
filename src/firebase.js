import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Remplace les valeurs ci-dessous par la configuration de ton projet Firebase.
const firebaseConfig = {
  apiKey: "REMPLACER_API_KEY",
  authDomain: "REMPLACER_PROJECT_ID.firebaseapp.com",
  projectId: "REMPLACER_PROJECT_ID",
  storageBucket: "REMPLACER_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "REMPLACER_SENDER_ID",
  appId: "REMPLACER_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const firebaseConfigured = !firebaseConfig.apiKey.startsWith("REMPLACER");
