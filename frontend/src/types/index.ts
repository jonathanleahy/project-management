export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type AttachmentType = 'IMAGE' | 'FILE' | 'VIDEO'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  owner?: User
  createdAt: string
  updatedAt: string
  members?: ProjectRole[]
  tasks?: Task[]
  workflow?: WorkflowStatus[]
  shareCodes?: ShareCode[]
  stats?: ProjectStats
}

export interface ProjectRole {
  id: string
  project?: Project
  user?: User
  role: Role
  createdAt: string
}

export interface ProjectStats {
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  totalMembers: number
}

export interface WorkflowStatus {
  id: string
  projectId: string
  name: string
  color: string
  position: number
  isTerminal: boolean
}

export interface Task {
  id: string
  project?: Project
  parent?: Task
  title: string
  summary?: string
  status?: WorkflowStatus
  assignee?: User
  priority: Priority
  dueDate?: string
  progressPct: number
  position: number
  depth: number
  createdAt: string
  updatedAt: string
  children?: Task[]
  dependencies?: TaskDependencies
  documents?: Document[]
  canvases?: Canvas[]
  attachments?: Attachment[]
  documentCount: number
  canvasCount: number
  attachmentCount: number
}

export interface TaskDependencies {
  blocks: Task[]
  blockedBy: Task[]
}

export interface Document {
  id: string
  taskId: string
  name: string
  currentVersion?: DocVersion
  versions?: DocVersion[]
  createdAt: string
}

export interface DocVersion {
  id: string
  documentId: string
  version: number
  markdown: string
  author?: User
  createdAt: string
  isActive: boolean
}

export interface Canvas {
  id: string
  taskId: string
  name: string
  thumbnail?: string
  dataJson: string
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  taskId: string
  type: AttachmentType
  name: string
  url: string
  size: number
  mimeType: string
  createdAt: string
}

export interface ShareCode {
  id: string
  projectId: string
  code: string
  role: Role
  expiresAt?: string
  maxUses?: number
  uses: number
  revoked: boolean
  createdAt: string
  createdBy?: User
}