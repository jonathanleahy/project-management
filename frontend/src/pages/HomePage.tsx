import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { CheckCircle, Users, FolderOpen, Share2, BarChart } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [shareCode, setShareCode] = useState('')

  const handleRedeemCode = () => {
    if (shareCode) {
      // Store code in localStorage to redeem after login
      localStorage.setItem('pendingShareCode', shareCode)
      navigate('/login')
    }
  }

  if (user) {
    navigate('/projects')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Project Management System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize your projects, manage tasks with hierarchical structure, 
            collaborate with your team, and track progress all in one place.
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Create your account and start managing projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/register">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Login to access your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Have a Code?</CardTitle>
              <CardDescription>Join a project with an invitation code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Enter share code"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value)}
              />
              <Button variant="secondary" className="w-full" onClick={handleRedeemCode}>
                Redeem Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CheckCircle className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hierarchical tasks up to 4 levels deep with custom workflows
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Role-based access control with Owner, Admin, Member, and Viewer roles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FolderOpen className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Document & Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Attach multiple documents and canvases to tasks with version history
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Easy Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Share projects with invitation codes and control access levels
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}