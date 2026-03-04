# TaxSaver — Global Setup Guide

Welcome to the TaxSaver project! This repository contains a comprehensive tax calculator and optimization platform with premium features, integrated with Firebase Authentication and Razorpay.

## 🗂️ Project Structure

The project has been refactored into three distinct environments:

1. **`new-website/` & `server/` (Production-Ready Codebase)**
   - **Frontend (`new-website/`)**: The modular, premium-ready frontend. Requires a real Firebase project for auth and the real Go backend for payments.
   - **Backend (`server/`)**: A Go-based backend handling Razorpay order creation, payment verification, and Firebase Admin SDK for assigning premium roles.
   - _See `new-website/README.md` for specific details._
2. **`dev/` (Local Development & Testing Environment)**
   - A completely isolated, mocked environment for local development without needing real API keys.
   - Contains a mock Go server (`dev/server/mock_server.go`) and a mocked frontend (`dev/website/`).
   - Perfect for end-to-end testing of Free, Premium, and Admin roles.
   - _See `dev/README.md` for instructions on running the dev environment._
3. **`old-website/` (Legacy Pure-Client Version)**
   - The original, purely client-side version of the calculator.
   - Runs entirely in the browser with no backend dependencies.
   - Preserved for reference and standalone use.
   - _See `old-website/README.md` for details._

---

## 🚀 Setting up the Production Environment (`new-website` & `server`)

If you want to run the real, production-ready system, follow these steps. (For just testing UI/UX, use the `dev/` environment instead).

### Prerequisites

| Tool                                                    | Install                    |
| ------------------------------------------------------- | -------------------------- |
| [Go 1.22+](https://go.dev/dl/)                          | `winget install GoLang.Go` |
| [Firebase account](https://console.firebase.google.com) | Free                       |
| [Razorpay account](https://razorpay.com)                | Free test mode             |

### Step 1 — Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Create a project** (or use an existing one).
3. Enable **Google Sign-In**:
   - Authentication → Sign-in method → Google → Enable
4. Enable **Firestore**:
   - Firestore Database → Create database → Start in **test mode**
5. **Get client config** for the frontend:
   - Project Settings → General → Your Apps → Add Web App
   - Copy the `firebaseConfig` object into `new-website/firebase.js`.
6. **Get Admin SDK credentials** for the backend:
   - Project Settings → Service Accounts → Generate New Private Key
   - Download the JSON file and extract the keys for the backend `.env`.
7. **Add authorized domain** for Google Sign-In:
   - Authentication → Settings → Authorized Domains → Add `localhost`

### Step 2 — Configure the Backend (`server/.env`)

```bash
# Copy the template
cp server/.env.example server/.env
```

Open `server/.env` and fill in:

```bash
# From Razorpay Dashboard → Settings → API Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# From Firebase service account JSON
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Server config
PORT=3001
FRONTEND_URL=http://localhost:5500

# Razorpay Webhook Secret (optional for local testing)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Step 3 — Run the Backend

```powershell
cd server
go mod tidy
go run main.go
```

Verify it's working by opening [http://localhost:3001/health](http://localhost:3001/health).

### Step 4 — Run the Frontend

Serve the `new-website/` directory using any local web server. For example, using VS Code Live Server or `npx http-server ./new-website -p 5500`. Navigate to `http://localhost:5500`.

---
