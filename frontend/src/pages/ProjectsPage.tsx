import { useState } from 'react'
import { Plus, Users, Calendar, CheckCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/utils'
import { SlidePanel } from '@/components/SlidePanel'
import { gql, useMutation } from '@apollo/client'
import { useToast } from '@/components/ui/use-toast'

// Mock data for demo
const mockProjects = [
  {
    id: 'proj1',
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    createdAt: new Date('2024-01-15'),
    owner: { id: '1', name: 'Admin User' },
    members: [
      { id: '1', user: { id: '1', name: 'Admin User' }, role: 'OWNER' },
      { id: '2', user: { id: '2', name: 'John Doe' }, role: 'MEMBER' },
    ],
    stats: {
      totalTasks: 12,
      completedTasks: 7,
      totalMembers: 3,
    },
  },
  {
    id: 'proj2',
    name: 'Mobile App Development',
    description: 'Build iOS and Android apps',
    createdAt: new Date('2024-02-01'),
    owner: { id: '1', name: 'Admin User' },
    members: [
      { id: '3', user: { id: '1', name: 'Admin User' }, role: 'OWNER' },
      { id: '4', user: { id: '3', name: 'Jane Smith' }, role: 'ADMIN' },
    ],
    stats: {
      totalTasks: 25,
      completedTasks: 10,
      totalMembers: 5,
    },
  },
]

const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String) {
    createProject(name: $name, description: $description) {
      id
      name
      description
      createdAt
    }
  }
