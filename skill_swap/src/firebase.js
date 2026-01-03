import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPDoTVL47B1gCyICBkuQ3mQuNH9ay1ZLs",
  authDomain: "skill-swap-33044.firebaseapp.com",
  databaseURL: "https://skill-swap-33044-default-rtdb.firebaseio.com",
  projectId: "skill-swap-33044",
  storageBucket: "skill-swap-33044.firebasestorage.app",
  messagingSenderId: "298006138572",
  appId: "1:298006138572:web:01ddc011a29719d4343c69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;