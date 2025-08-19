package model

import (
	"time"
)

type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	Name         string    `json:"name" db:"name"`
	PasswordHash string    `json:"-" db:"password_hash"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
}

type AuthPayload struct {
	User    *User `json:"user"`
	Success bool  `json:"success"`
}

type Project struct {
	ID          string     `json:"id" db:"id"`
	Name        string     `json:"name" db:"name"`
	Description *string    `json:"description" db:"description"`
	OwnerID     string     `json:"-" db:"owner_id"`
	Owner       *User      `json:"owner"`
	CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time  `json:"updatedAt" db:"updated_at"`
	Members     []*ProjectRole `json:"members"`
	Tasks       []*Task    `json:"tasks"`
	Workflow    []*WorkflowStatus `json:"workflow"`
	ShareCodes  []*ShareCode `json:"shareCodes"`
	Stats       *ProjectStats `json:"stats"`
}

type ProjectRole struct {
	ID        string    `json:"id" db:"id"`
	ProjectID string    `json:"-" db:"project_id"`
	Project   *Project  `json:"project"`
	UserID    string    `json:"-" db:"user_id"`
	User      *User     `json:"user"`
	Role      Role      `json:"role" db:"role"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

type Role string

const (
	RoleOwner  Role = "OWNER"
	RoleAdmin  Role = "ADMIN"
	RoleMember Role = "MEMBER"
	RoleViewer Role = "VIEWER"
)

type ProjectStats struct {
	TotalTasks     int `json:"totalTasks"`
	CompletedTasks int `json:"completedTasks"`
	OverdueTasks   int `json:"overdueTasks"`
	TotalMembers   int `json:"totalMembers"`
}

type WorkflowStatus struct {
	ID         string `json:"id" db:"id"`
	ProjectID  string `json:"projectId" db:"project_id"`
	Name       string `json:"name" db:"name"`
	Color      string `json:"color" db:"color"`
	Position   int    `json:"position" db:"position"`
	IsTerminal bool   `json:"isTerminal" db:"is_terminal"`
}

type Task struct {
	ID               string     `json:"id" db:"id"`
	ProjectID        string     `json:"-" db:"project_id"`
	Project          *Project   `json:"project"`
	ParentID         *string    `json:"-" db:"parent_id"`
	Parent           *Task      `json:"parent"`
	Title            string     `json:"title" db:"title"`
	Summary          *string    `json:"summary" db:"summary"`
	StatusID         *string    `json:"-" db:"status_id"`
	Status           *WorkflowStatus `json:"status"`
	AssigneeID       *string    `json:"-" db:"assignee_id"`
	Assignee         *User      `json:"assignee"`
	Priority         Priority   `json:"priority" db:"priority"`
	DueDate          *time.Time `json:"dueDate" db:"due_date"`
	ProgressPct      int        `json:"progressPct" db:"progress_pct"`
	Position         int        `json:"position" db:"position"`
	Depth            int        `json:"depth" db:"depth"`
	CreatedAt        time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt        time.Time  `json:"updatedAt" db:"updated_at"`
	Children         []*Task    `json:"children"`
	Dependencies     *TaskDependencies `json:"dependencies"`
	Documents        []*Document `json:"documents"`
	Canvases         []*Canvas  `json:"canvases"`
	Attachments      []*Attachment `json:"attachments"`
	DocumentCount    int        `json:"documentCount"`
	CanvasCount      int        `json:"canvasCount"`
	AttachmentCount  int        `json:"attachmentCount"`
}

type Priority string

const (
	PriorityLow    Priority = "LOW"
	PriorityMedium Priority = "MEDIUM"
	PriorityHigh   Priority = "HIGH"
	PriorityUrgent Priority = "URGENT"
)

type TaskDependencies struct {
	Blocks    []*Task `json:"blocks"`
	BlockedBy []*Task `json:"blockedBy"`
}

type Document struct {
	ID             string        `json:"id" db:"id"`
	TaskID         string        `json:"taskId" db:"task_id"`
	Name           string        `json:"name" db:"name"`
	CurrentVersion *DocVersion   `json:"currentVersion"`
	Versions       []*DocVersion `json:"versions"`
	CreatedAt      time.Time     `json:"createdAt" db:"created_at"`
}

type DocVersion struct {
	ID         string    `json:"id" db:"id"`
	DocumentID string    `json:"documentId" db:"document_id"`
	Version    int       `json:"version" db:"version"`
	Markdown   string    `json:"markdown" db:"markdown"`
	AuthorID   string    `json:"-" db:"author_id"`
	Author     *User     `json:"author"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
	IsActive   bool      `json:"isActive" db:"is_active"`
}

type Canvas struct {
	ID        string    `json:"id" db:"id"`
	TaskID    string    `json:"taskId" db:"task_id"`
	Name      string    `json:"name" db:"name"`
	Thumbnail *string   `json:"thumbnail" db:"thumbnail"`
	DataJson  string    `json:"dataJson" db:"data_json"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type Attachment struct {
	ID        string         `json:"id" db:"id"`
	TaskID    string         `json:"taskId" db:"task_id"`
	Type      AttachmentType `json:"type" db:"type"`
	Name      string         `json:"name" db:"name"`
	URL       string         `json:"url" db:"url"`
	Size      int            `json:"size" db:"size"`
	MimeType  string         `json:"mimeType" db:"mime_type"`
	CreatedAt time.Time      `json:"createdAt" db:"created_at"`
}

type AttachmentType string

const (
	AttachmentTypeImage AttachmentType = "IMAGE"
	AttachmentTypeFile  AttachmentType = "FILE"
	AttachmentTypeVideo AttachmentType = "VIDEO"
)

type ShareCode struct {
	ID        string     `json:"id" db:"id"`
	ProjectID string     `json:"projectId" db:"project_id"`
	Code      string     `json:"code" db:"code"`
	Role      Role       `json:"role" db:"role"`
	ExpiresAt *time.Time `json:"expiresAt" db:"expires_at"`
	MaxUses   *int       `json:"maxUses" db:"max_uses"`
	Uses      int        `json:"uses" db:"uses"`
	Revoked   bool       `json:"revoked" db:"revoked"`
	CreatedAt time.Time  `json:"createdAt" db:"created_at"`
	CreatedBy *User      `json:"createdBy"`
}

type TaskFilter struct {
	Status       *string    `json:"status"`
	AssigneeID   *string    `json:"assigneeId"`
	Priority     *Priority  `json:"priority"`
	DueDateFrom  *time.Time `json:"dueDateFrom"`
	DueDateTo    *time.Time `json:"dueDateTo"`
	Search       *string    `json:"search"`
}

type Pagination struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
}

type PageInfo struct {
	Total   int  `json:"total"`
	Page    int  `json:"page"`
	Pages   int  `json:"pages"`
	HasNext bool `json:"hasNext"`
	HasPrev bool `json:"hasPrev"`
}

type TaskPage struct {
	Tasks    []*Task   `json:"tasks"`
	PageInfo *PageInfo `json:"pageInfo"`
}