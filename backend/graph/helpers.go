package graph

import (
	"crypto/rand"
	"encoding/base64"
	"strings"

	"github.com/project-management/backend/db"
)

// GenerateID generates a new UUID using the database
func GenerateID(database *db.DB) (string, error) {
	return db.GenerateID(database)
}

// generateShareCode generates a unique share code
func generateShareCode() string {
	b := make([]byte, 8)
	rand.Read(b)
	code := base64.URLEncoding.EncodeToString(b)
	// Remove padding and make it URL-safe
	code = strings.TrimRight(code, "=")
	return strings.ToUpper(code)
}

// hasProjectAccess checks if a user has the required role in a project
func hasProjectAccess(database *db.DB, userID string, projectID string, requiredRole string) bool {
	var userRole string
	err := database.Get(&userRole, `
		SELECT role FROM project_roles 
		WHERE project_id = ? AND user_id = ?
	`, projectID, userID)
	
	if err != nil {
		return false
	}
	
	// Role hierarchy: OWNER > ADMIN > MEMBER > VIEWER
	roleHierarchy := map[string]int{
		"OWNER":  4,
		"ADMIN":  3,
		"MEMBER": 2,
		"VIEWER": 1,
	}
	
	userLevel, hasUserRole := roleHierarchy[userRole]
	requiredLevel, hasRequiredRole := roleHierarchy[requiredRole]
	
	if !hasUserRole || !hasRequiredRole {
		return false
	}
	
	return userLevel >= requiredLevel
}