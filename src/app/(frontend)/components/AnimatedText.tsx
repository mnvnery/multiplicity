'use client'

import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '../lib/variants'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface AnimatedTextProps {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'chars' | 'words' | 'lines' | 'mask'
  stagger?: number
  duration?: number
  delay?: number
  once?: boolean
}

export function AnimatedText({
  children,
  className,
  as: Component = 'div',
  animation = 'fade',
  stagger = 0.03,
  duration = 0.8,
  delay = 0,
  once = true,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const [isSplit, setIsSplit] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const element = containerRef.current
    const text = element.textContent || ''

    let elements: HTMLElement[] = [element]

    // Split text if needed
    if (animation === 'chars' || animation === 'words' || animation === 'lines') {
      const splitBy = animation === 'chars' ? '' : animation === 'words' ? ' ' : '\n'
      const parts = animation === 'lines' ? [text] : text.split(splitBy)

      element.innerHTML = ''

      const wrappers = parts.map((part, i) => {
        const wrapper = document.createElement('span')
        wrapper.style.display = animation === 'lines' ? 'block' : 'inline-block'
        wrapper.style.overflow = 'hidden'

        const inner = document.createElement('span')
        inner.textContent = part === ' ' || part === '' ? '\u00A0' : part
        inner.style.display = 'inline-block'

        if (animation === 'chars' || animation === 'words') {
          // Add space after word
          if (animation === 'words' && i < parts.length - 1) {
            const space = document.createElement('span')
            space.textContent = '\u00A0'
            space.style.display = 'inline-block'
            element.appendChild(space)
          }
        }

        wrapper.appendChild(inner)
        element.appendChild(wrapper)
        return inner
      })

      elements = wrappers
      setIsSplit(true)
    }

    // Set initial state
    const initialState: any = {}
    const animateTo: any = {}

    switch (animation) {
      case 'fade':
        initialState.opacity = 0
        animateTo.opacity = 1
        break
      case 'slide-up':
        initialState.opacity = 0
        initialState.y = 50
        animateTo.opacity = 1
        animateTo.y = 0
        break
      case 'slide-down':
        initialState.opacity = 0
        initialState.y = -50
        animateTo.opacity = 1
        animateTo.y = 0
        break
      case 'chars':
      case 'words':
      case 'lines':
        initialState.opacity = 0
        initialState.y = '100%'
        animateTo.opacity = 1
        animateTo.y = '0%'
        break
      case 'mask':
        initialState.opacity = 0
        initialState.clipPath = 'inset(0% 0% 100% 0%)'
        animateTo.opacity = 1
        animateTo.clipPath = 'inset(0% 0% 0% 0%)'
        break
    }

    gsap.set(elements, initialState)

    // Create animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        end: 'top 20%',
        toggleActions: once ? 'play none none none' : 'play none none reverse',
      },
    })

    timeline.to(elements, {
      ...animateTo,
      duration,
      delay,
      stagger: elements.length > 1 ? stagger : 0,
      ease: 'power2.out',
    })

    return () => {
      timeline.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === element) {
          st.kill()
        }
      })
      if (isSplit) {
        element.textContent = text
      }
    }
  }, [animation, stagger, duration, delay, once])

  return React.createElement(
    Component,
    {
      ref: containerRef as any,
      className: cn('relative', className),
    },
    children,
  )
}
