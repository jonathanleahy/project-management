import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Bell,
  Star,
  Clock,
  Archive,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayoutWithSidebarProps {
  children: ReactNode
}

const navigationItems = [
  { 
    id: 'dashboard',
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/dashboard',
    color: 'text-blue-500'
  },
  { 
    id: 'projects',
    label: 'Projects', 
    icon: FolderOpen, 
    path: '/projects',
    color: 'text-purple-500'
  },
  { 
    id: 'calendar',
    label: 'Calendar', 
    icon: Calendar, 
    path: '/calendar',
    color: 'text-green-500'
  },
  { 
    id: 'team',
    label: 'Team', 
    icon: Users, 
    path: '/team',
    color: 'text-orange-500'
  },
  { 
    id: 'analytics',
    label: 'Analytics', 
    icon: BarChart3, 
    path: '/analytics',
    color: 'text-pink-500'
  },
]

const bottomNavigationItems = [
  { 
    id: 'settings',
    label: 'Settings', 
    icon: Settings, 
    path: '/settings',
    color: 'text-gray-500'
  },
  { 
    id: 'help',
    label: 'Help & Support', 
    icon: HelpCircle, 
    path: '/help',
    color: 'text-gray-500'
  },
]

const quickAccessItems = [
  {
    id: 'starred',
    label: 'Starred',
    icon: Star,
    path: '/starred',
    color: 'text-yellow-500'
  },
  {
    id: 'recent',
    label: 'Recent',
    icon: Clock,
    path: '/recent',
    color: 'text-blue-500'
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    path: '/archive',
    color: 'text-gray-500'
  },
  {
    id: 'trash',
    label: 'Trash',
    icon: Trash2,
    path: '/trash',
    color: 'text-red-500'
  }
]

export function LayoutWithSidebar({ children }: LayoutWithSidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showQuickAccess, setShowQuickAccess] = useState(true)
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r flex flex-col transition-all duration-300 flex-shrink-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && (
            <button 
              onClick={() => navigate('/projects')}
              className="text-lg font-bold hover:opacity-80 transition-opacity"
            >
              PM System
            </button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Create New Button */}
        <div className="p-4">
          <Button 
            className={cn(
              "w-full",
              isCollapsed && "px-2"
            )}
            onClick={() => navigate('/projects?create=true')}
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">New Project</span>}
          </Button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 text-sm border rounded-md bg-background"
              />
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive(item.path) 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive(item.path) ? '' : item.color)} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            )
          })}

          {/* Quick Access Section */}
          {!isCollapsed && (
            <>
              <div className="pt-4 pb-2">
                <button
                  onClick={() => setShowQuickAccess(!showQuickAccess)}
                  className="w-full flex items-center justify-between px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  QUICK ACCESS
                  {showQuickAccess ? (
                    <ChevronLeft className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              </div>
              
              {showQuickAccess && (
                <div className="space-y-1">
                  {quickAccessItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          isActive(item.path) 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 flex-shrink-0", item.color)} />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-2 py-2 border-t space-y-1">
          {bottomNavigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive(item.path) 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", item.color)} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* User Section */}
        {!isCollapsed && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        {/* Header */}
        <header className="border-b bg-background h-14 flex items-center px-6">
          <div className="flex-1">
            {/* Breadcrumbs or page title can go here */}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            {/* Search */}
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* User Menu */}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}