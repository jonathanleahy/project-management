import React, { useState, useRef, useEffect } from 'react'
import { Save, X, Palette, Square, Circle, Type, Move, Trash2, Pen, Eraser, Highlighter, MousePointer2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Canvas } from '../types'

interface CanvasEditorProps {
  canvas?: Canvas
  taskId: string
  onSave: (name: string, dataJson: string) => void
  onCancel: () => void
}

type Tool = 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'circle' | 'text'
type PenMode = 'fine' | 'normal'
type LayerMode = 'behind' | 'on-top'
type CanvasElement = {
  id: string
  type: 'rectangle' | 'circle' | 'text' | 'path'
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  text?: string
  color: string
  points?: { x: number; y: number }[]
  lineWidth?: number
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  canvas,
  taskId,
  onSave,
  onCancel
}) => {
  console.log('CanvasEditor received canvas:', canvas)
  const [name, setName] = useState(canvas?.name || '')
  const [selectedTool, setSelectedTool] = useState<Tool>('pen')
  const [elements, setElements] = useState<CanvasElement[]>(() => {
    if (canvas?.dataJson) {
      try {
        return JSON.parse(canvas.dataJson)
      } catch {
        return []
      }
    }
    return []
  })
  
  // Update name when canvas prop changes
  useEffect(() => {
    if (canvas?.name) {
      setName(canvas.name)
    }
  }, [canvas])
  // const [selectedElement, setSelectedElement] = useState<string | null>(null) // Not needed for mockup canvas
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const [penColor, setPenColor] = useState('#000000')
  const [highlighterColor, setHighlighterColor] = useState('#ffeb3b')
  const [penMode, setPenMode] = useState<PenMode>('normal')
  const [highlighterLayerMode, setHighlighterLayerMode] = useState<LayerMode>('behind')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Get pen width based on mode
  const getPenWidth = () => {
    if (selectedTool === 'highlighter') return 15
    return penMode === 'fine' ? 1 : 3
  }

  useEffect(() => {
    drawCanvas()
  }, [elements])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 0.5
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Sort elements: if we have highlights that should be behind, separate them
    const highlightsBehind = elements.filter(el => 
      el.type === 'path' && el.lineWidth && el.lineWidth >= 15 && 
      elements.indexOf(el) < elements.length / 2 // Rough check if added with 'behind' mode
    )
    const otherElements = elements.filter(el => !highlightsBehind.includes(el))
    
    // Draw highlights behind first, then other elements
    const sortedElements = [...highlightsBehind, ...otherElements]
    
    // Draw elements
    sortedElements.forEach((element) => {
      ctx.strokeStyle = element.color
      ctx.fillStyle = element.color + '20'
      ctx.lineWidth = 2

      switch (element.type) {
        case 'rectangle':
          if (element.width && element.height) {
            ctx.fillRect(element.x, element.y, element.width, element.height)
            ctx.strokeRect(element.x, element.y, element.width, element.height)
          }
          break
        case 'circle':
          if (element.radius) {
            ctx.beginPath()
            ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
          }
          break
        case 'text':
          if (element.text) {
            ctx.font = '16px sans-serif'
            ctx.fillStyle = element.color
            ctx.fillText(element.text, element.x, element.y)
          }
          break
        case 'path':
          if (element.points && element.points.length > 0) {
            // Check if it's a highlighter stroke (wider strokes)
            if (element.lineWidth && element.lineWidth >= 15) {
              // Grey shadows are more transparent for depth effect
              if (element.color === '#9ca3af') {
                ctx.globalAlpha = 0.2
              } else {
                ctx.globalAlpha = 0.3
              }
            }
            ctx.strokeStyle = element.color
            ctx.lineWidth = element.lineWidth || 2
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.beginPath()
            ctx.moveTo(element.points[0].x, element.points[0].y)
            element.points.forEach(point => {
              ctx.lineTo(point.x, point.y)
            })
            ctx.stroke()
            ctx.globalAlpha = 1
          }
          break
      }
    })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (selectedTool === 'pen' || selectedTool === 'highlighter') {
      setIsDrawing(true)
      setCurrentPath([{ x, y }])
    } else if (selectedTool === 'eraser') {
      setIsDrawing(true)
      // Find and remove elements near the eraser
      const toRemove = elements.filter((el) => {
        if (el.type === 'path' && el.points) {
          return el.points.some(p => {
            const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2)
            return dist < 20
          })
        }
        return false
      })
      if (toRemove.length > 0) {
        setElements(elements.filter(el => !toRemove.includes(el)))
      }
    } else {
      setIsDrawing(true)
      setStartPos({ x, y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (selectedTool === 'pen' || selectedTool === 'highlighter') {
      // Add point to current path
      setCurrentPath([...currentPath, { x, y }])
      
      // Draw the current stroke
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      drawCanvas()
      
      // Draw current pen/highlighter stroke
      if (currentPath.length > 0) {
        if (selectedTool === 'highlighter') {
          // Grey shadows are more transparent
          if (highlighterColor === '#9ca3af') {
            ctx.globalAlpha = 0.2
          } else {
            ctx.globalAlpha = 0.3
          }
          ctx.strokeStyle = highlighterColor
          ctx.lineWidth = 15
        } else {
          ctx.globalAlpha = 1
          ctx.strokeStyle = penColor
          ctx.lineWidth = getPenWidth()
        }
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(currentPath[0].x, currentPath[0].y)
        currentPath.forEach(point => {
          ctx.lineTo(point.x, point.y)
        })
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    } else if (selectedTool === 'eraser') {
      // Remove elements near the eraser
      const toRemove = elements.filter((el) => {
        if (el.type === 'path' && el.points) {
          return el.points.some(p => {
            const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2)
            return dist < 20
          })
        }
        return false
      })
      if (toRemove.length > 0) {
        setElements(elements.filter(el => !toRemove.includes(el)))
      }
    } else {
      // Draw preview for shapes
      drawCanvas()
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.strokeStyle = '#3b82f6'
      ctx.fillStyle = '#3b82f633'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      if (selectedTool === 'rectangle') {
        const width = x - startPos.x
        const height = y - startPos.y
        ctx.strokeRect(startPos.x, startPos.y, width, height)
      } else if (selectedTool === 'circle') {
        const dx = x - startPos.x
        const dy = y - startPos.y
        const radius = Math.sqrt(dx * dx + dy * dy)
        ctx.beginPath()
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      ctx.setLineDash([])
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if ((selectedTool === 'pen' || selectedTool === 'highlighter') && currentPath.length > 1) {
      // Save the pen/highlighter stroke as a path
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: 'path',
        x: currentPath[0].x,
        y: currentPath[0].y,
        points: currentPath,
        color: selectedTool === 'highlighter' ? highlighterColor : penColor,
        lineWidth: selectedTool === 'highlighter' ? 15 : getPenWidth()
      }
      
      // For highlighter in 'behind' mode, add it at the beginning to render under other elements
      if (selectedTool === 'highlighter' && highlighterLayerMode === 'behind') {
        setElements([newElement, ...elements])
      } else {
        setElements([...elements, newElement])
      }
      setCurrentPath([])
    } else if (selectedTool !== 'pen' && selectedTool !== 'eraser') {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: selectedTool as 'rectangle' | 'circle' | 'text',
        x: Math.min(startPos.x, x),
        y: Math.min(startPos.y, y),
        color: '#3b82f6'
      }

      if (selectedTool === 'rectangle') {
        newElement.width = Math.abs(x - startPos.x)
        newElement.height = Math.abs(y - startPos.y)
      } else if (selectedTool === 'circle') {
        const dx = x - startPos.x
        const dy = y - startPos.y
        newElement.radius = Math.sqrt(dx * dx + dy * dy)
        newElement.x = startPos.x
        newElement.y = startPos.y
      } else if (selectedTool === 'text') {
        const text = prompt('Enter text:')
        if (text) {
          newElement.text = text
        }
      }

      if (selectedTool !== 'text' || newElement.text) {
        setElements([...elements, newElement])
      }
      // Keep the same tool selected for continuous drawing
      // setSelectedTool('select')
    }

    setIsDrawing(false)
  }

  // Simplified for mockup canvas - no individual selection needed

  const handleSave = () => {
    console.log('Saving canvas with name:', name, 'Elements:', elements.length)
    if (name.trim()) {
      onSave(name.trim(), JSON.stringify(elements))
    } else {
      console.error('Cannot save: Canvas name is empty')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-500" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Canvas name (required)..."
              className={`border-0 text-lg font-medium focus:ring-0 ${!name.trim() ? 'placeholder:text-red-400' : ''}`}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!name.trim()}
              title={!name.trim() ? 'Please enter a canvas name' : 'Save canvas'}
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

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
          {/* Drawing Tools */}
          <div className="flex items-center gap-1 pr-2 border-r">
            <Button
              variant={selectedTool === 'pen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('pen')}
              title="Pen"
            >
              <Pen className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedTool === 'highlighter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('highlighter')}
              title="Highlighter"
            >
              <Highlighter className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedTool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('eraser')}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Shape Tools */}
          <div className="flex items-center gap-1 pr-2 border-r">
            <Button
              variant={selectedTool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('rectangle')}
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('circle')}
              title="Circle"
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedTool === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('text')}
              title="Text"
            >
              <Type className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Pen settings */}
          {selectedTool === 'pen' && (
            <div className="flex items-center gap-2 px-2 border-r">
              <div className="flex items-center gap-1">
                <Button
                  variant={penMode === 'fine' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPenMode('fine')}
                  className="h-7 px-2 text-xs"
                >
                  Fine
                </Button>
                <Button
                  variant={penMode === 'normal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPenMode('normal')}
                  className="h-7 px-2 text-xs"
                >
                  Normal
                </Button>
              </div>
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-8 h-8 border rounded cursor-pointer"
                title="Pen color"
              />
            </div>
          )}
          
          {/* Highlighter settings */}
          {selectedTool === 'highlighter' && (
            <div className="flex items-center gap-2 px-2 border-r">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Layer:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant={highlighterLayerMode === 'behind' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHighlighterLayerMode('behind')}
                    className="h-6 px-2 text-xs"
                    title="Draw highlights behind other elements (for shadows)"
                  >
                    Behind
                  </Button>
                  <Button
                    variant={highlighterLayerMode === 'on-top' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHighlighterLayerMode('on-top')}
                    className="h-6 px-2 text-xs"
                    title="Draw highlights on top of other elements"
                  >
                    On Top
                  </Button>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setHighlighterColor('#ffeb3b')}
                  className={`w-6 h-6 rounded border-2 ${highlighterColor === '#ffeb3b' ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#ffeb3b' }}
                  title="Yellow - Highlight"
                />
                <button
                  onClick={() => setHighlighterColor('#4ade80')}
                  className={`w-6 h-6 rounded border-2 ${highlighterColor === '#4ade80' ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#4ade80' }}
                  title="Green - Approved"
                />
                <button
                  onClick={() => setHighlighterColor('#f87171')}
                  className={`w-6 h-6 rounded border-2 ${highlighterColor === '#f87171' ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#f87171' }}
                  title="Red - Issues"
                />
                <button
                  onClick={() => setHighlighterColor('#60a5fa')}
                  className={`w-6 h-6 rounded border-2 ${highlighterColor === '#60a5fa' ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#60a5fa' }}
                  title="Blue - Information"
                />
                <button
                  onClick={() => setHighlighterColor('#9ca3af')}
                  className={`w-6 h-6 rounded border-2 ${highlighterColor === '#9ca3af' ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#9ca3af' }}
                  title="Grey - Shadow/Depth"
                />
                <button
                  onClick={() => setHighlighterColor('#c084fc')}
                  className={`w-6 h-6 rounded border-2 ${highlighterColor === '#c084fc' ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: '#c084fc' }}
                  title="Purple - Special"
                />
              </div>
            </div>
          )}
          
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setElements([])}
              title="Clear canvas"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4 bg-gray-100 overflow-auto">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="bg-white border border-gray-300 cursor-crosshair mx-auto"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>

        {/* Status */}
        <div className="border-t p-2 bg-gray-50">
          <div className="text-xs text-gray-500">
            Tool: {selectedTool} | Elements: {elements.length}
            {selectedTool === 'highlighter' && ` | Mode: ${highlighterLayerMode}`}
          </div>
        </div>
      </div>
    </div>
  )
}