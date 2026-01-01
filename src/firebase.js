/**
 * Firebase Configuration and Initialization
 * Using Firebase v9+ modular SDK via CDN
 */

// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase configuration (from user's existing setup)
const firebaseConfig = {
    apiKey: "AIzaSyAjh0-QN8NWoyjBNitnLWCp4iWd5ia-kP4",
    authDomain: "pipe-rack-manager.firebaseapp.com",
    projectId: "pipe-rack-manager",
    storageBucket: "pipe-rack-manager.firebasestorage.app",
    messagingSenderId: "594023757626",
    appId: "1:594023757626:web:63169501c3f5978d890203"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('✅ Firebase initialized successfully');
