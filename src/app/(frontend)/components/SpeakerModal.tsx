'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import gsap from 'gsap'
import Image from 'next/image'

interface Speaker {
  studioName?: string | null
  names: string
  image?:
    | number
    | {
        url?: string | null
        alt?: string | null
      }
    | null
}

interface SpeakerModalProps {
  modal: { active: boolean; index: number }
  speakers: Speaker[]
}

const scaleAnimation = {
  initial: { scale: 0, opacity: 0 },
  enter: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as any },
  },
  closed: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as any },
  },
}

export default function SpeakerModal({ modal, speakers }: SpeakerModalProps) {
  const { active, index } = modal
  const modalContainer = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!modalContainer.current || !cursorRef.current) {
      return
    }

    // Move Container
    const xMoveContainer = gsap.quickTo(modalContainer.current, 'left', {
      duration: 1,
      ease: 'power2.out',
    })
    const yMoveContainer = gsap.quickTo(modalContainer.current, 'top', {
      duration: 1,
      ease: 'power2.out',
    })

    // Move cursor
    const xMoveCursor = gsap.quickTo(cursorRef.current, 'left', {
      duration: 0.8,
      ease: 'power2.out',
    })
    const yMoveCursor = gsap.quickTo(cursorRef.current, 'top', {
      duration: 0.8,
      ease: 'power2.out',
    })

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      xMoveContainer(clientX)
      yMoveContainer(clientY)
      // Center the cursor (90px / 2 = 45px offset)
      xMoveCursor(clientX - 45)
      yMoveCursor(clientY - 45)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Filter speakers with images and create a mapping
  const speakersWithImages = speakers
    .map((speaker, idx) => {
      const imageData =
        typeof speaker.image === 'object' && speaker.image !== null ? speaker.image : null
      const imageUrl = imageData?.url
      return imageUrl ? { speaker, originalIndex: idx, imageUrl } : null
    })
    .filter(
      (item): item is { speaker: Speaker; originalIndex: number; imageUrl: string } =>
        item !== null,
    )

  // Map the hovered index to the filtered index
  const filteredIndex = speakersWithImages.findIndex((item) => item.originalIndex === index)
  const shouldShow = active && filteredIndex >= 0 && speakersWithImages.length > 0

  return (
    <>
      <motion.div
        ref={modalContainer}
        variants={scaleAnimation}
        initial="initial"
        animate={shouldShow ? 'enter' : 'closed'}
        className="hidden md:block fixed top-0 left-0 w-[300px] h-[200px] pointer-events-none z-[9998] overflow-hidden"
        style={{
          transformOrigin: 'center center',
          visibility: shouldShow ? 'visible' : 'hidden',
        }}
      >
        {speakersWithImages.length > 0 && (
          <div
            className="absolute w-full"
            style={{
              height: `${speakersWithImages.length * 200}px`,
              transform: `translateY(${filteredIndex >= 0 ? filteredIndex * -200 : 0}px)`,
              transition: 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            {speakersWithImages.map(({ speaker, imageUrl }, idx) => (
              <div
                key={`modal_${idx}`}
                className="absolute w-full h-[200px] flex items-center justify-center"
                style={{ top: `${idx * 200}px` }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt={speaker.names || 'Speaker'}
                    fill
                    className="object-cover mix-blend-multiply"
                    sizes="400px"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Animated cursor */}
      <motion.div
        ref={cursorRef}
        variants={scaleAnimation}
        initial="initial"
        animate={shouldShow ? 'enter' : 'closed'}
        className="fixed top-0 left-0 w-[90px] h-[90px] pointer-events-none z-[9999] flex items-center justify-center"
        style={{
          transformOrigin: 'center center',
          visibility: shouldShow ? 'visible' : 'hidden',
        }}
      >
        <Image
          src="/read-more.svg"
          alt="Read more"
          width={90}
          height={90}
          className="w-full h-full"
        />
      </motion.div>
    </>
  )
}
