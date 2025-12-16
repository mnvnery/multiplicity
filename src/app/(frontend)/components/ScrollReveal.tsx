'use client'

import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '../lib/variants'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'mask'
  duration?: number
  delay?: number
  once?: boolean
  y?: number
  x?: number
  scale?: number
  stagger?: number
  triggerStart?: string
  triggerEnd?: string
}

export function ScrollReveal({
  children,
  className,
  animation = 'fade',
  duration = 0.8,
  delay = 0,
  once = true,
  y = 50,
  x = 50,
  scale = 0.9,
  stagger = 0,
  triggerStart = 'top 80%',
  triggerEnd = 'top 20%',
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const element = containerRef.current
    const children = Array.from(element.children) as HTMLElement[]
    const targets = stagger > 0 && children.length > 0 ? children : [element]

    // Set initial state based on animation type
    const initialState: any = {}
    const animateTo: any = {}

    switch (animation) {
      case 'fade':
        initialState.opacity = 0
        animateTo.opacity = 1
        break
      case 'slide-up':
        initialState.opacity = 0
        initialState.y = y
        animateTo.opacity = 1
        animateTo.y = 0
        break
      case 'slide-down':
        initialState.opacity = 0
        initialState.y = -y
        animateTo.opacity = 1
        animateTo.y = 0
        break
      case 'slide-left':
        initialState.opacity = 0
        initialState.x = x
        animateTo.opacity = 1
        animateTo.x = 0
        break
      case 'slide-right':
        initialState.opacity = 0
        initialState.x = -x
        animateTo.opacity = 1
        animateTo.x = 0
        break
      case 'scale':
        initialState.opacity = 0
        initialState.scale = scale
        animateTo.opacity = 1
        animateTo.scale = 1
        break
      case 'mask':
        initialState.opacity = 0
        initialState.clipPath = 'inset(100% 0% 0% 0%)'
        animateTo.opacity = 1
        animateTo.clipPath = 'inset(0% 0% 0% 0%)'
        break
    }

    gsap.set(targets, initialState)

    // Create animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: triggerStart,
        end: triggerEnd,
        toggleActions: once ? 'play none none none' : 'play none none reverse',
      },
    })

    timeline.to(targets, {
      ...animateTo,
      duration,
      delay,
      stagger: stagger > 0 ? stagger : 0,
      ease: 'power2.out',
    })

    return () => {
      timeline.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === element) {
          st.kill()
        }
      })
    }
  }, [animation, duration, delay, once, y, x, scale, stagger, triggerStart, triggerEnd])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {children}
    </div>
  )
}
