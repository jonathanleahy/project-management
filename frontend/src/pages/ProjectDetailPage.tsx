import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import TaskTable from '@/components/TaskTable'
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar'

// Mock data for demo
const mockProjects: any = {
  proj1: {
    id: 'proj1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    owner: { id: '1', name: 'Admin User' },
    members: [
      { id: '1', user: { id: '1', name: 'Admin User', email: 'admin@example.com' }, role: 'OWNER' },
      { id: '2', user: { id: '2', name: 'John Doe', email: 'john@example.com' }, role: 'MEMBER' },
      { id: '3', user: { id: '3', name: 'Jane Smith', email: 'jane@example.com' }, role: 'VIEWER' },
    ],
    workflow: [
      { id: 'wf1', name: 'To Do', color: '#94a3b8', position: 0, isTerminal: false },
      { id: 'wf2', name: 'In Progress', color: '#3b82f6', position: 1, isTerminal: false },
      { id: 'wf3', name: 'Review', color: '#f59e0b', position: 2, isTerminal: false },
      { id: 'wf4', name: 'Done', color: '#10b981', position: 3, isTerminal: true },
    ],
  },
  proj2: {
    id: 'proj2',
    name: 'Mobile App Development',
    description: 'Build iOS and Android apps',
    owner: { id: '1', name: 'Admin User' },
    members: [
      { id: '1', user: { id: '1', name: 'Admin User', email: 'admin@example.com' }, role: 'OWNER' },
      { id: '2', user: { id: '2', name: 'Sam Wilson', email: 'sam@example.com' }, role: 'ADMIN' },
      { id: '3', user: { id: '3', name: 'Mary Johnson', email: 'mary@example.com' }, role: 'MEMBER' },
      { id: '4', user: { id: '4', name: 'Bob Smith', email: 'bob@example.com' }, role: 'MEMBER' },
      { id: '5', user: { id: '5', name: 'Alice Brown', email: 'alice@example.com' }, role: 'VIEWER' },
    ],
    workflow: [
      { id: 'wf5', name: 'Backlog', color: '#94a3b8', position: 0, isTerminal: false },
      { id: 'wf6', name: 'In Development', color: '#3b82f6', position: 1, isTerminal: false },
      { id: 'wf7', name: 'Testing', color: '#f59e0b', position: 2, isTerminal: false },
      { id: 'wf8', name: 'Deployed', color: '#10b981', position: 3, isTerminal: true },
    ],
  },
  proj3: {
    id: 'proj3',
    name: 'Marketing Campaign',
    description: 'Q4 2024 marketing campaign',
    owner: { id: '2', name: 'John Doe' },
    members: [
      { id: '1', user: { id: '2', name: 'John Doe', email: 'john@example.com' }, role: 'OWNER' },
      { id: '2', user: { id: '3', name: 'Jane Smith', email: 'jane@example.com' }, role: 'MEMBER' },
    ],
    workflow: [
      { id: 'wf9', name: 'Planning', color: '#94a3b8', position: 0, isTerminal: false },
      { id: 'wf10', name: 'Active', color: '#3b82f6', position: 1, isTerminal: false },
      { id: 'wf11', name: 'Complete', color: '#10b981', position: 2, isTerminal: true },
    ],
  },
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [activeTab, setActiveTab] = useState('tasks')

  const project = mockProjects[projectId || '']

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/projects">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <LayoutWithSidebar>
      {/* Project Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground mt-1">{project.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Settings</Button>
              <Button>New Task</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            <TaskTable projectId={projectId!} workflow={project.workflow} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Members ({project.members.length})</h3>
              <div className="space-y-4">
                {project.members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        member.role === 'OWNER' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                        member.role === 'MEMBER' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Workflow</h3>
              <div className="space-y-4">
                {project.workflow.map((status: any, index: number) => (
                  <div
                    key={status.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="text-sm font-medium text-muted-foreground w-8">
                      {index + 1}
                    </div>
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: status.color }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{status.name}</p>
                      {status.isTerminal && (
                        <p className="text-sm text-muted-foreground">Terminal status - tasks cannot progress further</p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Position: {status.position}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Settings</h3>
              <p className="text-muted-foreground">
                Project settings and configuration options will be available here.
                This includes project name, description, visibility, and advanced options.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWithSidebar>
  )
}