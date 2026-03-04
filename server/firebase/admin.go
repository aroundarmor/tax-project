// server/firebase/admin.go
// Initializes the Firebase Admin SDK (auth + Firestore) from environment variables.
// A single shared instance is used across the entire application.

package firebase

import (
	"context"
	"fmt"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

// App holds the initialized Firebase services
type App struct {
	Auth      *auth.Client
	Firestore *firestore.Client
}

var instance *App

// Init initializes the Firebase Admin SDK once and returns the shared App.
func Init(ctx context.Context) (*App, error) {
	if instance != nil {
		return instance, nil
	}

	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	clientEmail := os.Getenv("FIREBASE_CLIENT_EMAIL")
	privateKey := os.Getenv("FIREBASE_PRIVATE_KEY")

	if projectID == "" || clientEmail == "" || privateKey == "" {
		return nil, fmt.Errorf("missing Firebase env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY")
	}

	// Build service account credentials JSON in memory — no file needed
	credJSON := fmt.Sprintf(`{
		"type": "service_account",
		"project_id": "%s",
		"private_key": "%s",
		"client_email": "%s",
		"token_uri": "https://oauth2.googleapis.com/token"
	}`, projectID, privateKey, clientEmail)

	opt := option.WithCredentialsJSON([]byte(credJSON))

	app, err := firebase.NewApp(ctx, &firebase.Config{ProjectID: projectID}, opt)
	if err != nil {
		return nil, fmt.Errorf("firebase.NewApp: %w", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("app.Auth: %w", err)
	}

	fsClient, err := app.Firestore(ctx)
	if err != nil {
		return nil, fmt.Errorf("app.Firestore: %w", err)
	}

	instance = &App{Auth: authClient, Firestore: fsClient}
	return instance, nil
}
