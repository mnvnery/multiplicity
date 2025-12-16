'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface AnimatedHeaderProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedHeader({ children, className }: AnimatedHeaderProps) {
  const headerRef = useRef<HTMLElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!headerRef.current || hasAnimated) return

    const header = headerRef.current

    // Set initial state - hidden above viewport
    gsap.set(header, {
      y: -50,
      opacity: 0,
    })

    // Animate down - coordinated with logo/carousel timing
    const timeline = gsap.timeline({
      delay: 0,
      onComplete: () => setHasAnimated(true),
    })

    timeline.to(header, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    })

    return () => {
      timeline.kill()
    }
  }, [hasAnimated])

  return (
    <header
      ref={headerRef}
      className={className}
      style={{
        opacity: 0,
        transform: 'translateY(-20px)',
      }}
    >
      {children}
    </header>
  )
}
