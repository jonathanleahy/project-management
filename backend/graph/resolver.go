package graph

import (
	"github.com/project-management/backend/auth"
	"github.com/project-management/backend/db"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB           *db.DB
	SessionStore *auth.SessionStore
}