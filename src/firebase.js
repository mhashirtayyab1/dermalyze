import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTq_rgf_2pP5bqptHu3uZs7_19SuTUxKo",
  authDomain: "dermalyze-abb54.firebaseapp.com",
  projectId: "dermalyze-abb54",
  storageBucket: "dermalyze-abb54.firebasestorage.app",
  messagingSenderId: "704697344624",
  appId: "1:704697344624:web:e1ee1200e2aae70ab20ab5"
};

// Initialize Firebase (Sirf aik baar likhna hai)
const app = initializeApp(firebaseConfig);

// Services ko export karein taaki App.js mein use ho saken
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();