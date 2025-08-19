import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedPageTransitionProps {
  children: ReactNode
  isActive: boolean
  direction?: 'left' | 'right'
  className?: string
}

export function AnimatedPageTransition({ 
  children, 
  isActive, 
  direction = 'right',
  className 
}: AnimatedPageTransitionProps) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isActive) {
      setShouldRender(true)
    } else {
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isActive])

  if (!shouldRender) return null

  // Determine the transform based on active state and direction
  const getTransform = () => {
    if (isActive) {
      return 'translateX(0%)'  // Slide to center
    } else {
      // Slide out based on direction
      return direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)'
    }
  }

  // Initial position based on direction
  const initialTransform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)'

  return (
    <div 
      className={cn(
        'absolute inset-0 transition-transform duration-500 ease-out',
        isActive ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        transform: shouldRender ? getTransform() : initialTransform
      }}
    >
      {children}
    </div>
  )
}