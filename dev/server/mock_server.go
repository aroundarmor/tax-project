// dev/server/mock_server.go
// Self-contained mock backend for local E2E testing.
// Supports three user roles: free, premium, and admin.
//
// ── Users ───────────────────────────────────────────────
//  Free:    test@taxsaver.dev       token: dev-test-token-12345
//  Premium: premium@taxsaver.dev    token: dev-premium-token-77777
//  Admin:   admin@taxsaver.dev      token: dev-admin-token-99999
//
// Run:
//   cd dev/server && go run mock_server.go

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

// ── User definitions ──────────────────────────────────────────────────
type User struct {
	UID       string
	Email     string
	Name      string
	Token     string
	IsAdmin   bool
	IsPremium bool  // mutable — toggled by payment mock
	JoinedAt  string
}

var users = map[string]*User{
	"dev-test-token-12345": {
		UID:      "test-user-001",
		Email:    "test@taxsaver.dev",
		Name:     "Test User",
		Token:    "dev-test-token-12345",
		IsAdmin:  false,
		IsPremium: false,
		JoinedAt: "2025-04-01T10:00:00Z",
	},
	"dev-premium-token-77777": {
		UID:       "premium-user-001",
		Email:     "premium@taxsaver.dev",
		Name:      "Premium User",
		Token:     "dev-premium-token-77777",
		IsAdmin:   false,
		IsPremium: true, // Always premium — never resets
		JoinedAt:  "2025-03-01T09:30:00Z",
	},
	"dev-admin-token-99999": {
		UID:      "admin-user-001",
		Email:    "admin@taxsaver.dev",
		Name:     "Admin User",
		Token:    "dev-admin-token-99999",
		IsAdmin:  true,
		IsPremium: true, // Admins always have premium
		JoinedAt: "2024-12-01T08:00:00Z",
	},
}

// Mock user DB for admin panel view (simulates Firestore collection)
var mockUserDB = []*MockDBUser{
	{UID: "user-101", Email: "priya.sharma@gmail.com",   Name: "Priya Sharma",    IsPremium: true,  JoinedAt: "2025-07-12", PaymentID: "pay_QAx8kL9mN2"},
	{UID: "user-102", Email: "rahul.verma@outlook.com",  Name: "Rahul Verma",     IsPremium: false, JoinedAt: "2025-08-03", PaymentID: ""},
	{UID: "user-103", Email: "anita.patel@yahoo.co.in",  Name: "Anita Patel",     IsPremium: true,  JoinedAt: "2025-06-28", PaymentID: "pay_BBx2mZ7qR5"},
	{UID: "user-104", Email: "sanjay.mehta@gmail.com",   Name: "Sanjay Mehta",    IsPremium: false, JoinedAt: "2025-09-15", PaymentID: ""},
	{UID: "user-105", Email: "kavita.roy@hotmail.com",   Name: "Kavita Roy",      IsPremium: true,  JoinedAt: "2025-05-22", PaymentID: "pay_CCy3nA8rS6"},
	{UID: "user-106", Email: "deepak.joshi@gmail.com",   Name: "Deepak Joshi",    IsPremium: false, JoinedAt: "2025-10-01", PaymentID: ""},
	{UID: "user-107", Email: "meena.iyer@rediffmail.com",Name: "Meena Iyer",      IsPremium: true,  JoinedAt: "2025-04-18", PaymentID: "pay_DDz4oB9sT7"},
	{UID: "user-108", Email: "vikram.nair@gmail.com",    Name: "Vikram Nair",     IsPremium: false, JoinedAt: "2025-11-05", PaymentID: ""},
	{UID: "premium-user-001",Email: "premium@taxsaver.dev",Name: "Premium User",  IsPremium: true,  JoinedAt: "2026-03-01", PaymentID: "pay_PREM0001"},
	{UID: "test-user-001",   Email: "test@taxsaver.dev",  Name: "Test User",      IsPremium: false, JoinedAt: "2026-01-01", PaymentID: ""},
	{UID: "admin-user-001",  Email: "admin@taxsaver.dev", Name: "Admin User",     IsPremium: true,  JoinedAt: "2024-12-01", PaymentID: "pay_ADMIN001"},
}

