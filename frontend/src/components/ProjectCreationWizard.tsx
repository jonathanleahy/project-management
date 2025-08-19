import { useState } from 'react'
import { ArrowLeft, ArrowRight, Sparkles, Users, Calendar, CheckCircle, Zap, Target, Palette, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

interface ProjectCreationWizardProps {
  onClose: () => void
  onCreate: (data: ProjectData) => void
  isCreating: boolean
}

interface ProjectData {
  name: string
  description: string
  template: string
  privacy: string
  team: string[]
}

const templates = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with a clean slate',
    icon: Sparkles,
    color: 'bg-blue-500/10 text-blue-500'
  },
  {
    id: 'agile',
    name: 'Agile Sprint',
    description: 'Pre-configured for agile development',
    icon: Zap,
    color: 'bg-purple-500/10 text-purple-500'
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Perfect for marketing initiatives',
    icon: Target,
    color: 'bg-green-500/10 text-green-500'
  },
  {
    id: 'design',
    name: 'Design Project',
    description: 'Optimized for design workflows',
    icon: Palette,
    color: 'bg-pink-500/10 text-pink-500'
  }
]

export function ProjectCreationWizard({ onClose, onCreate, isCreating }: ProjectCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    template: 'blank',
    privacy: 'team',
    team: []
  })

  const totalSteps = 4

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = () => {
    onCreate(projectData)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return projectData.name.trim().length > 0
      case 2:
        return projectData.template.length > 0
      case 3:
        return true // Description is optional
      case 4:
        return true // Review step
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="mb-4"
            disabled={isCreating}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-3xl font-bold">Create New Project</h2>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8">
          {/* Step 1: Project Name */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">What's your project called?</h3>
                <p className="text-muted-foreground">
                  Choose a memorable name that describes your project
                </p>
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="project-name" className="text-base">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    placeholder="e.g., Q4 Product Launch, Website Redesign"
                    value={projectData.name}
                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                    className="mt-2 h-12 text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    This will be visible to all team members
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">Choose a template</h3>
                <p className="text-muted-foreground">
                  Start with a pre-configured template or begin from scratch
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => {
                  const Icon = template.icon
                  return (
                    <button
                      key={template.id}
                      onClick={() => setProjectData({ ...projectData, template: template.id })}
                      className={cn(
                        "p-6 rounded-lg border-2 text-left transition-all",
                        projectData.template === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", template.color)}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        {projectData.template === template.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Project Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">Tell us more about your project</h3>
                <p className="text-muted-foreground">
                  Add details to help your team understand the project
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <Label htmlFor="description" className="text-base">
                    Project Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="What are the main goals and objectives of this project?"
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label className="text-base mb-3 block">
                    Who can access this project?
                  </Label>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setProjectData({ ...projectData, privacy: 'team' })}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                        projectData.privacy === 'team' 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Team Members Only</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Only invited team members can view and contribute
                        </p>
                      </div>
                      {projectData.privacy === 'team' && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setProjectData({ ...projectData, privacy: 'organization' })}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                        projectData.privacy === 'organization' 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Everyone in Organization</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          All organization members can view, some can contribute
                        </p>
                      </div>
                      {projectData.privacy === 'organization' && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Create */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Ready to create your project!</h3>
                <p className="text-muted-foreground">
                  Review your settings and create your project
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Project Name</p>
                    <p className="font-semibold text-lg">{projectData.name || 'Untitled Project'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Template</p>
                    <p className="font-medium">
                      {templates.find(t => t.id === projectData.template)?.name || 'Blank Project'}
                    </p>
                  </div>
                  
                  {projectData.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="font-medium">{projectData.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Privacy</p>
                    <p className="font-medium">
                      {projectData.privacy === 'team' ? 'Team Members Only' : 'Everyone in Organization'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    What happens next?
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Your project will be created instantly</li>
                    <li>• You can invite team members right away</li>
                    <li>• Start adding tasks and organizing work</li>
                    <li>• Customize settings anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isCreating}
            className="min-w-[120px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isCreating}
              className="min-w-[120px]"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!isStepValid() || isCreating}
              className="min-w-[180px]"
            >
              {isCreating ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Project...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}