package auth

import (
	"context"
	"net/http"
	"strings"

	"github.com/project-management/backend/db"
)

type contextKey string

const UserIDKey contextKey = "userID"

func Middleware(store *SessionStore, database *db.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get session cookie
			cookie, err := r.Cookie("session")
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			// Validate session
			userID, err := store.ValidateSession(cookie.Value, database)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			// Add user ID to context
			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireAuth(store *SessionStore, database *db.DB, handler func(http.ResponseWriter, *http.Request, string)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get session cookie
		cookie, err := r.Cookie("session")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Validate session
		userID, err := store.ValidateSession(cookie.Value, database)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		handler(w, r, userID)
	}
}

func GetUserID(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	return userID, ok
}

func IsAuthenticated(ctx context.Context) bool {
	_, ok := GetUserID(ctx)
	return ok
}

// Check if user has permission for a project
func HasProjectPermission(ctx context.Context, database *db.DB, projectID string, requiredRole string) bool {
	userID, ok := GetUserID(ctx)
	if !ok {
		return false
	}

	var role string
	err := database.Get(&role, `
		SELECT role FROM project_roles 
		WHERE project_id = ? AND user_id = ?
	`, projectID, userID)

	if err != nil {
		return false
	}

	return hasPermission(role, requiredRole)
}

func hasPermission(userRole, requiredRole string) bool {
	roleHierarchy := map[string]int{
		"OWNER":  4,
		"ADMIN":  3,
		"MEMBER": 2,
		"VIEWER": 1,
	}

	userLevel, ok1 := roleHierarchy[strings.ToUpper(userRole)]
	requiredLevel, ok2 := roleHierarchy[strings.ToUpper(requiredRole)]

	if !ok1 || !ok2 {
		return false
	}

	return userLevel >= requiredLevel
}