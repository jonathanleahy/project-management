import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  MoreHorizontal, 
  FileText, 
  Palette, 
  Paperclip,
  ChevronRight,
  ChevronDown,
  Edit,
  Search,
  Filter,
  Calendar,
  User,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { DocumentEditor } from './DocumentEditor'
import { CanvasEditor } from './CanvasEditor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { gql, useMutation, useQuery, useApolloClient } from '@apollo/client'
import { useToast } from '@/components/ui/use-toast'

interface TaskTableProps {
  projectId: string
  workflow: any[]
}

interface Task {
  id: string
  title: string
  summary?: string
  status?: any
  assignee?: any
  priority: string
  dueDate?: string
  progressPct: number
  depth: number
  position: number
  documentCount: number
  canvasCount: number
  attachmentCount: number
  children: Task[]
  isExpanded?: boolean
}

// Mock tasks data
const mockTasksData: Record<string, Task[]> = {
  proj1: [
    {
      id: 'task1',
      title: 'Design Homepage',
      summary: 'Create new homepage design',
      status: { id: 'wf2', name: 'In Progress', color: '#3b82f6' },
      assignee: { id: '2', name: 'John Doe' },
      priority: 'HIGH',
      dueDate: '2024-12-15',
      progressPct: 60,
      depth: 0,
      position: 0,
      documentCount: 2,
      canvasCount: 1,
      attachmentCount: 0,
      children: [
        {
          id: 'task2',
          title: 'Create Wireframes',
          summary: 'Initial wireframe designs',
          status: { id: 'wf4', name: 'Done', color: '#10b981' },
          assignee: { id: '2', name: 'John Doe' },
          priority: 'HIGH',
          dueDate: '2024-12-01',
          progressPct: 100,
          depth: 1,
          position: 0,
          documentCount: 1,
          canvasCount: 3,
          attachmentCount: 2,
          children: [],
        },
        {
          id: 'task3',
          title: 'Design Mockups',
          summary: 'High-fidelity mockups',
          status: { id: 'wf2', name: 'In Progress', color: '#3b82f6' },
          assignee: { id: '2', name: 'John Doe' },
          priority: 'HIGH',
          dueDate: '2024-12-10',
          progressPct: 40,
          depth: 1,
          position: 1,
          documentCount: 0,
          canvasCount: 2,
          attachmentCount: 5,
          children: [
            {
              id: 'task3a',
              title: 'Mobile Mockup',
              summary: 'Responsive mobile design',
              status: { id: 'wf2', name: 'In Progress', color: '#3b82f6' },
              assignee: { id: '3', name: 'Jane Smith' },
              priority: 'MEDIUM',
              dueDate: '2024-12-08',
              progressPct: 50,
              depth: 2,
              position: 0,
              documentCount: 0,
              canvasCount: 1,
              attachmentCount: 2,
              children: [],
            },
            {
              id: 'task3b',
              title: 'Desktop Mockup',
              summary: 'Full desktop design',
              status: { id: 'wf1', name: 'To Do', color: '#94a3b8' },
              assignee: { id: '2', name: 'John Doe' },
              priority: 'MEDIUM',
              dueDate: '2024-12-09',
              progressPct: 30,
              depth: 2,
              position: 1,
              documentCount: 1,
              canvasCount: 1,
              attachmentCount: 0,
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 'task4',
      title: 'Implement Backend API',
      summary: 'Build RESTful API',
      status: { id: 'wf1', name: 'To Do', color: '#94a3b8' },
      assignee: { id: '1', name: 'Admin User' },
      priority: 'MEDIUM',
      dueDate: '2024-12-20',
      progressPct: 0,
      depth: 0,
      position: 1,
      documentCount: 3,
      canvasCount: 0,
      attachmentCount: 1,
      children: [],
    },
  ],
  proj2: [
    {
      id: 'task5',
      title: 'Setup Development Environment',
      summary: 'Configure dev tools and dependencies',
      status: { id: 'wf8', name: 'Deployed', color: '#10b981' },
      assignee: null,
      priority: 'LOW',
      dueDate: '2024-11-01',
      progressPct: 100,
      depth: 0,
      position: 0,
      documentCount: 1,
      canvasCount: 0,
      attachmentCount: 0,
      children: [],
    },
    {
      id: 'task6',
      title: 'User Authentication',
      summary: 'Implement login/signup flow',
      status: { id: 'wf6', name: 'In Development', color: '#3b82f6' },
      assignee: { id: '2', name: 'Sam Wilson' },
      priority: 'HIGH',
      dueDate: '2024-12-05',
      progressPct: 75,
      depth: 0,
      position: 1,
      documentCount: 2,
      canvasCount: 1,
      attachmentCount: 3,
      children: [
        {
          id: 'task7',
          title: 'OAuth Integration',
          summary: 'Google and GitHub OAuth',
          status: { id: 'wf6', name: 'In Development', color: '#3b82f6' },
          assignee: { id: '3', name: 'Mary Johnson' },
          priority: 'MEDIUM',
          dueDate: '2024-12-03',
          progressPct: 80,
          depth: 1,
          position: 0,
          documentCount: 1,
          canvasCount: 0,
          attachmentCount: 0,
          children: [],
        },
        {
          id: 'task8',
          title: 'Email Verification',
          summary: 'Email verification system',
          status: { id: 'wf7', name: 'Testing', color: '#f59e0b' },
          assignee: { id: '4', name: 'Bob Smith' },
          priority: 'HIGH',
          dueDate: '2024-12-04',
          progressPct: 90,
          depth: 1,
          position: 1,
          documentCount: 1,
          canvasCount: 0,
          attachmentCount: 1,
          children: [],
        },
      ],
    },
  ],
}

// GraphQL Queries and Mutations
const LIST_TASKS = gql`
  query ListTasks($projectId: ID!, $parentId: ID) {
    listTasks(projectId: $projectId, parentId: $parentId) {
      tasks {
        id
        title
        summary
        priority
        dueDate
        progressPct
        position
        depth
        documentCount
        canvasCount
        attachmentCount
        status {
          id
          name
          color
        }
        assignee {
          id
          name
        }
        children {
          id
        }
      }
    }
  }
`

const CREATE_DOCUMENT = gql`
  mutation CreateDocument($taskId: ID!, $name: String!, $markdown: String!) {
    createDocument(taskId: $taskId, name: $name, markdown: $markdown) {
      id
      name
    }
  }
`

const CREATE_CANVAS = gql`
  mutation CreateCanvas($taskId: ID!, $name: String!, $dataJson: String!) {
    createCanvas(taskId: $taskId, name: $name, dataJson: $dataJson) {
      id
      name
      dataJson
    }
  }
`

const UPDATE_CANVAS = gql`
  mutation UpdateCanvas($id: ID!, $name: String, $dataJson: String) {
    updateCanvas(id: $id, name: $name, dataJson: $dataJson) {
      id
      name
      dataJson
    }
  }
`

const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      summary
      priority
      dueDate
      progressPct
      status {
        id
        name
        color
      }
      assignee {
        id
        name
      }
    }
  }
`

const GET_PROJECT_WORKFLOW = gql`
  query GetProjectWorkflow($projectId: ID!) {
    getProjectWorkflow(projectId: $projectId) {
      id
      name
      color
      position
      isTerminal
    }
  }
`

const GET_PROJECT_MEMBERS = gql`
  query GetProject($id: ID!) {
    getProject(id: $id) {
      members {
        user {
          id
          name
          email
        }
        role
      }
    }
  }
`

const GET_TASKS = gql`
  query GetTasks($projectId: ID!) {
    listTasks(projectId: $projectId) {
      tasks {
        id
        title
        summary
        priority
        progressPct
        dueDate
        depth
        position
        parentId
        status {
          id
          name
          color
        }
        assignee {
          id
          name
        }
      }
    }
  }
`

const GET_TASK_CANVASES = gql`
  query GetTaskCanvases($taskId: ID!) {
    getTaskCanvases(taskId: $taskId) {
      id
      name
      dataJson
      thumbnail
    }
  }
`

export default function TaskTable({ projectId, workflow }: TaskTableProps) {
  const client = useApolloClient()
  const { toast } = useToast()
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['task1', 'task3', 'task6']))
  const [showDocumentEditor, setShowDocumentEditor] = useState(false)
  const [showCanvasEditor, setShowCanvasEditor] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null)
  const [selectedCanvas, setSelectedCanvas] = useState<any | null>(null)
  const [taskCanvases, setTaskCanvases] = useState<any[]>([])
  
  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskSummary, setNewTaskSummary] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM')
  const [newTaskStatusId, setNewTaskStatusId] = useState('')
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskParentId, setNewTaskParentId] = useState<string | null>(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  
  // Mutations
  const [createDocument] = useMutation(CREATE_DOCUMENT)
  const [createCanvas] = useMutation(CREATE_CANVAS, {
    refetchQueries: ['GetTaskCanvases']
  })
  const [updateCanvas] = useMutation(UPDATE_CANVAS, {
    refetchQueries: ['GetTaskCanvases']
  })
  const [createTask] = useMutation(CREATE_TASK, {
    refetchQueries: ['GetTasks', 'ListTasks']
  })
  
  // Query for tasks
  const { data: tasksData, loading, error, refetch } = useQuery(GET_TASKS, {
    variables: { projectId },
    skip: !projectId,
  })
  
  // Query for workflow statuses
  const { data: workflowData } = useQuery(GET_PROJECT_WORKFLOW, {
    variables: { projectId },
    skip: !projectId,
  })
  
  // Query for project members
  const { data: membersData } = useQuery(GET_PROJECT_MEMBERS, {
    variables: { id: projectId },
    skip: !projectId,
  })
  
  // Set default status when workflow loads
  useEffect(() => {
    if (workflowData?.getProjectWorkflow && workflowData.getProjectWorkflow.length > 0) {
      setNewTaskStatusId(workflowData.getProjectWorkflow[0].id)
    }
  }, [workflowData])
  
  // Use real data if available, otherwise fall back to mock data
  const allTasks = tasksData?.listTasks?.tasks || mockTasksData[projectId] || []
  
  // Filter tasks based on search and filters
  const filterTasks = (tasks: Task[]): Task[] => {
    return tasks.map(task => {
      // First filter the current task
      let passesFilter = true
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        passesFilter = passesFilter && (
          task.title.toLowerCase().includes(query) ||
          (task.summary && task.summary.toLowerCase().includes(query))
        )
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        passesFilter = passesFilter && task.status?.id === statusFilter
      }
      
      // Priority filter
      if (priorityFilter !== 'all') {
        passesFilter = passesFilter && task.priority === priorityFilter
      }
      
      // Assignee filter
      if (assigneeFilter !== 'all') {
        passesFilter = passesFilter && task.assignee?.id === assigneeFilter
      }
      
      // Recursively filter children
      const filteredChildren = task.children ? filterTasks(task.children) : []
      
      // Include task if it passes filter OR has children that pass
      if (passesFilter || filteredChildren.length > 0) {
        return { ...task, children: filteredChildren }
      }
      
      return null
    }).filter(task => task !== null) as Task[]
  }
  
  const tasks = filterTasks(allTasks)
  
  // Get unique values for filter dropdowns
  const allStatuses = Array.from(new Set(allTasks.flatMap((t: Task) => 
    [t.status, ...(t.children?.flatMap((c: Task) => c.status) || [])]
  ).filter(Boolean)))
  
  const allAssignees = Array.from(new Set(allTasks.flatMap((t: Task) => 
    [t.assignee, ...(t.children?.flatMap((c: Task) => c.assignee) || [])]
  ).filter(Boolean)))
  
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      })
      return
    }
    
    try {
      const input: any = {
        projectId,
        title: newTaskTitle,
        priority: newTaskPriority,
      }
      
      if (newTaskSummary) input.summary = newTaskSummary
      if (newTaskStatusId) input.statusId = newTaskStatusId
      if (newTaskAssigneeId && newTaskAssigneeId !== 'unassigned') input.assigneeId = newTaskAssigneeId
      if (newTaskDueDate) input.dueDate = newTaskDueDate
      if (newTaskParentId && newTaskParentId !== 'none') input.parentId = newTaskParentId
      
      await createTask({
        variables: { input }
      })
      
      toast({
        title: "Success",
        description: "Task created successfully!",
      })
      
      // Reset form
      setNewTaskTitle('')
      setNewTaskSummary('')
      setNewTaskPriority('MEDIUM')
      setNewTaskAssigneeId('')
      setNewTaskDueDate('')
      setNewTaskParentId(null)
      setShowCreateTask(false)
      
      // Refetch tasks
      refetch()
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const renderTaskRow = (task: Task, level: number = 0) => {
    const hasChildren = task.children && task.children.length > 0
    const isExpanded = expandedTasks.has(task.id)
    const indentPadding = `${level * 2}rem`

    const priorityColors = {
      LOW: 'text-blue-600 bg-blue-50',
      MEDIUM: 'text-yellow-600 bg-yellow-50',
      HIGH: 'text-orange-600 bg-orange-50',
      URGENT: 'text-red-600 bg-red-50',
    }

    return (
      <React.Fragment key={task.id}>
        <tr className="border-b hover:bg-muted/50 transition-colors">
          {/* Title column with indentation */}
          <td className="py-3 px-4">
            <div 
              className="flex items-center gap-2"
              style={{ paddingLeft: indentPadding }}
            >
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(task.id)}
                  className="p-0.5 hover:bg-muted rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              {!hasChildren && level > 0 && <div className="w-5" />}
              
              <div className="flex-1">
                <div className="font-medium">{task.title}</div>
                {task.summary && (
                  <div className="text-sm text-muted-foreground">{task.summary}</div>
                )}
              </div>
              
              {/* Attachment indicators - clickable to open */}
              <div className="flex items-center gap-2">
                {task.documentCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTask(task)
                      setSelectedDocument(task.documents?.[0] || { name: 'Document', markdown: '# Sample Document\n\nThis is an existing document.' })
                      setShowDocumentEditor(true)
                    }}
                    className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-blue-600 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>{task.documentCount}</span>
                  </button>
                )}
                {task.canvasCount > 0 && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      setSelectedTask(task)
                      // Fetch existing canvases for the task
                      try {
                        const { data } = await client.query({
                          query: GET_TASK_CANVASES,
                          variables: { taskId: task.id },
                          fetchPolicy: 'network-only'
                        })
                        setTaskCanvases(data.getTaskCanvases || [])
                        // If there are existing canvases, load the first one
                        if (data.getTaskCanvases && data.getTaskCanvases.length > 0) {
                          console.log('Loading canvas:', data.getTaskCanvases[0])
                          setSelectedCanvas(data.getTaskCanvases[0])
                        } else {
                          setSelectedCanvas(null) // New canvas
                        }
                      } catch (error) {
                        console.error('Error fetching canvases:', error)
                        setTaskCanvases([])
                        setSelectedCanvas(null)
                      }
                      setShowCanvasEditor(true)
                    }}
                    className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-purple-600 transition-colors"
                  >
                    <Palette className="h-3.5 w-3.5" />
                    <span>{task.canvasCount}</span>
                  </button>
                )}
                {task.attachmentCount > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>{task.attachmentCount}</span>
                  </div>
                )}
              </div>
            </div>
          </td>

          {/* Status */}
          <td className="py-3 px-4">
            {task.status && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${task.status.color}20`,
                  color: task.status.color 
                }}
              >
                <div className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: task.status.color }} 
                />
                {task.status.name}
              </div>
            )}
          </td>

          {/* Assignee */}
          <td className="py-3 px-4">
            <span className="text-sm">
              {task.assignee?.name || '-'}
            </span>
          </td>

          {/* Priority */}
          <td className="py-3 px-4">
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded",
              priorityColors[task.priority as keyof typeof priorityColors]
            )}>
              {task.priority}
            </span>
          </td>

          {/* Due Date */}
          <td className="py-3 px-4">
            <span className="text-sm">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
            </span>
          </td>

          {/* Progress */}
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="w-20 bg-secondary rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${task.progressPct}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground min-w-[3rem]">
                {task.progressPct}%
              </span>
            </div>
          </td>

          {/* Actions */}
          <td className="py-3 px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTask(task)
                    setSelectedDocument(null) // New document
                    setShowDocumentEditor(true)
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {task.documentCount > 0 ? 'View/Edit Documents' : 'Add Document'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTask(task)
                    // Fetch existing canvases for the task
                    try {
                      const { data } = await client.query({
                        query: GET_TASK_CANVASES,
                        variables: { taskId: task.id },
                        fetchPolicy: 'network-only'
                      })
                      setTaskCanvases(data.getTaskCanvases || [])
                      // If there are existing canvases, load the first one
                      if (data.getTaskCanvases && data.getTaskCanvases.length > 0) {
                        console.log('Loading canvas from menu:', data.getTaskCanvases[0])
                        setSelectedCanvas(data.getTaskCanvases[0])
                      } else {
                        setSelectedCanvas(null) // New canvas
                      }
                    } catch (error) {
                      console.error('Error fetching canvases:', error)
                      setTaskCanvases([])
                      setSelectedCanvas(null)
                    }
                    setShowCanvasEditor(true)
                  }}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  {task.canvasCount > 0 ? 'View/Edit Canvas' : 'Add Canvas'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Paperclip className="mr-2 h-4 w-4" />
                  Add Attachment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>

        {/* Render children if expanded */}
        {isExpanded && task.children && task.children.map((child) => 
          renderTaskRow(child, level + 1)
        )}
      </React.Fragment>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search" className="text-sm mb-1 block">Search Tasks</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by title or summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="min-w-[140px]">
            <Label htmlFor="status" className="text-sm mb-1 block">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {allStatuses.map((status: any) => (
                  <SelectItem key={status.id} value={status.id}>
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      {status.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Priority Filter */}
          <div className="min-w-[140px]">
            <Label htmlFor="priority" className="text-sm mb-1 block">Priority</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Assignee Filter */}
          <div className="min-w-[140px]">
            <Label htmlFor="assignee" className="text-sm mb-1 block">Assignee</Label>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger id="assignee">
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {allAssignees.map((assignee: any) => (
                  <SelectItem key={assignee.id} value={assignee.id}>
                    <span className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      {assignee.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Clear Filters Button */}
          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setPriorityFilter('all')
                setAssigneeFilter('all')
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        {/* Results count */}
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {tasks.length} of {allTasks.length} tasks
        </div>
      </Card>
      
      {/* Task Table */}
      <Card>
        <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Tasks</h3>
        <Button size="sm" onClick={() => setShowCreateTask(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Task
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Title</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Assignee</th>
              <th className="text-left py-3 px-4 font-medium">Priority</th>
              <th className="text-left py-3 px-4 font-medium">Due Date</th>
              <th className="text-left py-3 px-4 font-medium">Progress</th>
              <th className="text-left py-3 px-4 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => renderTaskRow(task))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tasks yet</p>
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </div>
        )}
      </div>
      
      {/* Document Editor Modal */}
      {showDocumentEditor && selectedTask && (
        <DocumentEditor
          document={selectedDocument}
          taskId={selectedTask.id}
          onSave={async (name, markdown) => {
            try {
              if (selectedDocument) {
                console.log('Updating document:', { name, markdown, taskId: selectedTask.id })
              } else {
                console.log('Creating new document:', { name, markdown, taskId: selectedTask.id })
                await createDocument({
                  variables: {
                    taskId: selectedTask.id,
                    name,
                    markdown
                  }
                })
                // Update the task's document count
                selectedTask.documentCount = (selectedTask.documentCount || 0) + 1
              }
            } catch (error) {
              console.error('Error saving document:', error)
            }
            setShowDocumentEditor(false)
            setSelectedTask(null)
            setSelectedDocument(null)
          }}
          onCancel={() => {
            setShowDocumentEditor(false)
            setSelectedTask(null)
            setSelectedDocument(null)
          }}
        />
      )}
      
      {/* Canvas Editor Modal */}
      {showCanvasEditor && selectedTask && (
        <CanvasEditor
          canvas={selectedCanvas}
          taskId={selectedTask.id}
          onSave={async (name, dataJson) => {
            try {
              if (selectedCanvas?.id) {
                console.log('Updating canvas:', { id: selectedCanvas.id, name, dataJson })
                const result = await updateCanvas({
                  variables: {
                    id: selectedCanvas.id,
                    name,
                    dataJson
                  }
                })
                // Show success toast
                toast({
                  title: "Success",
                  description: "Canvas updated successfully!",
                })
              } else {
                console.log('Creating new canvas:', { name, dataJson, taskId: selectedTask.id })
                const result = await createCanvas({
                  variables: {
                    taskId: selectedTask.id,
                    name,
                    dataJson
                  }
                })
                // Update the task's canvas count locally
                const taskToUpdate = allTasks.find((t: Task) => t.id === selectedTask.id)
                if (taskToUpdate) {
                  taskToUpdate.canvasCount = (taskToUpdate.canvasCount || 0) + 1
                }
                // Show success toast
                toast({
                  title: "Success",
                  description: "Canvas created successfully!",
                })
                // Refetch tasks to update counts
                if (refetch) {
                  refetch()
                }
              }
            } catch (error) {
              console.error('Error saving canvas:', error)
              // Show error toast
              toast({
                title: "Error",
                description: "Failed to save canvas. Please try again.",
                variant: "destructive",
              })
            }
            setShowCanvasEditor(false)
            setSelectedTask(null)
            setSelectedCanvas(null)
          }}
          onCancel={() => {
            setShowCanvasEditor(false)
            setSelectedTask(null)
            setSelectedCanvas(null)
          }}
        />
      )}
      
      {/* Create Task Modal */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="task-summary">Summary</Label>
              <Textarea
                id="task-summary"
                value={newTaskSummary}
                onChange={(e) => setNewTaskSummary(e.target.value)}
                placeholder="Enter task description"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-status">Status</Label>
                <Select value={newTaskStatusId} onValueChange={setNewTaskStatusId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflowData?.getProjectWorkflow?.map((status: any) => (
                      <SelectItem key={status.id} value={status.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: status.color }}
                          />
                          {status.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select value={newTaskAssigneeId} onValueChange={setNewTaskAssigneeId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {membersData?.getProject?.members?.map((member: any) => (
                      <SelectItem key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            {allTasks.length > 0 && (
              <div>
                <Label htmlFor="task-parent">Parent Task (optional)</Label>
                <Select value={newTaskParentId || ''} onValueChange={(value) => setNewTaskParentId(value || null)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="No parent task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent task</SelectItem>
                    {allTasks.map((task: Task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateTask(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
    </div>
  )
}