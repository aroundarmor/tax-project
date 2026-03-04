// new-website/firebase.js
// Shared Firebase client-side initialization.
// Import this script BEFORE auth.js on any page that needs auth.
//
// ── SETUP INSTRUCTIONS ────────────────────────────────────────────────
// 1. Go to console.firebase.google.com
// 2. Create a project (or use existing)
// 3. Go to Project Settings → General → Your Apps → Add Web App
// 4. Copy the firebaseConfig object and replace the values below
// 5. Go to Authentication → Sign-in method → Enable "Google"
// 6. Go to Firestore Database → Create database (start in test mode for dev)
// ─────────────────────────────────────────────────────────────────────

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

// ── Replace with your Firebase project config ─────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// ─────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
