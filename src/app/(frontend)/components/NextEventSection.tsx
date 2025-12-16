'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
import { textVariants, buttonVariants, cn } from '../lib/variants'
import { SpeakersList } from './SpeakersList'
import { SofterButton } from './SofterButton'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
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
  description?: any // richText from Lexical
  ticketUrl?: string | null
}

// Helper to render richText links (reused from SpeakerBioOverlay)
const renderRichText = (lexical: any): React.ReactNode => {
  if (!lexical?.root?.children) return null

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (node.type === 'paragraph') {
      return (
        <p key={index} className="mb-4">
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </p>
      )
    }
    if (node.type === 'text') {
      const text = node.text || ''
      if (node.format) {
        let content: React.ReactNode = text
        if (node.format & 1) content = <strong key={index}>{content}</strong> // bold
        if (node.format & 2) content = <em key={index}>{content}</em> // italic
        return content
      }
      return text
    }
    if (node.type === 'link') {
      return (
        <a
          key={index}
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-70"
        >
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </a>
      )
    }
    if (node.children) {
      return node.children.map((child: any, i: number) => renderNode(child, i))
    }
    return null
  }

  return <div>{lexical.root.children.map((node: any, i: number) => renderNode(node, i))}</div>
}

interface NextEventSectionProps {
  nextEvent: NextEvent
}

export function NextEventSection({ nextEvent }: NextEventSectionProps) {
  const titleRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  // Scroll-triggered animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'start 0.3'],
  })

  const contentOpacity = useTransform(scrollYProgress, [0.2, 0.7], [0, 1])
  const contentY = useTransform(scrollYProgress, [0.2, 0.7], [30, 0])

  // Add GSAP mask reveal for title (same as PastEventsSection)
  useEffect(() => {
    if (!titleRef.current || hasAnimated) {
      console.log('🚫 Next Event title animation skipped:', {
        hasRef: !!titleRef.current,
        hasAnimated,
      })
      return
    }

    const title = titleRef.current
    console.log('🎬 Next Event title animation setup starting')

    // Set initial state with mask
    gsap.set(title, {
      clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
      opacity: 0,
    })

    // Animate reveal
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: title,
        start: 'top 70%',
        toggleActions: 'play none none none',
        onEnter: () => console.log('✨ Next Event title animation TRIGGERED at top 70%'),
      },
      onStart: () => console.log('▶️  Next Event title animation STARTED'),
      onComplete: () => {
        console.log('✅ Next Event title animation COMPLETED')
        setHasAnimated(true)
      },
    })

    timeline.to(title, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    })

    return () => {
      console.log('🧹 Next Event title animation cleanup')
      timeline.kill()
    }
  }, [hasAnimated])

  return (
    <section
      ref={sectionRef}
      id="next-event"
      className="border-t border-black max-w-8xl mx-auto px-2.5 md:px-5 mb-10 bg-yellow"
    >
      <div ref={titleRef} className="text-center mx-auto my-10 md:my-10">
        <Image
          src="/NEXT EVENT.svg"
          alt="Next Event"
          width={1392}
          height={322}
          className="w-full h-auto"
        />
      </div>
      <motion.div
        className="md:grid grid-cols-2 gap-10 md:mt-20"
        style={{
          opacity: contentOpacity,
          y: contentY,
        }}
      >
        <div className="mb-8">
          <h3
            className={cn(
              textVariants({
                size: '6xl',
                font: 'oldman',
                weight: 'bold',
                transform: 'uppercase',
                leading: 'under',
              }),
            )}
          >
            {nextEvent.title}
          </h3>
          <p
            className={cn(
              textVariants({
                size: '6xl',
                font: 'oldman',
                weight: 'bold',
                transform: 'uppercase',
                leading: 'under',
              }),
              'mb-8',
            )}
          >
            {(() => {
              const date = new Date(nextEvent.date)
              const month = date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()
              const day = date.getDate()
              const year = date.getFullYear()

              // Add ordinal suffix to day
              const getOrdinal = (n: number) => {
                const s = ['TH', 'ST', 'ND', 'RD']
                const v = n % 100
                return n + (s[(v - 20) % 10] || s[v] || s[0])
              }

              return (
                <>
                  {month} {getOrdinal(day)}
                  <br />
                  {year}
                </>
              )
            })()}
          </p>
          <div className="text-base leading-relaxed">
            {nextEvent.location?.address && (
              <p className="font-ufficio uppercase whitespace-pre-line"></p>
            )}
            {nextEvent.location?.addressLink && (
              <a
                href={nextEvent.location.addressLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  textVariants({ size: 'lg', font: 'ufficio', transform: 'uppercase' }),
                  'whitespace-pre-line mt-2.5 opacity-100 hover:underline transition-opacity',
                )}
              >
                {nextEvent.location.address}
              </a>
            )}
          </div>
        </div>
        <div>
          {nextEvent.speakers && nextEvent.speakers.length > 0 && (
            <SpeakersList speakers={nextEvent.speakers} titleRef={titleRef} />
          )}
        </div>
      </motion.div>
      {nextEvent.description && (
        <div className="my-10 md:my-14 text-center">
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className={cn(
              textVariants({ size: 'sm', font: 'ufficio', transform: 'uppercase' }),
              'hover:opacity-70 transition-opacity cursor-pointer underline',
            )}
          >
            {isDescriptionExpanded ? 'LESS INFORMATION' : 'MORE INFORMATION'}
          </button>
          <AnimatePresence>
            {isDescriptionExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden mt-6"
              >
                <div
                  className={cn(
                    textVariants({ size: 'base', font: 'ufficio', transform: 'uppercase' }),
                    'max-w-4xl mx-auto text-left md:text-center px-2.5 md:px-0 mt-5 md:mt-10',
                  )}
                >
                  {renderRichText(nextEvent.description)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {nextEvent.ticketUrl && (
        <SofterButton
          as="a"
          href={nextEvent.ticketUrl}
          className={cn(
            buttonVariants({ variant: 'primary', size: '3xl', width: 'full' }),
            'block text-center',
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          BUY TICKETS
        </SofterButton>
      )}
      {/* Event Sponsors Section */}
      {nextEvent.sponsors && nextEvent.sponsors.length > 0 && (
        <>
          <div
            className={cn(
              textVariants({ size: 'sm', font: 'ufficio', transform: 'uppercase' }),
              'text-center hover:opacity-70 transition-opacity cursor-pointer mt-20',
            )}
          >
            WITH THANKS TO OUR SPONSORS
          </div>
          <div className="flex flex-wrap justify-center gap-10 mb-10 md:mb-0">
            {nextEvent.sponsors.map((sponsor, index) => {
              const imageData =
                typeof sponsor.image === 'object' && sponsor.image !== null ? sponsor.image : null
              const imageUrl = imageData?.url
              if (!imageUrl) return null

              return (
                <motion.div
                  key={sponsor.id || Math.random()}
                  className="w-full max-w-xs w-[325px] h-auto md:h-[325px]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Image
                    src={imageUrl}
                    alt={imageData?.alt || 'Sponsor'}
                    width={325}
                    height={325}
                    className="w-full h-full object-contain p-10"
                  />
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
