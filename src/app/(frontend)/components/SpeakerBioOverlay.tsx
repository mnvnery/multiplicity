'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react'
import useEmblaCarousel from 'embla-carousel-react'
import AutoHeight from 'embla-carousel-auto-height'
import Image from 'next/image'
import { IoIosArrowBack, IoIosArrowForward, IoIosClose } from 'react-icons/io'
import { textVariants, cn } from '../lib/variants'

interface Speaker {
  studioName?: string | null
  names: string
  bio?: any // richText from Lexical
  socials?: any // richText from Lexical
  image?:
    | number
    | {
        url?: string | null
        alt?: string | null
      }
    | null
}

interface SpeakerBioOverlayProps {
  isOpen: boolean
  currentIndex: number
  speakers: Speaker[]
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

// Helper to extract text from Lexical richText
const extractTextFromLexical = (lexical: any): string => {
  if (!lexical?.root?.children) return ''
  const extract = (node: any): string => {
    if (node.text) return node.text
    if (node.children) {
      return node.children.map(extract).join('')
    }
    return ''
  }
  return lexical.root.children.map(extract).join('\n')
}

// Helper to render richText links
const renderRichText = (lexical: any): React.ReactNode => {
  if (!lexical?.root?.children) return null

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (node.type === 'paragraph') {
      return (
        <p key={index} className="mb-2">
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </p>
      )
    }
    if (node.type === 'linebreak') {
      return <br key={index} />
    }
    if (node.type === 'text') {
      const text = node.text || ''
      // Split text by newlines and render with breaks
      const parts = text.split('\n')
      if (parts.length > 1) {
        return (
          <React.Fragment key={index}>
            {parts.map((part: string, i: number) => {
              let content: React.ReactNode = part
              if (node.format) {
                if (node.format & 1) content = <strong>{content}</strong> // bold
                if (node.format & 2) content = <em>{content}</em> // italic
              }
              return (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {content}
                </React.Fragment>
              )
            })}
          </React.Fragment>
        )
      }
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
          href={node.fields?.url || ''}
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

export function SpeakerBioOverlay({
  isOpen,
  currentIndex,
  speakers,
  onClose,
  onNext,
  onPrev,
}: SpeakerBioOverlayProps) {
  const [mounted, setMounted] = useState(false)
  const [cursorArea, setCursorArea] = useState<'left' | 'center' | 'right' | null>(null)
  const [isOverLink, setIsOverLink] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const prevIsOpenRef = useRef<boolean | null>(null)
  const [shouldAnimateText, setShouldAnimateText] = useState(false)

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
      containScroll: false,
      duration: 25, // Slower base duration for smoother feel
      watchDrag: typeof window !== 'undefined' && window.innerWidth < 768, // Enable drag only on mobile
    },
    [AutoHeight()], // Auto-adjust height to match each slide's content
  )

  // Ensure we only render on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Smooth spring animations for cursor position
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  const currentSpeaker = speakers[currentIndex]
  const imageData =
    currentSpeaker && typeof currentSpeaker.image === 'object' && currentSpeaker.image !== null
      ? currentSpeaker.image
      : null
  const imageUrl = imageData?.url

  // Custom scroll function with controllable animation duration for smoother transitions
  const scrollToWithDuration = useCallback(
    (targetIndex: number, duration: number = 600) => {
      if (!emblaApi) return

      const container = emblaApi.rootNode().querySelector('.embla__container') as HTMLElement
      if (!container) {
        emblaApi.scrollTo(targetIndex)
        return
      }

      const startScroll = container.scrollLeft
      const startTime = performance.now()

      // Scroll immediately to target to measure target position, then animate
      emblaApi.scrollTo(targetIndex)
      const targetScroll = container.scrollLeft

      // Reset and animate
      container.scrollLeft = startScroll

      // Animate with smooth easing
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Smooth ease-in-out function
        const ease =
          progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

        container.scrollLeft = startScroll + (targetScroll - startScroll) * ease

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Final snap to ensure alignment
          emblaApi.scrollTo(targetIndex)
        }
      }

      requestAnimationFrame(animate)
    },
    [emblaApi],
  )

  // Wrapped callbacks to control embla carousel with smooth animations
  const handleNext = useCallback(() => {
    if (!emblaApi) return
    const nextIndex = emblaApi.selectedScrollSnap() + 1
    scrollToWithDuration(nextIndex, 600) // 600ms duration for smooth transition
    onNext()
  }, [emblaApi, onNext, scrollToWithDuration])

  const handlePrev = useCallback(() => {
    if (!emblaApi) return
    const prevIndex = emblaApi.selectedScrollSnap() - 1
    scrollToWithDuration(prevIndex, 600) // 600ms duration for smooth transition
    onPrev()
  }, [emblaApi, onPrev, scrollToWithDuration])

  // Sync embla carousel with currentIndex
  useEffect(() => {
    if (emblaApi && isOpen) {
      emblaApi.scrollTo(currentIndex, false)
    }
  }, [emblaApi, currentIndex, isOpen])

  // Track opening/closing for text animations
  useEffect(() => {
    const isOpeningOrClosing = prevIsOpenRef.current !== isOpen

    if (isOpeningOrClosing) {
      // Opening or closing - enable animations
      setShouldAnimateText(isOpen)
    }

    prevIsOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    // Only enable custom cursor on desktop
    const isDesktop = window.innerWidth >= 768

    const handleMouseMove = (e: MouseEvent) => {
      if (!overlayRef.current || !isDesktop) {
        setCursorArea(null)
        setIsOverLink(false)
        return
      }

      // Update mouse position for custom cursor with smooth spring animation
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)

      // Check if hovering over a link
      const target = e.target as HTMLElement
      const isLink = !!target.closest('a')
      setIsOverLink(isLink)

      const rect = overlayRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const width = rect.width
      const height = rect.height
      const edgeZone = width * 0.1 // 10% on each side for prev/next (more peripheral)
      const topRightCornerSize = Math.min(width, height) * 0.15 // 15% corner area

      // Check if in top-right corner first (priority area for close)
      const isInTopRightCorner = x > width - topRightCornerSize && y < topRightCornerSize

      // Still determine cursor area even when over links, so we can show scaled-down cursor
      if (isInTopRightCorner) {
        setCursorArea('center') // Use center to show close cursor
      } else if (x < edgeZone) {
        setCursorArea('left')
      } else if (x > width - edgeZone) {
        setCursorArea('right')
      } else {
        setCursorArea('center')
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (!overlayRef.current || !isDesktop) return

      // Don't trigger if clicking on the close button or links
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('a')) return

      const rect = overlayRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const width = rect.width
      const height = rect.height
      const edgeZone = width * 0.1 // 10% on each side for prev/next (more peripheral)
      const topRightCornerSize = Math.min(width, height) * 0.15 // 15% corner area

      // Check if in top-right corner first (priority area for close)
      const isInTopRightCorner = x > width - topRightCornerSize && y < topRightCornerSize

      if (isInTopRightCorner) {
        onClose()
      } else if (x < edgeZone) {
        handlePrev()
      } else if (x > width - edgeZone) {
        handleNext()
      } else {
        onClose()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [isOpen, onClose, handleNext, handlePrev])

  const getCursorStyle = () => {
    // Only show custom cursor on desktop
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 'default'
    // Hide default cursor when showing custom cursor or link cursor
    if (isOverLink || cursorArea) return 'none'
    return 'default'
  }

  // Early return check after all hooks
  if (!currentSpeaker || !mounted) {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{
            y: '100%',
            rotate: 5,
          }}
          animate={{
            y: 0,
            rotate: 0,
          }}
          exit={{
            y: '100%',
            rotate: 5,
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed inset-0 z-[10000] overflow-y-auto overflow-x-hidden overscroll-contain"
          style={{ backgroundColor: '#BFA9FF', cursor: getCursorStyle() }}
        >
          {/* Mobile Navigation Controls */}
          <div className="md:hidden absolute top-0 left-0 right-0 z-[10001] flex justify-between items-center px-0 pt-2 pb-0 bg-[#BFA9FF]">
            <div className="flex items-center gap-4">
              <button onClick={handlePrev} className="p-2" aria-label="Previous speaker">
                <IoIosArrowBack className="w-9 h-9" />
              </button>
              <button onClick={handleNext} className="p-2" aria-label="Next speaker">
                <IoIosArrowForward className="w-9 h-9" />
              </button>
            </div>
            <button onClick={onClose} className="p-2" aria-label="Close">
              <IoIosClose className="w-14 h-14" />
            </button>
          </div>

          {/* Custom SVG cursor */}
          {typeof window !== 'undefined' && window.innerWidth >= 768 && cursorArea && (
            <motion.div
              className="pointer-events-none fixed z-[10001]"
              style={{
                x: cursorXSpring,
                y: cursorYSpring,
                translateX: '-50%',
                translateY: '-50%',
              }}
              initial={{ opacity: 0, scale: isOverLink ? 0.15 : 0.6 }}
              animate={{
                opacity: 1,
                scale: isOverLink ? 0.15 : 1,
              }}
              exit={{ opacity: 0, scale: isOverLink ? 0.15 : 0.6 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {cursorArea === 'left' && (
                <img src="/prev.svg" alt="" width={90} height={90} className="w-20 h-20" />
              )}
              {cursorArea === 'right' && (
                <img src="/next.svg" alt="" width={90} height={90} className="w-20 h-20" />
              )}
              {cursorArea === 'center' && (
                <img src="/close.svg" alt="" width={90} height={90} className="w-20 h-20" />
              )}
            </motion.div>
          )}

          {/* Embla Carousel */}
          <div className="overflow-hidden transition-[height] duration-300" ref={emblaRef}>
            <div className="flex items-start embla__container">
              {speakers.map((speaker, index) => {
                const speakerImageData =
                  speaker && typeof speaker.image === 'object' && speaker.image !== null
                    ? speaker.image
                    : null
                const speakerImageUrl = speakerImageData?.url

                return (
                  <div
                    key={index}
                    className="flex-[0_0_100%] min-w-0"
                    style={{ userSelect: 'none' }}
                  >
                    <div className="max-w-8xl mx-auto px-4 md:px-8 pt-20 md:pt-12 pb-10 md:pb-12">
                      <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-start">
                        {/* Left side - Images */}
                        <div className="space-y-8">
                          {speakerImageUrl &&
                            (shouldAnimateText ? (
                              <AnimatePresence mode="wait">
                                {isOpen && (
                                  <motion.div
                                    key={`image-${isOpen}`}
                                    initial={{ opacity: 0, rotate: 5 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 5 }}
                                    transition={{
                                      duration: 0.8,
                                      ease: [0.4, 0, 0.2, 1],
                                      delay: 0.2,
                                    }}
                                    className="relative w-full aspect-[3/2]"
                                  >
                                    <Image
                                      src={speakerImageUrl}
                                      alt={speaker.names || 'Speaker'}
                                      fill
                                      className="object-top object-cover"
                                      sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            ) : (
                              <div className="relative w-full aspect-[3/2]">
                                <Image
                                  src={speakerImageUrl}
                                  alt={speaker.names || 'Speaker'}
                                  fill
                                  className="object-top object-cover"
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                />
                              </div>
                            ))}
                          {shouldAnimateText ? (
                            <AnimatePresence mode="wait">
                              {isOpen && (
                                <motion.div
                                  key={`names-${isOpen}`}
                                  initial={{ opacity: 0, x: -50 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -50 }}
                                  transition={{
                                    duration: 0.6,
                                    ease: [0.4, 0, 0.2, 1],
                                    delay: 0.3,
                                  }}
                                  className="space-y-0"
                                >
                                  {speaker.studioName && (
                                    <p
                                      className={cn(
                                        textVariants({
                                          size: '4xl',
                                          font: 'oldman',
                                          weight: 'bold',
                                          transform: 'uppercase',
                                          leading: 'none',
                                        }),
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
                                    )}
                                  >
                                    {speaker.names}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          ) : (
                            <div className="space-y-0">
                              {speaker.studioName && (
                                <p
                                  className={cn(
                                    textVariants({
                                      size: '4xl',
                                      font: 'oldman',
                                      weight: 'bold',
                                      transform: 'uppercase',
                                      leading: 'none',
                                    }),
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
                                )}
                              >
                                {speaker.names}
                              </p>
                            </div>
                          )}
                          {speaker.socials &&
                            (shouldAnimateText ? (
                              <AnimatePresence mode="wait">
                                {isOpen && (
                                  <motion.div
                                    key={`socials-${isOpen}`}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{
                                      duration: 0.6,
                                      ease: [0.4, 0, 0.2, 1],
                                      delay: 0.4,
                                    }}
                                    className={cn(
                                      textVariants({
                                        size: 'sm',
                                        font: 'ufficio',
                                        transform: 'uppercase',
                                      }),
                                    )}
                                  >
                                    {renderRichText(speaker.socials)}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            ) : (
                              <div
                                className={cn(
                                  textVariants({
                                    size: 'sm',
                                    font: 'ufficio',
                                    transform: 'uppercase',
                                  }),
                                )}
                              >
                                {renderRichText(speaker.socials)}
                              </div>
                            ))}
                        </div>

                        {/* Right side - Bio */}
                        {shouldAnimateText ? (
                          <AnimatePresence mode="wait">
                            {isOpen && (
                              <motion.div
                                key={`bio-${isOpen}`}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{
                                  duration: 0.6,
                                  ease: [0.4, 0, 0.2, 1],
                                  delay: 0.35,
                                }}
                                className={cn(
                                  textVariants({
                                    size: 'sm',
                                    font: 'ufficio',
                                    transform: 'uppercase',
                                  }),
                                  'whitespace-pre-line',
                                )}
                              >
                                {speaker.bio ? (
                                  renderRichText(speaker.bio)
                                ) : (
                                  <p>No bio available.</p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        ) : (
                          <div
                            className={cn(
                              textVariants({
                                size: 'sm',
                                font: 'ufficio',
                                transform: 'uppercase',
                              }),
                              'whitespace-pre-line',
                            )}
                          >
                            {speaker.bio ? renderRichText(speaker.bio) : <p>No bio available.</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
