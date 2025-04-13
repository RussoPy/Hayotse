// src/utils/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // or: getFirestore for Firestore

const firebaseConfig = {
    apiKey: "AIzaSyC1uDxE7Fgr1fGe_8pVkJjBnosJwLi31uM",
    authDomain: "hayotse.firebaseapp.com",
  databaseURL: "https://hayotse-default-rtdb.europe-west1.firebasedatabase.app/", // for RTDB
  projectId: "hayotse",
  storageBucket: "hayotse.firebasestorage.app",
  messagingSenderId: "628880497208",
  appId: "1:628880497208:web:b0fd253b4b835d927ae4cd",
  measurementId: "G-0F4V2ZVK0E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app); // or getFirestore(app)
