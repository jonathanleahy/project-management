# Project Management System

A comprehensive project management application with real-time collaboration, task tracking, and visual mockup capabilities.

## Features

### Core Functionality
- **Project Management**: Create and manage multiple projects with team collaboration
- **Task Tracking**: Full CRUD operations for tasks with status management (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- **User Authentication**: Secure session-based authentication with httpOnly cookies
- **Team Collaboration**: Invite team members with role-based access control (OWNER, ADMIN, MEMBER, VIEWER)
- **Comments & Activity**: Track task comments and project activity with real-time updates
- **Canvas Drawing**: Built-in mockup tool for visual planning and wireframing

### Technical Features
- **GraphQL API**: Type-safe API with gqlgen for Go backend
- **Real-time Updates**: Apollo Client with cache management
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Docker Support**: Multi-service orchestration with Docker Compose
- **Database**: MySQL with proper migrations and indexing

## Tech Stack

### Frontend
- React 18 with TypeScript
- Apollo Client for GraphQL
- Tailwind CSS + shadcn/ui components
- React Router for navigation
- Vite for fast development

### Backend
- Go with gqlgen for GraphQL
- MySQL database
- Session-based authentication
- Docker containerization

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Go 1.21+ (for backend development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jonathanleahy/project-management.git
cd project-management
```

2. Start the services with Docker Compose:
```bash
docker-compose up -d
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- GraphQL Playground: http://localhost:8080/playground
- Adminer (Database UI): http://localhost:8081

### Default Credentials
For testing purposes, you can create a user through the registration flow or use:
- Email: test@example.com
- Password: password123

## Project Structure

```
project-management/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and helpers
│   │   └── graphql/      # GraphQL queries and mutations
│   └── package.json
├── backend/               # Go GraphQL backend
│   ├── graph/            # GraphQL schema and resolvers
│   ├── internal/         # Internal packages
│   │   ├── auth/        # Authentication logic
│   │   └── db/          # Database connection
│   ├── migrations/       # Database migrations
│   └── server.go        # Main server entry point
├── docker-compose.yml    # Docker services configuration
└── README.md
```

## API Documentation

### GraphQL Schema

The GraphQL API provides the following main types:
- **User**: User account management
- **Project**: Project creation and management
- **Task**: Task CRUD operations with hierarchical support
- **Comment**: Task comments
- **Activity**: Activity tracking
- **ProjectMember**: Team member management
- **Canvas**: Drawing and mockup data

### Key Queries
```graphql
# Get current user
query GetMe {
  me {
    id
    name
    email
  }
}

# Get user's projects
query GetMyProjects {
  myProjects {
    id
    name
    description
    tasks {
      id
      title
      status
      assignee {
        name
      }
    }
  }
}

# Get task comments
query GetTaskComments($taskId: ID!) {
  getTaskComments(taskId: $taskId) {
    id
    content
    user {
      name
    }
    createdAt
  }
}
```

### Key Mutations
```graphql
# Create a project
mutation CreateProject($name: String!, $description: String) {
  createProject(name: $name, description: $description) {
    id
    name
  }
}

# Create a task
mutation CreateTask($projectId: ID!, $title: String!, $description: String) {
  createTask(
    projectId: $projectId
    title: $title
    description: $description
    status: "TODO"
    priority: "MEDIUM"
  ) {
    id
    title
  }
}

# Add a comment
mutation CreateComment($taskId: ID!, $content: String!) {
  createComment(taskId: $taskId, content: $content) {
    id
    content
  }
}
```

## Features in Detail

### Task Management
- Create, update, and delete tasks
- Assign tasks to team members
- Set priority levels (LOW, MEDIUM, HIGH, URGENT)
- Track task status (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- Add comments and track activity
- Support for subtasks and task dependencies

### Project Creation
Two UI patterns for project creation:
1. **Slide Panel**: A panel that slides in from the right overlay
2. **Inline View**: Full-page transition for focused creation experience

### Canvas/Mockup Tool
- Draw mockups directly in the browser
- Save canvas data with projects
- Multiple drawing tools (pen, eraser, shapes)
- Export mockups as images
- Collaborative drawing capabilities

### Comments & Activity Feed
- Real-time comment updates
- Edit and delete own comments
- Activity tracking for all task changes
- Tabbed interface for comments and activity

### Role-Based Access Control
- **OWNER**: Full control over project and settings
- **ADMIN**: Can manage team members and project settings
- **MEMBER**: Can create, edit, and complete tasks
- **VIEWER**: Read-only access to project and tasks

## Development

### Frontend Development
```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run type-check # Run TypeScript compiler
npm run test       # Run tests
```

### Backend Development
```bash
cd backend
go run server.go              # Run server
go generate ./...             # Generate GraphQL code
go test ./...                 # Run tests
go build -o server server.go  # Build binary
```

### Database Migrations
Migrations are automatically applied when starting the backend. To create new migrations:
```bash
cd backend/migrations
# Create new migration file: YYYYMMDD_description.sql
```

### Using Make Commands
```bash
make dev          # Start all services in development
make build        # Build all containers
make test         # Run all tests
make clean        # Clean up containers and volumes
```

## Testing

### Frontend Tests
```bash
cd frontend
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Backend Tests
```bash
cd backend
go test ./...            # Run all tests
go test -v ./graph/...   # Run GraphQL resolver tests
go test -cover ./...     # Run with coverage
```

## Deployment

### Using Docker
```bash
# Build and run all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Environment Variables

Create a `.env` file in the root directory:
```env
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=projectdb

# Backend
SESSION_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:5173
PORT=8080

# Frontend
VITE_API_URL=http://localhost:8080/query
```

## Troubleshooting

### Common Issues

**Database connection errors:**
- Ensure MySQL container is running: `docker ps`
- Check database credentials in docker-compose.yml
- Verify database is accessible: `docker exec -it project-management-mysql-1 mysql -p`

**Frontend can't connect to backend:**
- Verify backend is running on port 8080
- Check CORS settings in backend
- Ensure cookies are enabled in browser
- Check Apollo Client configuration

**Canvas not saving:**
- Check browser console for errors
- Verify localStorage is not full
- Ensure proper JSON serialization
- Check network tab for GraphQL errors

**Authentication issues:**
- Clear browser cookies and try again
- Check session secret is set
- Verify cookie settings (SameSite, Secure)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow Go best practices and run `go fmt`
- Use ESLint and Prettier for frontend code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Commit Message Format
```
type(scope): subject

body

footer
```

Types: feat, fix, docs, style, refactor, test, chore

## Roadmap

- [ ] Real-time collaboration with WebSockets
- [ ] File attachments for tasks
- [ ] Gantt chart view
- [ ] Calendar integration
- [ ] Email notifications
- [ ] Mobile applications
- [ ] Advanced reporting and analytics
- [ ] Time tracking
- [ ] Recurring tasks
- [ ] Custom fields

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- GraphQL powered by [gqlgen](https://gqlgen.com/)
- Icons from [Lucide](https://lucide.dev/)
- Database management with [MySQL](https://www.mysql.com/)

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/jonathanleahy/project-management/issues) page.

## Security

Please report security vulnerabilities to the maintainers privately.

---

Made with ❤️ by Jonathan Leahy