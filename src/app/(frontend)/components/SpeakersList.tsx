'use client'

import React, { useState, useEffect, useRef } from 'react'
import { textVariants, cn } from '../lib/variants'
import SpeakerModal from './SpeakerModal'
import { SpeakerBioOverlay } from './SpeakerBioOverlay'
import Image from 'next/image'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Speaker {
  studioName?: string | null
  names: string
  bio?: any
  socials?: any
  image?:
    | number
    | {
        url?: string | null
        alt?: string | null
      }
    | null
}

interface SpeakersListProps {
  speakers: Speaker[]
  titleRef: React.RefObject<HTMLDivElement | null>
}

export function SpeakersList({ speakers, titleRef }: SpeakersListProps) {
  const [modal, setModal] = useState({ active: false, index: 0 })
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayIndex, setOverlayIndex] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // Add stagger animation for speakers
  useEffect(() => {
    if (!listRef.current || hasAnimated) return

    const speakers = listRef.current.querySelectorAll('[data-speaker]')

    gsap.set(speakers, {
      opacity: 0,
      y: 40,
    })

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: listRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onComplete: () => setHasAnimated(true),
    })

    timeline.to(speakers, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
    })

    return () => {
      timeline.kill()
    }
  }, [hasAnimated])

  if (!speakers || speakers.length === 0) return null

  const handleSpeakerClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Speaker clicked', idx, 'Opening overlay')
    setOverlayIndex(idx)
    setOverlayOpen(true)
    console.log('Overlay state set to open')
  }

  const handleNext = () => {
    const nextIndex = (overlayIndex + 1) % speakers.length
    setOverlayIndex(nextIndex)
  }

  const handlePrev = () => {
    const prevIndex = (overlayIndex - 1 + speakers.length) % speakers.length
    setOverlayIndex(prevIndex)
  }

  return (
    <>
      {/* Speakers list */}
      <div ref={listRef} className="md:col-span-2 flex flex-col">
        {speakers.map((speaker, idx) => {
          const imageData =
            typeof speaker.image === 'object' && speaker.image !== null ? speaker.image : null
          const hasImage = !!imageData?.url

          return (
            <motion.div
              key={idx}
              data-speaker
              className="md:pl-5 py-6 relative z-10 group"
              style={{
                cursor: hasImage ? 'none' : 'pointer',
              }}
              onMouseEnter={() => {
                if (hasImage) {
                  setModal({ active: true, index: idx })
                }
              }}
              onMouseLeave={() => {
                setModal({ active: false, index: idx })
              }}
              onClick={(e) => {
                console.log('Click event fired on speaker', idx)
                handleSpeakerClick(e, idx)
              }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {imageData?.url && (
                <div className="md:hidden relative w-full aspect-[3/2] mb-2">
                  <Image
                    src={imageData.url}
                    alt={imageData.alt || speaker.names}
                    fill
                    className="object-top object-cover"
                  />
                </div>
              )}
              {speaker.studioName && (
                <p
                  className={cn(
                    textVariants({
                      size: '3xl',
                      font: 'oldman',
                      weight: 'bold',
                      transform: 'uppercase',
                      leading: 'none',
                    }),
                    'mb-1 transition-all duration-300 underline',
                  )}
                >
                  {speaker.studioName}
                </p>
              )}
              <p
                className={cn(
                  textVariants({
                    size: '3xl',
                    font: 'oldman',
                    weight: 'normal',
                    leading: 'none',
                  }),
                  'transition-all duration-300',
                )}
              >
                {speaker.names}
              </p>
            </motion.div>
          )
        })}
      </div>

      <SpeakerModal modal={modal} speakers={speakers} />
      <SpeakerBioOverlay
        isOpen={overlayOpen}
        currentIndex={overlayIndex}
        speakers={speakers}
        onClose={() => setOverlayOpen(false)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </>
  )
}
