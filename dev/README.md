# TaxSaver — Dev Environment

> ⚠️ **This folder is for local development only.** No real Firebase or Razorpay credentials are needed.

## What's in here

```
dev/
├── website/       # Copy of new-website/ with MOCK firebase.js + auth.js
│   ├── firebase.js   ← MOCKED (no Firebase SDK)
│   ├── auth.js       ← MOCKED (uses hardcoded test token)
│   ├── login.html    ← Modified — instant sign-in, no Google popup
│   ├── test.html     ← 🆕 E2E test dashboard (run this first!)
│   └── ... (all other pages copied from new-website/)
└── server/
    ├── mock_server.go   ← Self-contained Go mock server
    └── go.mod
```

## Quick Start (2 terminals)

### Terminal 1 — Start the mock backend

```powershell
cd dev/server
go run mock_server.go
# → 🧪 TaxSaver MOCK SERVER running on http://localhost:3001
```

### Terminal 2 — Open the frontend

Open `dev/website/test.html` with VS Code Live Server (right-click → Open with Live Server).

Or navigate directly to: **http://localhost:5500/dev/website/test.html**

## Test Flow

1. Open `test.html` — E2E Test Dashboard
2. Click **"Run Full E2E Test"** — it runs 6 automated steps:
   - Sign in as test user (instant, no popup)
   - Ping mock server health
   - Create a mock payment order
   - Verify payment (always succeeds in mock)
   - Confirm premium is activated
   - Reset back to free plan

## Test User

| Field      | Value                    |
| ---------- | ------------------------ |
| UID        | `test-user-001`          |
| Email      | `test@taxsaver.dev`      |
| Auth Token | `dev-test-token-12345`   |
| Session    | Stored in `localStorage` |

## Mock API Endpoints

| Method | Path                        | Notes                              |
| ------ | --------------------------- | ---------------------------------- |
| `GET`  | `/health`                   | Always returns `ok`                |
| `GET`  | `/api/user/status`          | Returns current premium state      |
| `POST` | `/api/payment/create-order` | Returns a fake order ID            |
| `POST` | `/api/payment/verify`       | Always succeeds → marks premium    |
| `POST` | `/api/payment/webhook`      | No-op in dev                       |
| `GET`  | `/api/dev/reset`            | **Dev only** — resets to Free plan |

All protected endpoints require: `Authorization: Bearer dev-test-token-12345`

## Dev vs Production

|               | Dev (`dev/`)                  | Production (`new-website/`)  |
| ------------- | ----------------------------- | ---------------------------- |
| Firebase      | Mocked (localStorage)         | Real Firebase project        |
| Razorpay      | Mocked                        | Real Razorpay SDK            |
| Auth token    | `dev-test-token-12345`        | Real Firebase ID token       |
| Premium state | In-memory (resets on restart) | Firestore                    |
| Server        | `mock_server.go` (no deps)    | `server/main.go` (Go + deps) |
