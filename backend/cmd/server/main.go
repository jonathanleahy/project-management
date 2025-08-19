package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
	"github.com/project-management/backend/auth"
	"github.com/project-management/backend/db"
	"github.com/project-management/backend/graph"
	"github.com/rs/cors"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize database
	database, err := db.Connect()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Initialize session store
	sessionStore := auth.NewSessionStore()

	// Create GraphQL server
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{
		Resolvers: &graph.Resolver{
			DB:           database,
			SessionStore: sessionStore,
		},
	}))

	// Setup routes
	router := mux.NewRouter()

	// GraphQL endpoint with auth middleware and response writer context
	router.Handle("/graphql", auth.Middleware(sessionStore, database)(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Add response writer to context for cookie handling
			ctx := context.WithValue(r.Context(), "GinContext", map[string]interface{}{
				"ResponseWriter": w,
				"Request":        r,
			})
			srv.ServeHTTP(w, r.WithContext(ctx))
		}),
	))

	// GraphQL playground (development only)
	if os.Getenv("ENV") != "production" {
		router.Handle("/playground", playground.Handler("GraphQL playground", "/graphql"))
		log.Printf("GraphQL playground available at http://localhost:%s/playground", port)
	}

	// File upload endpoint
	router.HandleFunc("/upload", auth.RequireAuth(sessionStore, database, handleFileUpload)).Methods("POST")

	// Static files for uploads
	router.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Setup CORS
	corsOrigins := os.Getenv("CORS_ORIGINS")
	if corsOrigins == "" {
		corsOrigins = "http://localhost:3000"
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{corsOrigins},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	log.Printf("Server starting on port %s", port)
	log.Printf("GraphQL playground available at http://localhost:%s/playground", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func handleFileUpload(w http.ResponseWriter, r *http.Request, userID string) {
	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		http.Error(w, "File too large", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Invalid file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// TODO: Implement file upload logic
	// - Save to disk or S3
	// - Create database record
	// - Return file URL

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"url": "/uploads/` + header.Filename + `"}`))
}