// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgaIBJsgOsd0jdJX_if7XRNyR6IG_6mCw",
  authDomain: "gestao-jeans-3e790.firebaseapp.com",
  projectId: "gestao-jeans-3e790",
  storageBucket: "gestao-jeans-3e790.firebasestorage.app",
  messagingSenderId: "417550325101",
  appId: "1:417550325101:web:55f6acc1aeb17b9e627664"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);