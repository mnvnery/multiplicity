'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface RevealTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  animation?: 'default' | 'mask' | 'scale' | 'slide'
}

export function RevealText({
  children,
  className = '',
  delay = 0,
  animation = 'default',
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.5'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const y = useTransform(scrollYProgress, [0, 0.5], [30, 0])
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.5],
    ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
  )

  // Enhanced GSAP animation
  useEffect(() => {
    if (!ref.current || hasAnimated || animation === 'default') return

    const element = ref.current

    let initialState: any = {}
    let animateTo: any = {}

    switch (animation) {
      case 'mask':
        initialState = {
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
          opacity: 0,
        }
        animateTo = {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
        }
        break
      case 'scale':
        initialState = {
          scale: 0.8,
          opacity: 0,
        }
        animateTo = {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
        }
        break
      case 'slide':
        initialState = {
          y: 60,
          opacity: 0,
        }
        animateTo = {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        }
        break
    }

    gsap.set(element, initialState)

    // Check if element is already in viewport on page load
    const rect = element.getBoundingClientRect()
    const isInViewport = rect.top < window.innerHeight * 0.85

    const timeline = gsap.timeline({
      scrollTrigger: isInViewport
        ? undefined
        : {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
      delay: isInViewport ? 0.1 : delay,
      onComplete: () => setHasAnimated(true),
    })

    timeline.to(element, {
      ...animateTo,
    })

    return () => {
      timeline.kill()
    }
  }, [hasAnimated, delay, animation])

  if (animation === 'default') {
    return (
      <motion.div
        ref={ref}
        className={className}
        style={{
          opacity,
          y,
          clipPath,
        }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
      }}
    >
      {children}
    </div>
  )
}
