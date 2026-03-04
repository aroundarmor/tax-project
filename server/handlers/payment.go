package handlers

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	razorpay "github.com/razorpay/razorpay-go"
	fbadmin "taxsaver-server/firebase"
)


// Premium plan price in paise (₹999 + 18% GST = ₹1,179 = 117900 paise)
const premiumAmountPaise = 117900

func razorpayClient() *razorpay.Client {
	return razorpay.NewClient(
		os.Getenv("RAZORPAY_KEY_ID"),
		os.Getenv("RAZORPAY_KEY_SECRET"),
	)
}

// CreateOrder creates a Razorpay order for the Premium plan.
// POST /api/payment/create-order  (auth required)
func CreateOrder(ctx context.Context) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		email, _ := c.Get("email")

		client := razorpayClient()
		data := map[string]interface{}{
			"amount":   premiumAmountPaise,
			"currency": "INR",
			"receipt":  fmt.Sprintf("taxsaver_%s_%d", uid, time.Now().UnixMilli()),
			"notes": map[string]interface{}{
				"uid":   uid,
				"email": email,
				"plan":  "premium_annual",
			},
		}

		body, err := client.Order.Create(data, nil)
		if err != nil {
			log.Printf("[Payment] Create order error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment order"})
			return
		}

		log.Printf("[Payment] Order created: %v for user: %v", body["id"], email)
		c.JSON(http.StatusOK, gin.H{
			"orderId":  body["id"],
			"amount":   body["amount"],
			"currency": body["currency"],
			"keyId":    os.Getenv("RAZORPAY_KEY_ID"),
		})
	}
}

// VerifyPayment verifies client-side Razorpay payment signature and marks user as premium.
// POST /api/payment/verify  (auth required)
func VerifyPayment(ctx context.Context) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		email, _ := c.Get("email")

		var req struct {
			OrderID   string `json:"razorpay_order_id"   binding:"required"`
			PaymentID string `json:"razorpay_payment_id" binding:"required"`
			Signature string `json:"razorpay_signature"  binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing payment verification parameters"})
			return
		}

		// Verify HMAC-SHA256 signature
		secret := os.Getenv("RAZORPAY_KEY_SECRET")
		message := req.OrderID + "|" + req.PaymentID
		mac := hmac.New(sha256.New, []byte(secret))
		mac.Write([]byte(message))
		expected := hex.EncodeToString(mac.Sum(nil))

		if expected != req.Signature {
			log.Printf("[Payment] Signature mismatch for user: %s", uid)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Payment verification failed — invalid signature"})
			return
		}

		// Mark user as premium in Firestore
		if err := markUserPremium(ctx, uid, email.(string), req.PaymentID, req.OrderID); err != nil {
			log.Printf("[Payment] Firestore error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Payment verified but failed to update status. Contact support."})
			return
		}

		expiry := time.Now().AddDate(1, 0, 0).Format(time.RFC3339)
		log.Printf("[Payment] User %s upgraded to premium, expires %s", email, expiry)
		c.JSON(http.StatusOK, gin.H{"success": true, "premiumExpiry": expiry})
	}
}

// Webhook handles Razorpay server-side events (payment.captured, refund.processed).
// POST /api/payment/webhook  (no auth — verified via HMAC signature instead)
func Webhook(ctx context.Context) gin.HandlerFunc {
	return func(c *gin.Context) {
		webhookSecret := os.Getenv("RAZORPAY_WEBHOOK_SECRET")

		// Read raw body BEFORE any JSON parsing (needed for HMAC)
		rawBody, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot read request body"})
			return
		}

		// Verify Razorpay webhook signature
		signature := c.GetHeader("X-Razorpay-Signature")
		mac := hmac.New(sha256.New, []byte(webhookSecret))
		mac.Write(rawBody)
		expected := hex.EncodeToString(mac.Sum(nil))

		if expected != signature {
			log.Println("[Webhook] Invalid signature — possible spoofed request")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook signature"})
			return
		}

		// Parse event
		var event struct {
			Event   string `json:"event"`
			Payload struct {
				Payment struct {
					Entity struct {
						ID    string                 `json:"id"`
						Notes map[string]interface{} `json:"notes"`
					} `json:"entity"`
				} `json:"payment"`
				Refund struct {
					Entity struct {
						PaymentID string `json:"payment_id"`
					} `json:"entity"`
				} `json:"refund"`
			} `json:"payload"`
		}

		if err := parseJSON(rawBody, &event); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
			return
		}

		log.Printf("[Webhook] Received event: %s", event.Event)

		switch event.Event {
		case "payment.captured":
			payment := event.Payload.Payment.Entity
			uid, _ := payment.Notes["uid"].(string)
			emailVal, _ := payment.Notes["email"].(string)
			if uid != "" {
				if err := markUserPremium(ctx, uid, emailVal, payment.ID, ""); err != nil {
					log.Printf("[Webhook] Firestore error for uid %s: %v", uid, err)
				} else {
					log.Printf("[Webhook] User %s upgraded to premium", uid)
				}
			}

		case "refund.processed":
			paymentID := event.Payload.Refund.Entity.PaymentID
			if err := revokePremiumByPaymentID(ctx, paymentID); err != nil {
				log.Printf("[Webhook] Refund revoke error: %v", err)
			}
		}

		c.JSON(http.StatusOK, gin.H{"received": true})
	}
}

// ── Helpers ──────────────────────────────────────────────────────────

func markUserPremium(ctx context.Context, uid, email, paymentID, orderID string) error {
	fb, err := fbadmin.Init(ctx)
	if err != nil {
		return err
	}

	now := time.Now()
	expiry := now.AddDate(1, 0, 0)

	data := map[string]interface{}{
		"email":         email,
		"isPremium":     true,
		"premiumSince":  now.Format(time.RFC3339),
		"premiumExpiry": expiry.Format(time.RFC3339),
		"lastPaymentId": paymentID,
		"lastOrderId":   orderID,
		"updatedAt":     now.Format(time.RFC3339),
	}

	_, err = fb.Firestore.Collection("users").Doc(uid).Set(ctx, data, firestoreMerge())
	return err
}

func revokePremiumByPaymentID(ctx context.Context, paymentID string) error {
	fb, err := fbadmin.Init(ctx)
	if err != nil {
		return err
	}

	docs, err := fb.Firestore.Collection("users").
		Where("lastPaymentId", "==", paymentID).
		Limit(1).
		Documents(ctx).
		GetAll()
	if err != nil || len(docs) == 0 {
		return err
	}

	_, err = docs[0].Ref.Set(ctx, map[string]interface{}{
		"isPremium": false,
		"updatedAt": time.Now().Format(time.RFC3339),
	}, firestoreMerge())
	return err
}

// firestoreMerge returns Firestore MergeAll update option
func firestoreMerge() firestore.SetOption {
	return firestore.MergeAll
}

// parseJSON parses raw bytes into v using encoding/json
func parseJSON(data []byte, v interface{}) error {
	return json.Unmarshal(data, v)
}

