'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Delay in milliseconds before animation starts on entrance */
  delay?: number
  /** Direction from which the element enters */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  /** Pixel offset to slide from */
  distance?: number
  /** Duration of entrance transition in seconds */
  duration?: number
  /** Duration of exit transition in seconds */
  exitDuration?: number
  /** If true, triggers only once. Defaults to false for full fade in and out transitions */
  once?: boolean
  /** Viewport intersection threshold (0.0 to 1.0) */
  threshold?: number
  /** Extra class names */
  className?: string
  /** If true, wraps direct children in staggered reveals */
  stagger?: boolean
  /** Stagger step in ms between child elements */
  staggerStep?: number
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 20,
  duration = 0.6,
  exitDuration = 0.35,
  once = false,
  threshold = 0.1,
  className,
  stagger = false,
  staggerStep = 80,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Immediately show without transitions if user prefers reduced motion
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
        rootMargin: '0px 0px -20px 0px',
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [once, threshold])

  const getTransform = (visible: boolean) => {
    if (visible) return 'none'
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
    return (
      <div
        ref={ref}
        className={cn('transition-all', className)}
        style={{ ...style }}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child
          const childDelay = isVisible ? delay + index * staggerStep : 0
          return (
            <div
              className="transition-all will-change-transform"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? 'none'
                  : direction === 'up'
                    ? `translateY(${distance}px)`
                    : direction === 'down'
                      ? `translateY(-${distance}px)`
                      : 'none',
                transitionDuration: isVisible ? `${duration}s` : `${exitDuration}s`,
                transitionDelay: `${childDelay}ms`,
                transitionTimingFunction: isVisible
                  ? 'cubic-bezier(0.16, 1, 0.3, 1)'
                  : 'cubic-bezier(0.4, 0, 1, 1)',
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
      className={cn('transition-all will-change-transform', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(isVisible),
        transitionDuration: isVisible ? `${duration}s` : `${exitDuration}s`,
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        transitionTimingFunction: isVisible
          ? 'cubic-bezier(0.16, 1, 0.3, 1)'
          : 'cubic-bezier(0.4, 0, 1, 1)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
