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

  // Opacity: fade in at start
  const opacity = useTransform(paragraphProgress, (p: number) => {
    if (p < 0.15) return p / 0.15 // Fade in (0 to 0.15)
    return 1 // Stay at full opacity
  })

  return (
    <motion.p
      className={cn(
        textVariants({
          size: '3xl',
          font: 'oldman',
          weight: 'normal',
          leading: 'tight',
        }),
        'w-full text-center px-5 mb-16',
      )}
      style={{
        opacity,
      }}
    >
      {words.map((word, i) => {
        // Calculate word reveal range based on paragraph progress
        // Words reveal sequentially as we scroll through the paragraph
        const wordStart = 0.15 + (i / words.length) * 0.75 // Start revealing after initial fade-in
        const wordEnd = wordStart + (1 / words.length) * 0.75
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
    offset: ['start 0.9', 'end 0.3'],
  })

  // Create smooth spring animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  if (!paragraphs || paragraphs.length === 0) return null

  return (
    <section ref={containerRef} className="max-w-5xl mx-auto px-2.5 md:px-5 mb-24 text-center">
      {paragraphs.map((paragraph, index) => {
        const isLast = index === paragraphs.length - 1
        const totalParagraphs = paragraphs.length

        // Calculate progress ranges for each paragraph
        let paragraphStart = index / totalParagraphs
        const paragraphEnd = (index + 1) / totalParagraphs

        // Start the last paragraph earlier so it overlaps more with the previous one
        if (isLast && index > 0) {
          paragraphStart = paragraphStart - 0.15 // Start 15% earlier
        }

        // Calculate progress within this paragraph's range (0 to 1)
        const paragraphProgress = useTransform(smoothProgress, (progress: number) => {
          if (progress < paragraphStart) return 0
          if (progress > paragraphEnd) return 1
          return (progress - paragraphStart) / (paragraphEnd - paragraphStart)
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
    </section>
  )
}
