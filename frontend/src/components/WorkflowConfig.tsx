import React, { useState } from 'react'
import { Plus, X, GripVertical, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { WorkflowStatus } from '../types'

interface WorkflowConfigProps {
  projectId: string
  workflow: WorkflowStatus[]
  onSave: (workflow: WorkflowStatus[]) => void
  onCancel: () => void
}

export const WorkflowConfig: React.FC<WorkflowConfigProps> = ({
  projectId,
  workflow,
  onSave,
  onCancel
}) => {
  const [statuses, setStatuses] = useState<WorkflowStatus[]>(
    workflow.length > 0 ? workflow : [
      { id: '1', projectId, name: 'To Do', color: '#94a3b8', position: 0, isTerminal: false },
      { id: '2', projectId, name: 'In Progress', color: '#3b82f6', position: 1, isTerminal: false },
      { id: '3', projectId, name: 'Done', color: '#10b981', position: 2, isTerminal: true }
    ]
  )
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null) return

    const newStatuses = [...statuses]
    const draggedItem = newStatuses[draggedIndex]
    newStatuses.splice(draggedIndex, 1)
    newStatuses.splice(dropIndex, 0, draggedItem)
    
    // Update positions
    newStatuses.forEach((status, index) => {
      status.position = index
    })

    setStatuses(newStatuses)
    setDraggedIndex(null)
  }

  const addStatus = () => {
    const newStatus: WorkflowStatus = {
      id: Date.now().toString(),
      projectId,
      name: 'New Status',
      color: '#6b7280',
      position: statuses.length,
      isTerminal: false
    }
    setStatuses([...statuses, newStatus])
  }

  const removeStatus = (index: number) => {
    if (statuses.length <= 1) return
    const newStatuses = statuses.filter((_, i) => i !== index)
    // Update positions
    newStatuses.forEach((status, i) => {
      status.position = i
    })
    setStatuses(newStatuses)
  }

  const updateStatus = (index: number, field: keyof WorkflowStatus, value: any) => {
    const newStatuses = [...statuses]
    newStatuses[index] = { ...newStatuses[index], [field]: value }
    
    // Ensure only one terminal status
    if (field === 'isTerminal' && value === true) {
      newStatuses.forEach((status, i) => {
        if (i !== index) {
          status.isTerminal = false
        }
      })
    }
    
    setStatuses(newStatuses)
  }

  const handleSave = () => {
    // Ensure at least one terminal status
    const hasTerminal = statuses.some(s => s.isTerminal)
    if (!hasTerminal && statuses.length > 0) {
      statuses[statuses.length - 1].isTerminal = true
    }
    onSave(statuses)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Configure Workflow</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {statuses.map((status, index) => (
              <div
                key={status.id}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
              >
                <div className="cursor-move">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                
                <Input
                  value={status.name}
                  onChange={(e) => updateStatus(index, 'name', e.target.value)}
                  placeholder="Status name"
                  className="flex-1"
                />
                
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={status.color}
                    onChange={(e) => updateStatus(index, 'color', e.target.value)}
                    className="w-8 h-8 border rounded cursor-pointer"
                  />
                  
                  <div className="flex items-center gap-1">
                    <label className="text-sm text-gray-600">Final</label>
                    <Switch
                      checked={status.isTerminal}
                      onCheckedChange={(checked) => updateStatus(index, 'isTerminal', checked)}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStatus(index)}
                    disabled={statuses.length <= 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addStatus}
            className="mt-4 w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Status
          </Button>

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tips:</strong>
              <ul className="mt-1 ml-4 list-disc">
                <li>Drag statuses to reorder them</li>
                <li>Mark one status as "Final" to indicate task completion</li>
                <li>Choose colors that represent the status meaning</li>
                <li>You must have at least one status</li>
              </ul>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={statuses.length === 0 || statuses.some(s => !s.name.trim())}
          >
            <Check className="w-4 h-4 mr-1" />
            Save Workflow
          </Button>
        </div>
      </div>
    </div>
  )
}