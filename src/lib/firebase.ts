// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "studio-8552429056-98da3",
  appId: "1:388639783528:web:be31abdec13abbe83e19dd",
  storageBucket: "studio-8552429056-98da3.firebasestorage.app",
  apiKey: "AIzaSyCCHhQYAUgHJawucJZA7akBIc9eWivKOH8",
  authDomain: "studio-8552429056-98da3.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "388639783528"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
