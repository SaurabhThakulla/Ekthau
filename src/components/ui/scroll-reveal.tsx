'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Delay in milliseconds before animation starts */
  delay?: number
  /** Direction from which the element enters */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  /** Pixel offset to slide from */
  distance?: number
  /** Duration of transition in seconds */
  duration?: number
  /** If true, triggers only once. Defaults to true */
  once?: boolean
  /** Viewport intersection threshold (0.0 to 1.0) */
  threshold?: number
  /** Extra class names */
  className?: string
  /** If true, wraps children in staggered reveals */
  stagger?: boolean
  /** Stagger step in ms between child elements */
  staggerStep?: number
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 24,
  duration = 0.7,
  once = true,
  threshold = 0.12,
  className,
  stagger = false,
  staggerStep = 100,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Immediately show if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once && element) {
            observer.unobserve(element)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [once, threshold])

  const getTransform = () => {
    if (isVisible) return 'none'
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`
      case 'down':
        return `translateY(-${distance}px)`
      case 'left':
        return `translateX(${distance}px)`
      case 'right':
        return `translateX(-${distance}px)`
      case 'none':
      default:
        return 'none'
    }
  }

  if (stagger && React.isValidElement(children)) {
    // If stagger is requested on children container
    return (
      <div
        ref={ref}
        className={cn('transition-all', className)}
        style={{
          ...style,
        }}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child
          const childDelay = delay + index * staggerStep
          return (
            <div
              className="transition-all"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? 'none'
                  : direction === 'up'
                    ? `translateY(${distance}px)`
                    : direction === 'down'
                      ? `translateY(-${distance}px)`
                      : 'none',
                transitionDuration: `${duration}s`,
                transitionDelay: `${childDelay}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {child}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all will-change-transform',
        className
      )}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