type MockDBUser struct {
	UID       string `json:"uid"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	IsPremium bool   `json:"isPremium"`
	JoinedAt  string `json:"joinedAt"`
	PaymentID string `json:"lastPaymentId"`
}

const port = "3001"

func main() {
	mux := http.NewServeMux()
	handler := corsMiddleware(mux)

	// ── Public routes ────────────────────────────────────
	mux.HandleFunc("/health", handleHealth)

	// ── Authenticated routes (any signed-in user) ────────
	mux.HandleFunc("/api/user/status", authMiddleware(false, handleUserStatus))
	mux.HandleFunc("/api/payment/create-order", authMiddleware(false, handleCreateOrder))
	mux.HandleFunc("/api/payment/verify", authMiddleware(false, handleVerifyPayment))
	mux.HandleFunc("/api/payment/webhook", handleWebhook)

	// ── Admin-only routes ────────────────────────────────
	mux.HandleFunc("/api/admin/stats", authMiddleware(true, handleAdminStats))
	mux.HandleFunc("/api/admin/users", authMiddleware(true, handleAdminUsers))
	mux.HandleFunc("/api/admin/users/toggle-premium", authMiddleware(true, handleTogglePremium))

	// ── Dev utility routes ───────────────────────────────
	mux.HandleFunc("/api/dev/reset", handleReset)

	log.Printf("\n🧪 TaxSaver MOCK SERVER running on http://localhost:%s", port)
	log.Printf("   Free user:    test@taxsaver.dev     token: dev-test-token-12345")
	log.Printf("   Premium user: premium@taxsaver.dev  token: dev-premium-token-77777")
	log.Printf("   Admin user:   admin@taxsaver.dev    token: dev-admin-token-99999")
	log.Printf("   Health: http://localhost:%s/health\n", port)

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// ── Handlers: Common ──────────────────────────────────────────────────

func handleHealth(w http.ResponseWriter, r *http.Request) {
	totalUsers := len(mockUserDB)
	premiumCount := 0
	for _, u := range mockUserDB {
		if u.IsPremium { premiumCount++ }
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":       "ok",
		"service":      "TaxSaver MOCK API",
		"mode":         "development",
		"totalUsers":   totalUsers,
		"premiumUsers": premiumCount,
	})
}

func handleUserStatus(w http.ResponseWriter, r *http.Request, user *User) {
	var expiry interface{} = nil
	if user.IsPremium {
		expiry = time.Now().AddDate(1, 0, 0).Format(time.RFC3339)
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"uid":           user.UID,
		"email":         user.Email,
		"name":          user.Name,
		"isPremium":     user.IsPremium,
		"isAdmin":       user.IsAdmin,
		"premiumExpiry": expiry,
	})
}

func handleCreateOrder(w http.ResponseWriter, r *http.Request, user *User) {
	mockOrderID := fmt.Sprintf("order_dev_%d", time.Now().UnixMilli())
	json.NewEncoder(w).Encode(map[string]interface{}{
		"orderId":  mockOrderID,
		"amount":   117900,
		"currency": "INR",
		"keyId":    "rzp_test_MOCK_KEY",
	})
	log.Printf("[Mock] Order created: %s for %s", mockOrderID, user.Email)
}

func handleVerifyPayment(w http.ResponseWriter, r *http.Request, user *User) {
	user.IsPremium = true
	// Also update the mockUserDB
	for _, u := range mockUserDB {
		if u.UID == user.UID { u.IsPremium = true; u.PaymentID = fmt.Sprintf("pay_mock_%d", time.Now().UnixMilli()) }
	}
	expiry := time.Now().AddDate(1, 0, 0).Format(time.RFC3339)
	log.Printf("[Mock] Payment verified — user %s is now Premium", user.Email)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "premiumExpiry": expiry})
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
	log.Println("[Mock] Webhook received (no-op in dev)")
	json.NewEncoder(w).Encode(map[string]interface{}{"received": true})
}

func handleReset(w http.ResponseWriter, r *http.Request) {
	for _, u := range users {
		if !u.IsAdmin { u.IsPremium = false }
	}
	for _, u := range mockUserDB {
		if u.UID == "test-user-001" { u.IsPremium = false }
	}
	log.Println("[Mock] test user premium reset to FREE")
	json.NewEncoder(w).Encode(map[string]interface{}{"reset": true, "isPremium": false})
}

// ── Handlers: Admin ───────────────────────────────────────────────────

func handleAdminStats(w http.ResponseWriter, r *http.Request, user *User) {
	total := len(mockUserDB)
	premium := 0
	for _, u := range mockUserDB { if u.IsPremium { premium++ } }
	free := total - premium
	rate := float64(premium) / float64(total) * 100
	json.NewEncoder(w).Encode(map[string]interface{}{
		"totalUsers":      total,
		"premiumUsers":    premium,
		"freeUsers":       free,
		"conversionRate":  fmt.Sprintf("%.1f%%", rate),
		"mrr":             premium * 999 / 12,    // Monthly Recurring Revenue estimate
		"arr":             premium * 999,          // Annual Recurring Revenue
		"avgRevenuePerUser": 999,
		"newUsersThisMonth": 3,
		"churnRate":       "2.1%",
	})
}

func handleAdminUsers(w http.ResponseWriter, r *http.Request, user *User) {
	json.NewEncoder(w).Encode(mockUserDB)
}

func handleTogglePremium(w http.ResponseWriter, r *http.Request, user *User) {
	var req struct { UID string `json:"uid"` }
	json.NewDecoder(r.Body).Decode(&req)
	for _, u := range mockUserDB {
		if u.UID == req.UID {
			u.IsPremium = !u.IsPremium
			log.Printf("[Admin] %s toggled premium for user %s → %v", user.Email, u.Email, u.IsPremium)
			json.NewEncoder(w).Encode(u)
			return
		}
	}
	http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
}

// ── Middleware ────────────────────────────────────────────────────────

type authedHandler func(http.ResponseWriter, *http.Request, *User)

func authMiddleware(adminOnly bool, next authedHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			http.Error(w, `{"error":"Missing Authorization header"}`, http.StatusUnauthorized)
			return
		}
		token := strings.TrimPrefix(header, "Bearer ")
		user, ok := users[token]
		if !ok {
			http.Error(w, `{"error":"Invalid token"}`, http.StatusUnauthorized)
			return
		}
		if adminOnly && !user.IsAdmin {
			http.Error(w, `{"error":"Admin access required"}`, http.StatusForbidden)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		next(w, r, user)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		next.ServeHTTP(w, r)
	})
}
