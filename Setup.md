# TaxSaver — Setup Guide

## Project Structure

```
new-project/
├── new-website/          # Frontend (HTML + CSS + JS)
│   ├── index.html        # Landing page
│   ├── app.html          # Free tax calculator
│   ├── premium.html      # Premium document upload
│   ├── pricing.html      # Pricing + Razorpay checkout
│   ├── login.html        # Google Sign-In page
│   ├── firebase.js       # Firebase client SDK config ← YOU MUST EDIT THIS
│   ├── auth.js           # Shared auth helpers
│   └── styles.css        # Shared design system
├── server/               # Go backend (Gin + Firebase Admin + Razorpay)
│   ├── main.go
│   ├── go.mod / go.sum
│   ├── .env.example      # ← Copy to .env and fill in keys
│   ├── firebase/         # Firebase Admin init
│   ├── handlers/         # Auth and payment handlers
│   └── middleware/       # CORS
└── old-website/          # Original calculator (preserved)
```

---

## Prerequisites

| Tool                                                    | Install                    |
| ------------------------------------------------------- | -------------------------- |
| [Go 1.22+](https://go.dev/dl/)                          | `winget install GoLang.Go` |
| A browser with Live Server (VS Code extension)          | For frontend               |
| [Firebase account](https://console.firebase.google.com) | Free                       |
| [Razorpay account](https://razorpay.com)                | Free test mode             |

---

## Step 1 — Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Create a project** (or use an existing one)
3. Enable **Google Sign-In**:
   - Authentication → Sign-in method → Google → Enable
4. Enable **Firestore**:
   - Firestore Database → Create database → Start in **test mode**
5. **Get client config** for the frontend:
   - Project Settings → General → Your Apps → Add Web App
   - Copy the `firebaseConfig` object
6. **Get Admin SDK credentials** for the backend:
   - Project Settings → Service Accounts → Generate New Private Key
   - Download the JSON file — extract: `project_id`, `client_email`, `private_key`
7. **Add authorized domain** for Google Sign-In:
   - Authentication → Settings → Authorized Domains → Add `localhost`

---

## Step 2 — Configure the Frontend (`new-website/firebase.js`)

Open `new-website/firebase.js` and replace the placeholder values with your config:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

---

## Step 3 — Configure the Backend (`server/.env`)

```bash
# Copy the template
cp server/.env.example server/.env
```

Then open `server/.env` and fill in:

```bash
# From Razorpay Dashboard → Settings → API Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# From Firebase service account JSON
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
# Copy the private_key field exactly — keep the \n characters
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Server config
PORT=3001
FRONTEND_URL=http://localhost:5500

# From Razorpay Dashboard → Webhooks → Secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

---

## Step 4 — Run the Backend

```powershell
cd server

# Download Go dependencies (first time only)
go mod tidy

# Start the server
go run main.go
```

You should see:

```
🚀 TaxSaver API (Go) running on http://localhost:3001
   Health: http://localhost:3001/health
```

Verify it's working: open [http://localhost:3001/health](http://localhost:3001/health)

### Build a single binary (for deployment)

```bash
go build -o taxsaver-server .
./taxsaver-server
```

---

## Step 5 — Run the Frontend

Open `new-website/index.html` with **VS Code Live Server** (right-click → Open with Live Server).

The default URL is `http://localhost:5500` — make sure this matches `FRONTEND_URL` in your `.env`.

---

## Step 6 — Configure Razorpay Webhook (for production)

1. Razorpay Dashboard → Webhooks → Add new webhook
2. URL: `https://your-domain.com/api/payment/webhook`
3. Events to subscribe: `payment.captured`, `refund.processed`
4. Set a **Webhook Secret** and add it to your `.env` as `RAZORPAY_WEBHOOK_SECRET`

> For local testing, use [ngrok](https://ngrok.com): `ngrok http 3001` and use the ngrok URL.

---

## Payment Flow (End-to-End)

```
User clicks "Get Premium"
    ↓
login.html  →  Google Sign-In (Firebase Auth)
    ↓
pricing.html  →  POST /api/payment/create-order  (Firebase token required)
    ↓
Razorpay Checkout opens (UPI / Cards / Net Banking)
    ↓
User pays → POST /api/payment/verify  →  HMAC signature check
    ↓
Firestore: users/{uid}.isPremium = true  (1-year expiry)
    ↓
User redirected to premium.html  🎉
```

---

## Environment Quick-Reference

| Variable                  | Where to find                         |
| ------------------------- | ------------------------------------- |
| `RAZORPAY_KEY_ID`         | Razorpay → Settings → API Keys        |
| `RAZORPAY_KEY_SECRET`     | Razorpay → Settings → API Keys        |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay → Webhooks → Secret          |
| `FIREBASE_PROJECT_ID`     | Firebase → Project Settings → General |
| `FIREBASE_CLIENT_EMAIL`   | Service Account JSON → `client_email` |
| `FIREBASE_PRIVATE_KEY`    | Service Account JSON → `private_key`  |

> ⚠️ **Never commit `server/.env` to git.** It's already in `.gitignore`.
