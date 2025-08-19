import React, { useState } from 'react'
import { Share2, Copy, Link, Calendar, Users, X, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ShareCode, Role } from '../types'

interface ShareProjectProps {
  projectId: string
  shareCodes: ShareCode[]
  onCreateCode: (role: Role, expiresAt?: Date, maxUses?: number) => void
  onRevokeCode: (id: string) => void
  onClose: () => void
}

export const ShareProject: React.FC<ShareProjectProps> = ({
  projectId,
  shareCodes,
  onCreateCode,
  onRevokeCode,
  onClose
}) => {
  const [role, setRole] = useState<Role>('VIEWER')
  const [expireDays, setExpireDays] = useState<string>('')
  const [maxUses, setMaxUses] = useState<string>('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCreateCode = () => {
    const expiresAt = expireDays ? new Date(Date.now() + parseInt(expireDays) * 24 * 60 * 60 * 1000) : undefined
    const uses = maxUses ? parseInt(maxUses) : undefined
    onCreateCode(role, expiresAt, uses)
  }

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/join/${code}`
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'OWNER': return 'Owner'
      case 'ADMIN': return 'Admin'
      case 'MEMBER': return 'Member'
      case 'VIEWER': return 'Viewer'
      default: return role
    }
  }

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'OWNER': return 'text-red-600 bg-red-50'
      case 'ADMIN': return 'text-orange-600 bg-orange-50'
      case 'MEMBER': return 'text-blue-600 bg-blue-50'
      case 'VIEWER': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Share Project</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Create New Code */}
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-sm font-medium mb-3">Create Invitation Link</h3>
          <div className="flex gap-2">
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              placeholder="Days valid"
              value={expireDays}
              onChange={(e) => setExpireDays(e.target.value)}
              className="w-28"
            />
            
            <Input
              type="number"
              placeholder="Max uses"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="w-28"
            />
            
            <Button onClick={handleCreateCode}>
              <Link className="w-4 h-4 mr-1" />
              Create Link
            </Button>
          </div>
        </div>

        {/* Active Codes */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium mb-3">Active Invitation Links</h3>
          
          {shareCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Share2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active invitation links</p>
              <p className="text-sm mt-1">Create a link to invite people to this project</p>
            </div>
          ) : (
            <div className="space-y-2">
              {shareCodes.map((shareCode) => (
                <div
                  key={shareCode.id}
                  className={`p-3 border rounded-lg ${
                    shareCode.revoked ? 'bg-gray-50 opacity-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(shareCode.role)}`}>
                          {getRoleLabel(shareCode.role)}
                        </span>
                        {shareCode.revoked && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                            Revoked
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {shareCode.expiresAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Expires {new Date(shareCode.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {shareCode.maxUses && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>
                              {shareCode.uses}/{shareCode.maxUses} uses
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {shareCode.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(shareCode.code)}
                          disabled={shareCode.revoked}
                        >
                          {copiedCode === shareCode.code ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {!shareCode.revoked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRevokeCode(shareCode.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}