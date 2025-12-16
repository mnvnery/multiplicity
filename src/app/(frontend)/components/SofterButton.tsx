'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { cn } from '../lib/variants'

interface SofterButtonProps {
  children: React.ReactNode
  className?: string
  as?: 'button' | 'a'
  href?: string
  onClick?: (e: React.MouseEvent) => void
  target?: string
  rel?: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary'
}

export function SofterButton({
  children,
  className,
  as: Component = 'button',
  href,
  onClick,
  target,
  rel,
  type = 'button',
  variant = 'primary',
}: SofterButtonProps) {
  const buttonRef = useRef<HTMLElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!buttonRef.current || !backgroundRef.current || !textRef.current) return

    const button = buttonRef.current
    const background = backgroundRef.current
    const text = textRef.current

    // Create timeline for hover animations
    const hoverTimeline = gsap.timeline({ paused: true })

    // Background slides up and expands
    hoverTimeline.to(
      background,
      {
        scaleY: 1,
        duration: 0.4,
        ease: 'power2.out',
      },
      0,
    )

    // Text lifts slightly and brightens
    hoverTimeline.to(
      text,
      {
        y: -2,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
      },
      0,
    )

    // Button subtle scale
    hoverTimeline.to(
      button,
      {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      },
      0,
    )

    const handleMouseEnter = () => {
      setIsHovered(true)
      hoverTimeline.play()
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      hoverTimeline.reverse()
    }

    button.addEventListener('mouseenter', handleMouseEnter)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter)
      button.removeEventListener('mouseleave', handleMouseLeave)
      hoverTimeline.kill()
    }
  }, [])

  const baseClasses =
    'relative overflow-hidden cursor-pointer inline-block transition-all duration-300'
  const variantClasses = {
    primary: 'border-3 border-black',
    secondary: 'border-2 border-black',
  }

  const props = {
    ref: buttonRef as any,
    className: cn(baseClasses, variantClasses[variant], className),
    ...(Component === 'a' && { href, target, rel }),
    ...(Component === 'button' && { type, onClick }),
  }

  return React.createElement(
    Component,
    props,
    <>
      {/* Animated background that slides up */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 bg-black origin-bottom"
        style={{
          transform: 'scaleY(0)',
          zIndex: 0,
        }}
      />
      {/* Text content */}
      <span
        ref={textRef}
        className={cn(
          'relative z-10 block transition-colors duration-300',
          isHovered ? 'text-yellow' : 'text-black',
        )}
      >
        {children}
      </span>
    </>,
  )
}
