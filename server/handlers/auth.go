// server/handlers/auth.go
// Auth middleware and user status handler for the Gin router.
// Verifies Firebase ID tokens from the Authorization: Bearer header.

package handlers

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	fbadmin "taxsaver-server/firebase"
)

// RequireAuth is a Gin middleware that verifies Firebase ID tokens.
// On success, sets "uid" and "email" in the context for downstream handlers.
func RequireAuth(ctx context.Context) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid Authorization header"})
			return
		}
		idToken := strings.TrimPrefix(header, "Bearer ")

		fb, err := fbadmin.Init(ctx)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Firebase not initialized"})
			return
		}

		token, err := fb.Auth.VerifyIDToken(ctx, idToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized — invalid or expired token"})
			return
		}

		c.Set("uid", token.UID)
		c.Set("email", token.Claims["email"])
		c.Next()
	}
}

// GetUserStatus returns the authenticated user's premium status from Firestore.
// GET /api/user/status
func GetUserStatus(ctx context.Context) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		email, _ := c.Get("email")

		fb, err := fbadmin.Init(ctx)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Firebase not initialized"})
			return
		}

		doc, err := fb.Firestore.Collection("users").Doc(uid).Get(ctx)
		if err != nil || !doc.Exists() {
			// User not in Firestore yet — they're on the free plan
			c.JSON(http.StatusOK, gin.H{
				"uid":       uid,
				"email":     email,
				"isPremium": false,
			})
			return
		}

		data := doc.Data()
		isPremium, _ := data["isPremium"].(bool)

		c.JSON(http.StatusOK, gin.H{
			"uid":           uid,
			"email":         email,
			"isPremium":     isPremium,
			"premiumSince":  data["premiumSince"],
			"premiumExpiry": data["premiumExpiry"],
		})
	}
}
