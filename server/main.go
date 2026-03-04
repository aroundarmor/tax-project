// server/main.go
// TaxSaver API Server — Go backend entry point.
// Routes: /health, /api/user/status, /api/payment/*
//
// Run:
//   go run main.go
//
// Build (single binary):
//   go build -o taxsaver-server .
//   ./taxsaver-server

package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"taxsaver-server/handlers"
	"taxsaver-server/middleware"
)

func main() {
	// Load .env file (silently ignored if missing in production)
	if err := godotenv.Load(".env"); err != nil {
		log.Println("⚠️  No .env file found — using environment variables from the system")
	}

	// Validate required environment variables
	required := []string{
		"RAZORPAY_KEY_ID",
		"RAZORPAY_KEY_SECRET",
		"FIREBASE_PROJECT_ID",
		"FIREBASE_CLIENT_EMAIL",
		"FIREBASE_PRIVATE_KEY",
	}
	var missing []string
	for _, k := range required {
		v := os.Getenv(k)
		if v == "" || v == "xxxxxxxxxxxxxxxxxxxx" {
			missing = append(missing, k)
		}
	}
	if len(missing) > 0 {
		log.Printf("⚠️  Missing/placeholder env vars: %v", missing)
		log.Println("   Copy server/.env.example → server/.env and fill in your real keys.")
	}

	// Shared context for Firebase operations
	ctx := context.Background()

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// ── Router setup ────────────────────────────────────────
	r := gin.Default()

	// Apply CORS middleware globally
	r.Use(middleware.CORS())

	// ── Health check ─────────────────────────────────────────
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "TaxSaver API (Go)",
			"version": "1.0.0",
		})
	})

	// ── Auth middleware factory ──────────────────────────────
	requireAuth := handlers.RequireAuth(ctx)

	// ── API routes ───────────────────────────────────────────
	api := r.Group("/api")
	{
		// GET /api/user/status
		api.GET("/user/status", requireAuth, handlers.GetUserStatus(ctx))

		// POST /api/payment/create-order
		// POST /api/payment/verify
		// POST /api/payment/webhook  (no auth — HMAC verified instead)
		payment := api.Group("/payment")
		{
			payment.POST("/create-order", requireAuth, handlers.CreateOrder(ctx))
			payment.POST("/verify", requireAuth, handlers.VerifyPayment(ctx))
			payment.POST("/webhook", handlers.Webhook(ctx)) // No auth — raw body needed
		}
	}

	// ── 404 handler ──────────────────────────────────────────
	r.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": fmt.Sprintf("Route not found: %s %s", c.Request.Method, c.Request.URL.Path)})
	})

	// ── Start server ─────────────────────────────────────────
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	addr := ":" + port

	log.Printf("\n🚀 TaxSaver API (Go) running on http://localhost%s", addr)
	log.Printf("   Health: http://localhost%s/health", addr)

	if err := r.Run(addr); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
