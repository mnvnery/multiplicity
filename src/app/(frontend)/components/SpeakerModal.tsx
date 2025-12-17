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
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as any },
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

    // Check if device has touch support - skip cursor functionality on mobile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) {
      return
    }

    // Use quickSetter for better performance - no easing, instant updates
    const xSetContainer = gsap.quickSetter(modalContainer.current, 'left', 'px')
    const ySetContainer = gsap.quickSetter(modalContainer.current, 'top', 'px')
    const xSetCursor = gsap.quickSetter(cursorRef.current, 'left', 'px')
    const ySetCursor = gsap.quickSetter(cursorRef.current, 'top', 'px')

    // Track position for smooth interpolation
    const pos = {
      containerX: 0,
      containerY: 0,
      cursorX: 0,
      cursorY: 0,
      targetContainerX: 0,
      targetContainerY: 0,
      targetCursorX: 0,
      targetCursorY: 0,
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      pos.targetContainerX = clientX
      pos.targetContainerY = clientY
      pos.targetCursorX = clientX - 45 // Center the cursor (90px / 2 = 45px offset)
      pos.targetCursorY = clientY - 45
    }

    // Use requestAnimationFrame for smooth, performant updates
    let rafId: number
    const animate = () => {
      // Lerp for smooth following - faster interpolation for cursor
      pos.containerX += (pos.targetContainerX - pos.containerX) * 0.15
      pos.containerY += (pos.targetContainerY - pos.containerY) * 0.15
      pos.cursorX += (pos.targetCursorX - pos.cursorX) * 0.25
      pos.cursorY += (pos.targetCursorY - pos.cursorY) * 0.25

      xSetContainer(pos.containerX)
      ySetContainer(pos.containerY)
      xSetCursor(pos.cursorX)
      ySetCursor(pos.cursorY)

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
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
          willChange: 'left, top, transform, opacity',
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
        className="hidden md:flex fixed top-0 left-0 w-[90px] h-[90px] pointer-events-none z-[9999] items-center justify-center"
        style={{
          transformOrigin: 'center center',
          willChange: 'left, top, transform, opacity',
        }}
      >
        <Image
          src="/read-more.svg"
          alt="Read more"
          width={90}
          height={90}
          className="w-full h-full"
          priority
        />
      </motion.div>
    </>
  )
}
