'use client'

import React, { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface PastEventsSectionProps {
  children: React.ReactNode
}

export function PastEventsSection({ children }: PastEventsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  // Scroll-triggered animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'start 0.3'],
  })

  const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const titleY = useTransform(scrollYProgress, [0, 0.5], [50, 0])

  // Add GSAP mask reveal for title
  useEffect(() => {
    if (!titleRef.current || hasAnimated) return

    const title = titleRef.current

    // Set initial state with mask
    gsap.set(title, {
      clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
      opacity: 0,
    })

    // Animate reveal
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onComplete: () => setHasAnimated(true),
    })

    timeline.to(title, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    })

    return () => {
      timeline.kill()
    }
  }, [hasAnimated])

  return (
    <section ref={sectionRef} id="past-events" className="bg-pink pb-6 md:pb-24">
      <div
        ref={titleRef}
        className="text-center max-w-8xl mx-auto px-2.5 md:px-5 pt-5 pb-8 md:py-8"
      >
        <Image
          src="/PAST EVENTS.svg"
          alt="Past Events"
          width={1392}
          height={322}
          className="w-full h-auto"
        />
      </div>
      {children}
    </section>
  )
}
