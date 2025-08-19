import { ReactNode } from 'react'
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
  // For projects list (direction='left'): 
  //   - When active: translate-x-0
  //   - When inactive: -translate-x-full (slides out to left)
  // For wizard (direction='right'):
  //   - When active: translate-x-0  
  //   - When inactive: translate-x-full (stays off to right)
  
  const getTransformClass = () => {
    if (isActive) {
      return 'translate-x-0 opacity-100'
    } else {
      if (direction === 'left') {
        return '-translate-x-full opacity-0'
      } else {
        return 'translate-x-full opacity-0'
      }
    }
  }

  return (
    <div 
      className={cn(
        'absolute inset-0 transition-all duration-500 ease-out',
        getTransformClass(),
        !isActive && 'pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  )
}