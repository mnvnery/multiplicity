'use client'

import React, { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '../lib/variants'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface MaskedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'diagonal'
  delay?: number
  duration?: number
  sizes?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  parallax?: boolean
  parallaxSpeed?: number
  scaleOnScroll?: boolean
  initialScale?: number
}

export function MaskedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  direction = 'up',
  delay = 0,
  duration = 1.2,
  sizes,
  objectFit = 'cover',
  parallax = false,
  parallaxSpeed = 0.1,
  scaleOnScroll = false,
  initialScale = 1.2,
}: MaskedImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !imageRef.current || !isLoaded) return

    const container = containerRef.current
    const image = imageRef.current

    // Set initial mask state based on direction
    let initialClip = 'inset(0% 0% 0% 0%)'
    let finalClip = 'inset(0% 0% 0% 0%)'

    switch (direction) {
      case 'up':
        initialClip = 'inset(100% 0% 0% 0%)'
        break
      case 'down':
        initialClip = 'inset(0% 0% 100% 0%)'
        break
      case 'left':
        initialClip = 'inset(0% 0% 0% 100%)'
        break
      case 'right':
        initialClip = 'inset(0% 100% 0% 0%)'
        break
      case 'diagonal':
        initialClip = 'polygon(0% 100%, 0% 100%, 0% 100%)'
        finalClip = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
        break
      case 'scale':
        gsap.set(image, { scale: 0, opacity: 0 })
        break
    }

    if (direction !== 'scale') {
      gsap.set(container, { clipPath: initialClip })
    }

    // Create reveal animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        end: 'top 20%',
        toggleActions: 'play none none none',
      },
    })

    if (direction === 'scale') {
      timeline.to(image, {
        scale: 1,
        opacity: 1,
        duration,
        delay,
        ease: 'power3.out',
      })
    } else {
      timeline.to(container, {
        clipPath: finalClip,
        duration,
        delay,
        ease: 'power3.out',
      })
    }

    // Add parallax effect if enabled
    if (parallax && imageRef.current) {
      gsap.to(image, {
        y: () => window.innerHeight * parallaxSpeed,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }

    // Add scale on scroll if enabled
    if (scaleOnScroll && imageRef.current) {
      gsap.set(image, { scale: initialScale })
      gsap.to(image, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }

    return () => {
      timeline.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === container) {
          st.kill()
        }
      })
    }
  }, [direction, delay, duration, parallax, parallaxSpeed, scaleOnScroll, initialScale, isLoaded])

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      <div ref={imageRef} className="w-full h-full">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn('w-full h-full', `object-${objectFit}`)}
          priority={priority}
          sizes={sizes}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  )
}
