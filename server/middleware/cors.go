// server/middleware/cors.go
// CORS middleware for the Gin router.
// Restricts origins to the configured frontend URL from the .env file.

package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// CORS returns a Gin middleware that handles Cross-Origin Resource Sharing.
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		frontendURL := os.Getenv("FRONTEND_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:5500"
		}

		allowedOrigins := map[string]bool{
			frontendURL:            true,
			"http://localhost:5500": true,
			"http://127.0.0.1:5500": true,
		}

		origin := c.Request.Header.Get("Origin")
		if allowedOrigins[origin] {
			c.Header("Access-Control-Allow-Origin", origin)
		}
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
