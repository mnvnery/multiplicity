'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { AboutSection } from './AboutSection'
import { NextEventSection } from './NextEventSection'

interface AboutParagraph {
  text: string
}

interface NextEvent {
  title: string
  date: string
  location?: {
    address?: string | null
    addressLink?: string | null
  } | null
  speakers?: Array<{
    studioName?: string | null
    names: string
    image?:
      | number
      | {
          url?: string | null
          alt?: string | null
        }
      | null
  }> | null
  sponsors?: Array<{
    image:
      | number
      | {
          url?: string | null
          alt?: string | null
        }
      | null
    id?: string | null
  }> | null
  description?: any
  ticketUrl?: string | null
}

interface AboutToNextEventTransitionProps {
  paragraphs: AboutParagraph[]
  nextEvent: NextEvent
}

export function AboutToNextEventTransition({
  paragraphs,
  nextEvent,
}: AboutToNextEventTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const aboutSectionRef = useRef<HTMLDivElement>(null)

  // Calculate the height needed for AboutSection to complete
  // AboutSection has minHeight of paragraphs.length * 150 + 100vh
  const aboutSectionHeight = paragraphs.length * 150 + 100
  // Total container height: AboutSection scroll + transition
  const totalHeight = aboutSectionHeight + 100 // Add 100vh for transition

  // Track scroll progress for the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Calculate when AboutSection is complete (when scroll reaches aboutSectionHeight portion)
  const aboutSectionComplete = aboutSectionHeight / totalHeight

  // About section: stays at scale 1 until transition starts, then scales down
  const aboutScale = useTransform(scrollYProgress, [0, aboutSectionComplete, 1], [1, 1, 0.8])
  const aboutRotate = useTransform(scrollYProgress, [0, aboutSectionComplete, 1], [0, 0, 0])

  // NextEvent section: only starts appearing after AboutSection is complete
  const nextEventScale = useTransform(scrollYProgress, [aboutSectionComplete, 1], [0.8, 1])
  const nextEventRotate = useTransform(scrollYProgress, [aboutSectionComplete, 1], [0, 0])
  const nextEventY = useTransform(scrollYProgress, [aboutSectionComplete, 1], ['100%', '0%'])
  const nextEventOpacity = useTransform(
    scrollYProgress,
    [aboutSectionComplete, Math.min(aboutSectionComplete + 0.1, 1)],
    [0, 1],
  )

  return (
    <div ref={containerRef} className="relative bg-yellow" style={{ height: `${totalHeight}vh` }}>
      {/* About Section - Sticky with perspective effect */}
      <div ref={aboutSectionRef} className="sticky top-0 h-screen overflow-hidden z-0">
        <motion.div
          style={{
            scale: aboutScale,
            rotate: aboutRotate,
            transformOrigin: 'center center',
          }}
          className="h-full w-full"
        >
          <AboutSection paragraphs={paragraphs} />
        </motion.div>
      </div>

      {/* NextEvent Section - Scrolls up over About only after AboutSection completes */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none">
        <motion.div
          style={{
            scale: nextEventScale,
            rotate: nextEventRotate,
            y: nextEventY,
            opacity: nextEventOpacity,
            transformOrigin: 'center center',
          }}
          className="h-full w-full bg-yellow relative z-10 pointer-events-auto"
        >
          <div className="h-full overflow-y-auto">
            <NextEventSection nextEvent={nextEvent} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
