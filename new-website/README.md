# TaxSaver — Production Frontend

This directory contains the production-ready frontend code for TaxSaver, integrated with Firebase Auth and the official backend API.

## 🗂️ Structure

```
new-website/
├── index.html        # Landing page
├── app.html          # Free tax calculator
├── premium.html      # Premium document upload and AI analysis gate
├── pricing.html      # Pricing options and Razorpay checkout
├── login.html        # Google Sign-In portal
├── firebase.js       # Firebase client SDK initialization
├── auth.js           # Production auth state and API helpers
└── styles.css        # Shared design system
```

## 🚀 Setup

Unlike the `dev/` environment, you cannot run this folder using the mock backend. You must connect it to a real Firebase project and the real Go server implementation.

### 1. Firebase Configuration

Open `firebase.js` and populate `firebaseConfig` with your actual Firebase project settings:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  // ...
};
```

### 2. Backend API

The frontend expects a backend running at `http://localhost:3001` (by default during dev) or your deployed production URL, handling the `/api/` endpoints (like `/api/payment/create-order` and `/api/user/status`).

### 3. Running

Serve this directory using any static file server:

```bash
npx http-server ./new-website -p 5500
```

Ensure your Go `server/` is running concurrently.

## Authenticated Flows

- Users sign in via Firebase Google Auth (`login.html`).
- Their Firebase ID Token is retrieved and passed as a `Bearer` token to all backend requests.
- The `premium.html` and `pricing.html` pages contain logic to dynamically update UI based on the user's fetched subscription status.
