# TaxSaver — Dev Environment

> ⚠️ **This folder is for local development only.** No real Firebase or Razorpay credentials are needed.

## What's in here

```
dev/
├── website/       # Copy of new-website/ with MOCK firebase.js + auth.js
│   ├── firebase.js   ← MOCKED (no Firebase SDK)
│   ├── auth.js       ← MOCKED (uses hardcoded test tokens based on role)
│   ├── login.html    ← 🆕 3-card instant sign-in (Free, Premium, Admin)
│   ├── test.html     ← E2E test dashboard
│   ├── dev-banner.js ← Injects admin view banner
│   └── ... (all other pages copied from new-website/)
└── server/
    ├── mock_server.go   ← Self-contained Go mock server that recognizes test tokens
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

Start an HTTP server in the `dev/website` folder.
For example, using Node.js:

```powershell
npx http-server ./dev/website -p 5500 --cors -c-1
```

Navigate to: **http://localhost:5500/login.html**

## Test Users

The mock environment provides three instant-login personas to test different app states:

| Role                | Email                  | Token                     | Features                                                              |
| ------------------- | ---------------------- | ------------------------- | --------------------------------------------------------------------- |
| 👤 **Free User**    | `test@taxsaver.dev`    | `dev-test-token-12345`    | Standard calculator, locked premium features.                         |
| ✨ **Premium User** | `premium@taxsaver.dev` | `dev-premium-token-77777` | Unlocked premium AI reports, bypassed paywalls.                       |
| ⚙️ **Admin User**   | `admin@taxsaver.dev`   | `dev-admin-token-99999`   | Access to `admin.html`, global 'ADMIN VIEW' banner, premium features. |

Select any card on the `login.html` page to instantly authenticate as that user. The session is stored in `localStorage`.

## Mock API Endpoints

| Method | Path                        | Notes                                                  |
| ------ | --------------------------- | ------------------------------------------------------ |
| `GET`  | `/health`                   | Always returns `ok`                                    |
| `GET`  | `/api/user/status`          | Returns current premium state for the token            |
| `GET`  | `/api/admin/users`          | Admin only: Lists all mock users and their status      |
| `POST` | `/api/admin/grant-premium`  | Admin only: Grants 1-year premium to a user ID         |
| `POST` | `/api/payment/create-order` | Returns a fake Razorpay order ID                       |
| `POST` | `/api/payment/verify`       | Always succeeds → marks the requesting user as premium |
| `GET`  | `/api/dev/reset`            | Resets the specified user back to Free plan            |

All protected endpoints require checking the token via `Authorization: Bearer <token>`.

## Dev vs Production

|               | Dev (`dev/`)                  | Production (`new-website/`)  |
| ------------- | ----------------------------- | ---------------------------- |
| Firebase      | Mocked (localStorage)         | Real Firebase project        |
| Razorpay      | Mocked                        | Real Razorpay SDK            |
| Auth token    | Specific test tokens          | Real Firebase ID token       |
| Premium state | In-memory (resets on restart) | Firestore                    |
| Server        | `mock_server.go` (no deps)    | `server/main.go` (Go + deps) |
