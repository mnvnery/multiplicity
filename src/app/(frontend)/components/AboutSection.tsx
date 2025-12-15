'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'motion/react'
import { textVariants, cn } from '../lib/variants'

interface AboutParagraph {
  text: string
}

interface AboutSectionProps {
  paragraphs: AboutParagraph[]
}

interface WordProps {
  children: string
  progress: any
  range: [number, number]
}

const Word = ({ children, progress, range }: WordProps) => {
  const opacity = useTransform(progress, range, [0, 1])
  return (
    <span className="inline-block relative">
      <span className="opacity-30">{children}</span>
      <motion.span className="absolute inset-0" style={{ opacity }}>
        {children}
      </motion.span>
    </span>
  )
}

interface ParagraphProps {
  paragraph: string
  progress: any
  paragraphProgress: any
  index: number
  totalParagraphs: number
  isLast: boolean
}

const Paragraph = ({
  paragraph,
  progress,
  paragraphProgress,
  index,
  totalParagraphs,
  isLast,
}: ParagraphProps) => {
  const words = paragraph.split(' ')

  // Opacity: fade in at start, fade out at end (except last paragraph)
  const opacity = useTransform(paragraphProgress, (p: number) => {
    if (p < 0.15) return p / 0.15 // Fade in (0 to 0.15)
    if (p < 0.7) return 1 // Full opacity (0.15 to 0.4)
    // Last paragraph stays at full opacity
    if (isLast) return 1
    if (p < 0.85) return 1 - (p - 0.7) / 0.15 // Fade out (0.4 to 0.85)
    return 0 // Fully transparent (0.85 to 1)
  })

  // Scale: normal at start, scale down by 10% during fade out (except last paragraph)
  const scale = useTransform(paragraphProgress, (p: number) => {
    if (p < 0.4) return 1 // Normal scale
    // Last paragraph stays at normal scale
    if (isLast) return 1
    if (p < 0.85) {
      // Scale down from 1 to 0.9 during fade out
      const fadeProgress = (p - 0.4) / 0.45
      return 1 - fadeProgress * 0.1 // Scale down by 10%
    }
    return 0.9 // Final scale
  })

  // Y position: scroll in from bottom, fix in center
  const y = useTransform(paragraphProgress, (p: number) => {
    if (p < 0.15) {
      // Scroll in from bottom
      return (1 - p / 0.15) * 150 // Start at 150px down, move to 0
    }
    // Fixed in center
    return 0
  })

  // Z-index: higher index paragraphs should be on top when active
  const zIndex = useTransform(paragraphProgress, (p: number) => {
    // Higher z-index when paragraph is more active
    return p > 0.1 && p < 0.9 ? totalParagraphs - index : 0
  })

  // Pointer events: only allow interaction when visible
  const pointerEvents = useTransform(opacity, (o: number) => (o > 0.1 ? 'auto' : 'none'))

  return (
    <motion.p
      className={cn(
        textVariants({
          size: '3xl',
          font: 'oldman',
          weight: 'normal',
          leading: 'tight',
        }),
        'absolute w-full text-center px-5',
        index === 0 && '-mt-[20vh]',
        index === 2 && 'mt-[5vh]',
      )}
      style={{
        opacity,
        scale,
        y,
        zIndex,
        pointerEvents,
      }}
    >
      {words.map((word, i) => {
        // Calculate word reveal range based on paragraph progress
        // Words reveal sequentially as we scroll through the paragraph
        const wordStart = 0.15 + (i / words.length) * 0.5 // Start revealing after initial fade-in
        const wordEnd = wordStart + (1 / words.length) * 0.5
        const range: [number, number] = [wordStart, wordEnd]

        return (
          <React.Fragment key={i}>
            <Word progress={paragraphProgress} range={range}>
              {word}
            </Word>
            {i < words.length - 1 && '\u00A0'}
          </React.Fragment>
        )
      })}
    </motion.p>
  )
}

export function AboutSection({ paragraphs }: AboutSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.5'],
  })

  // Create smooth spring animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  if (!paragraphs || paragraphs.length === 0) return null

  // Calculate extra height for last paragraph to ensure animation completes
  // Last paragraph words finish at ~0.65 of paragraph progress, so we need extra space
  const extraHeightForLastParagraph = 50 // Additional vh for last paragraph
  const baseHeight = paragraphs.length * 150
  const totalHeight = baseHeight + extraHeightForLastParagraph

  return (
    <section
      ref={containerRef}
      className="max-w-5xl mx-auto px-2.5 md:px-5 mb-24 text-center relative"
      style={{ minHeight: `${totalHeight}vh` }}
    >
      <div className="sticky top-0 flex items-center justify-center" style={{ height: '100vh' }}>
        {paragraphs.map((paragraph, index) => {
          const isLast = index === paragraphs.length - 1
          const totalParagraphs = paragraphs.length

          // Calculate progress ranges for each paragraph
          // First paragraph starts earlier to appear closer to content above
          let paragraphStart: number
          let paragraphEnd: number

          if (index === 0) {
            // First paragraph starts at 0 to appear immediately when section enters viewport
            paragraphStart = 0
            paragraphEnd = 1 / totalParagraphs
          } else {
            // Other paragraphs maintain their normal spacing (starting from where first ends)
            paragraphStart = index / totalParagraphs
            paragraphEnd = (index + 1) / totalParagraphs
          }

          // Last paragraph gets extended to use more of the scroll range
          // This ensures word animation completes before section ends
          const actualEnd = isLast ? 0.95 : paragraphEnd

          // Calculate progress within this paragraph's range (0 to 1)
          const paragraphProgress = useTransform(smoothProgress, (progress: number) => {
            if (progress < paragraphStart) return 0
            if (progress > actualEnd) return 1
            return (progress - paragraphStart) / (actualEnd - paragraphStart)
          })

          return (
            <Paragraph
              key={index}
              paragraph={paragraph.text}
              progress={smoothProgress}
              paragraphProgress={paragraphProgress}
              index={index}
              totalParagraphs={totalParagraphs}
              isLast={isLast}
            />
          )
        })}
      </div>
    </section>
  )
}
