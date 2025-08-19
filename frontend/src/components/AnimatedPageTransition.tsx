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
  const [shouldRender, setShouldRender] = useState(isActive)
  const [animationClass, setAnimationClass] = useState('')

  useEffect(() => {
    if (isActive) {
      setShouldRender(true)
      // Small delay to trigger animation
      setTimeout(() => {
        setAnimationClass('translate-x-0 opacity-100')
      }, 10)
    } else {
      // When hiding, slide out in opposite direction
      const hideClass = direction === 'left' 
        ? '-translate-x-full opacity-0'  // Slide out to left
        : 'translate-x-full opacity-0'   // Slide out to right
      setAnimationClass(hideClass)
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isActive, direction])

  if (!shouldRender) return null

  // Initial position: left items start from left, right items start from right
  const initialClass = direction === 'left' 
    ? '-translate-x-full opacity-0'  // Start from left
    : 'translate-x-full opacity-0'   // Start from right

  return (
    <div 
      className={cn(
        'absolute inset-0 transition-all duration-500 ease-out',
        animationClass || initialClass,
        className
      )}
    >
      {children}
    </div>
  )
}