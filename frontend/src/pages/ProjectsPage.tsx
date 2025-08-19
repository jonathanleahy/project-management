import { useState } from 'react'
import { Plus, Users, Calendar, CheckCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/utils'
import { SlidePanel } from '@/components/SlidePanel'
import { ProjectCreationWizard } from '@/components/ProjectCreationWizard'
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar'
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
  
  const handleCreateProjectInline = async (projectData: any) => {
    if (!projectData.name.trim()) {
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
          name: projectData.name,
          description: projectData.description || null
        }
      })
    } catch (error) {
      // Fallback to mock data if GraphQL fails
      const newProject = {
        id: `proj${projects.length + 1}`,
        name: projectData.name,
        description: projectData.description || 'No description',
        createdAt: new Date(),
        owner: { id: '1', name: 'User' },
        members: [
          { id: `${projects.length + 1}`, user: { id: '1', name: 'User' }, role: 'OWNER' },
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
    <LayoutWithSidebar>
      {/* Main Content */}
      {!showInlineCreate ? (
        /* Projects List View */
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Projects</h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowInlineCreate(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              <Button 
                onClick={() => setShowCreatePanel(true)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Create
              </Button>
            </div>
          </div>

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
        </main>
      ) : (
        /* Create Project Wizard View */
        <main className="w-full">
          <ProjectCreationWizard 
            onClose={handleCloseInline}
            onCreate={handleCreateProjectInline}
            isCreating={isCreating}
          />
        </main>
      )}
      
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
    </LayoutWithSidebar>
  )
}