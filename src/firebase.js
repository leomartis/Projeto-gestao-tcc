import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgaIBJsgOsd0jdJX_if7XRNyR6IG_6mCw",
  authDomain: "gestao-jeans-3e790.firebaseapp.com",
  projectId: "gestao-jeans-3e790",
  storageBucket: "gestao-jeans-3e790.firebasestorage.app",
  messagingSenderId: "417550325101",
  appId: "1:417550325101:web:55f6acc1aeb17b9e627664"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
