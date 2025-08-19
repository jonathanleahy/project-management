import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: ReactNode
  show: boolean
  className?: string
}

export function PageTransition({ children, show, className }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(show)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Small delay to trigger enter animation
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      // Wait for exit animation before hiding
      setTimeout(() => setIsVisible(false), 500)
    }
  }, [show])

  if (!isVisible) return null

  return (
    <div 
      className={cn(
        'absolute inset-0 transition-all duration-500 ease-out',
        isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        className
      )}
    >
      {children}
    </div>
  )
}