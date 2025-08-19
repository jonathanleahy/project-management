import React, { useState, useEffect } from 'react'
import { Save, X, FileText, Clock, User } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Document, DocVersion } from '../types'

interface DocumentEditorProps {
  document?: Document
  taskId: string
  onSave: (name: string, markdown: string) => void
  onCancel: () => void
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document,
  taskId,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(document?.name || '')
  const [markdown, setMarkdown] = useState(document?.currentVersion?.markdown || '')
  const [showVersions, setShowVersions] = useState(false)

  const handleSave = () => {
    if (name.trim() && markdown.trim()) {
      onSave(name, markdown)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Document name..."
              className="border-0 text-lg font-medium focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-2">
            {document && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersions(!showVersions)}
              >
                <Clock className="w-4 h-4 mr-1" />
                Version History
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!name.trim() || !markdown.trim()}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Write your document in Markdown..."
                className="w-full h-full resize-none font-mono text-sm"
              />
            </div>
          </div>

          {/* Version History Sidebar */}
          {showVersions && document?.versions && (
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              <h3 className="font-medium mb-3">Version History</h3>
              <div className="space-y-2">
                {document.versions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-white ${
                      version.isActive ? 'bg-white border-blue-500' : 'bg-gray-50'
                    }`}
                    onClick={() => setMarkdown(version.markdown)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        Version {version.version}
                      </span>
                      {version.isActive && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{version.author?.name}</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="border-t p-4 bg-gray-50">
          <div className="text-xs text-gray-500">
            Preview will be rendered when saved
          </div>
        </div>
      </div>
    </div>
  )
}