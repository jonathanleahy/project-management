import React, { useEffect, useRef } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SlidePanelProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  showBackButton?: boolean
  className?: string
}

export function SlidePanel({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showBackButton = true,
  className 
}: SlidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-0 right-0 h-full bg-background z-50 shadow-xl transition-transform duration-300 ease-out",
          "w-full md:w-[600px] lg:w-[700px]",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="hover:bg-muted"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                {title && (
                  <h2 className="text-xl font-semibold">{title}</h2>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}