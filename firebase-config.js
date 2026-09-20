// ======================================================
// S.S.C CLASSES
// Firebase Configuration
// ======================================================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { getStorage } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

import { auth } from "./firebase-config.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


// ======================================================
// 🔥 FIREBASE CONFIG
// ======================================================

const firebaseConfig = {
    apiKey: "AIzaSyDGnQzr8AV8nVdIBO6tUDbNAoRqlxuF7N0",
    authDomain: "ssc-classes-4e87d.firebaseapp.com",
    projectId: "ssc-classes-4e87d",
    storageBucket: "ssc-classes-4e87d.firebasestorage.app",
    messagingSenderId: "65398917667",
    appId: "1:65398917667:web:8f47fdf42001902db7ff96",
    measurementId: "G-JQ4EK99HHN"
};


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

const app = initializeApp(firebaseConfig);


// ======================================================
// FIREBASE SERVICES
// ======================================================

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default app;