`

export default function ProjectsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const [showInlineCreate, setShowInlineCreate] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [projects, setProjects] = useState(mockProjects)
  const [isCreating, setIsCreating] = useState(false)
  
  const [createProject] = useMutation(CREATE_PROJECT, {
    onCompleted: (data) => {
      toast({
        title: "Success",
        description: "Project created successfully!",
      })
      // In production, this would refetch the projects list
      setProjects([...projects, {
        ...data.createProject,
        owner: { id: '1', name: user?.name || 'User' },
        members: [],
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          totalMembers: 1,
        },
      }])
      handleClosePanel()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setIsCreating(false)
    }
  })

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    
    // Try to use the mutation first, fall back to mock if it fails
    try {
      await createProject({
        variables: {
          name: newProjectName,
          description: newProjectDescription || null
        }
      })
    } catch (error) {
      // Fallback to mock data if GraphQL fails
      const newProject = {
        id: `proj${projects.length + 1}`,
        name: newProjectName,
        description: newProjectDescription || 'No description',
        createdAt: new Date(),
        owner: { id: '1', name: user?.name || 'User' },
        members: [
          { id: `${projects.length + 1}`, user: { id: '1', name: user?.name || 'User' }, role: 'OWNER' },
        ],
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          totalMembers: 1,
        },
      }
      setProjects([...projects, newProject])
      handleClosePanel()
    }
  }
  
  const handleClosePanel = () => {
    setShowCreatePanel(false)
    setNewProjectName('')
    setNewProjectDescription('')
    setIsCreating(false)
  }
  
  const handleCloseInline = () => {
    setShowInlineCreate(false)
    setNewProjectName('')
    setNewProjectDescription('')
    setIsCreating(false)
  }
  
  const handleCreateProjectInline = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    
    // Simulate a slight delay for animation
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Try to use the mutation first, fall back to mock if it fails
    try {
      await createProject({
        variables: {
          name: newProjectName,
          description: newProjectDescription || null
        }
      })
    } catch (error) {
      // Fallback to mock data if GraphQL fails
      const newProject = {
        id: `proj${projects.length + 1}`,
        name: newProjectName,
        description: newProjectDescription || 'No description',
        createdAt: new Date(),
        owner: { id: '1', name: user?.name || 'User' },
        members: [
          { id: `${projects.length + 1}`, user: { id: '1', name: user?.name || 'User' }, role: 'OWNER' },
        ],
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          totalMembers: 1,
        },
      }
      setProjects([...projects, newProject])
      handleCloseInline()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Project Management</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Projects List View - Show when not creating */}
        <div 
          className={`transition-all duration-500 ease-out ${
            showInlineCreate ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'
          }`}
        >
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Projects</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowInlineCreate(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project (Slide)
                </Button>
                <Button onClick={() => setShowCreatePanel(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project (Panel)
                </Button>
              </div>
            </div>

            {/* Projects section now starts immediately */}

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>
                        {project.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Created {formatDate(project.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{project.stats.totalMembers} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {project.stats.completedTasks}/{project.stats.totalTasks} tasks
                          </span>
                        </div>
                      </div>
                      {project.stats.totalTasks > 0 && (
                        <div className="mt-4">
                          <div className="bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{
                                width: `${
                                  (project.stats.completedTasks / project.stats.totalTasks) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
        </div>

        {/* Create Project Inline View - Show when creating */}
        <div 
          className={`transition-all duration-500 ease-out ${
            showInlineCreate ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'
          }`}
        >
            <div className="max-w-2xl mx-auto">
              {/* Header with Back Button */}
              <div className="mb-8 flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseInline}
                  className="hover:bg-muted"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-bold">Create New Project</h2>
              </div>

              {/* Content */}
              <div className="space-y-8">
                {/* Hero Section */}
                <div className="text-center py-8 space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold">Let's bring your ideas to life</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Create a space for your team to collaborate, track progress, and achieve goals together.
                  </p>
                </div>

                {/* Form Card */}
                <Card className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="inline-project-name" className="text-lg font-semibold">
                        What should we call your project?
                      </Label>
                      <Input
                        id="inline-project-name"
                        placeholder="e.g., Product Launch 2024, Website Redesign"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="h-14 text-lg"
                        autoFocus
                      />
                      <p className="text-sm text-muted-foreground">
                        Don't worry, you can always change this later.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="inline-project-description" className="text-lg font-semibold">
                        Tell us more about it
                      </Label>
                      <Textarea
                        id="inline-project-description"
                        placeholder="Describe your project goals, timeline, or any important details..."
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        className="min-h-[150px] text-base resize-none"
                      />
                      <p className="text-sm text-muted-foreground">
                        A good description helps your team understand the project's purpose.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Quick Setup Options */}
                <Card className="p-6 bg-muted/30">
                  <h4 className="font-semibold mb-4">Quick Setup Options</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Team Collaboration</p>
                        <p className="text-xs text-muted-foreground">
                          Invite team members right after creation
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Task Templates</p>
                        <p className="text-xs text-muted-foreground">
                          Start with pre-built task structures
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Timeline Planning</p>
                        <p className="text-xs text-muted-foreground">
                          Set milestones and deadlines
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">AI Assistance</p>
                        <p className="text-xs text-muted-foreground">
                          Get smart suggestions for tasks
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 pb-8">
                  <Button
                    size="lg"
                    className="flex-1 h-14 text-base"
                    onClick={handleCreateProjectInline}
                    disabled={isCreating || !newProjectName.trim()}
                  >
                    {isCreating ? (
                      <span className="flex items-center gap-2">
                        <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Creating your project...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create Project
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 text-base"
                    onClick={handleCloseInline}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
        </div>
      </main>
      
      {/* Create Project Slide Panel */}
      <SlidePanel
        isOpen={showCreatePanel}
        onClose={handleClosePanel}
        title="Create New Project"
      >
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Let's create something amazing</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Set up your new project in just a few steps. You can always change these details later.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-base font-medium">
                Project Name *
              </Label>
              <Input
                id="project-name"
                placeholder="e.g., Website Redesign, Q4 Marketing Campaign"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="h-12 text-base"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Choose a clear, descriptive name for your project
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-base font-medium">
                Description
              </Label>
              <Textarea
                id="project-description"
                placeholder="What's this project about? What are the main goals?"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="min-h-[120px] text-base resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Help your team understand the project's purpose and objectives
              </p>
            </div>

            {/* Visual Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Next Steps</span>
              </div>
            </div>

            {/* Next Steps Preview */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium">After creating your project, you can:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Add team members and assign roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Create tasks and set up your workflow</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Customize project settings and permissions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleCreateProject}
              disabled={isCreating || !newProjectName.trim()}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Project
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleClosePanel}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SlidePanel>
    </div>
  )
}