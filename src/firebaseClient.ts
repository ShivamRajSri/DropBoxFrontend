// src/firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZqzf4-86ouuiFxS_cnzY-6o0o5qOb-5o",
  authDomain: "react-46589.firebaseapp.com",
  projectId: "react-46589",
  storageBucket: "react-46589.firebasestorage.app",
  messagingSenderId: "180036666051",
  appId: "1:180036666051:web:65a18631204c3803995876",
  measurementId: "G-JMTLTG9SZ4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);