import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCSOHIVtEyC9xb52uwuGgKGzWu9cgGmnSw",
  authDomain: "project-35f36130-8190-4717-af1.firebaseapp.com",
  projectId: "project-35f36130-8190-4717-af1",
  storageBucket: "project-35f36130-8190-4717-af1.firebasestorage.app",
  messagingSenderId: "714063514010",
  appId: "1:714063514010:web:cffa3ee28f2a4bfdcd5223"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const firebaseConfigured = true;
