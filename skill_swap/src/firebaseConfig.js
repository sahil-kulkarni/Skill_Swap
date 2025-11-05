// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

export default app;