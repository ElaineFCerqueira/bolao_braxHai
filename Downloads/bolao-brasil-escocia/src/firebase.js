import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANeiHzWNARvTSGFsWk7sGx8u-sgQbTXJc",
  authDomain: "bolao-brasil-escocia-1356f.firebaseapp.com",
  projectId: "bolao-brasil-escocia-1356f",
  storageBucket: "bolao-brasil-escocia-1356f.firebasestorage.app",
  messagingSenderId: "378577863551",
  appId: "1:378577863551:web:1afad39ff6a87dd248d04a",
  measurementId: "G-CGGTVZL339"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };