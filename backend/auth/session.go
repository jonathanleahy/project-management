package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/sessions"
	"github.com/project-management/backend/db"
	"golang.org/x/crypto/bcrypt"
)

type SessionStore struct {
	store *sessions.CookieStore
}

func NewSessionStore() *SessionStore {
	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		secret = "your-secret-key-change-in-production"
	}

	store := sessions.NewCookieStore([]byte(secret))
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false, // Don't require HTTPS in development
	}
	
	if os.Getenv("ENV") == "production" {
		store.Options.Secure = true
		store.Options.SameSite = http.SameSiteStrictMode
	}

	return &SessionStore{store: store}
}

func (s *SessionStore) CreateSession(w http.ResponseWriter, r *http.Request, userID string, database *db.DB) error {
	// Generate session token
	token := generateToken()

	// Store session in database
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	_, err := database.Exec(`
		INSERT INTO sessions (id, user_id, token, expires_at) 
		VALUES (UUID(), ?, ?, ?)
	`, userID, token, expiresAt)

	if err != nil {
		return err
	}

	// Set cookie with proper settings for development
	cookie := &http.Cookie{
		Name:     "session",
		Value:    token,
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	
	// In production, use secure cookies
	if os.Getenv("ENV") == "production" {
		cookie.Secure = true
		cookie.SameSite = http.SameSiteStrictMode
	}
	
	http.SetCookie(w, cookie)

	return nil
}

func (s *SessionStore) ValidateSession(token string, database *db.DB) (string, error) {
	var userID string
	var expiresAt time.Time

	err := database.QueryRow(`
		SELECT user_id, expires_at FROM sessions 
		WHERE token = ? AND expires_at > NOW()
	`, token).Scan(&userID, &expiresAt)

	if err != nil {
		return "", errors.New("invalid or expired session")
	}

	return userID, nil
}

func (s *SessionStore) DestroySession(w http.ResponseWriter, r *http.Request, database *db.DB) error {
	cookie, err := r.Cookie("session")
	if err != nil {
		return err
	}

	// Delete from database
	_, err = database.Exec("DELETE FROM sessions WHERE token = ?", cookie.Value)
	if err != nil {
		return err
	}

	// Clear cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})

	return nil
}

func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func ValidatePassword(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}
	return nil
}