// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "studio-8552429056-98da3",
  appId: "1:388639783528:web:be31abdec13abbe83e19dd",
  storageBucket: "studio-8552429056-98da3.appspot.com",
  apiKey: "AIzaSyCCHhQYAUgHJawucJZA7akBIc9eWivKOH8",
  authDomain: "studio-8552429056-98da3.firebaseapp.com",
  messagingSenderId: "388639783528",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };