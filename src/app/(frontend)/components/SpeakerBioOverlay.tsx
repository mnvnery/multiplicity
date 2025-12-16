'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react'
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

export function SpeakerBioOverlay({
  isOpen,
  currentIndex,
  speakers,
  onClose,
  onNext,
  onPrev,
}: SpeakerBioOverlayProps) {
  const [cursorArea, setCursorArea] = useState<'left' | 'center' | 'right' | null>(null)
  const [isOverLink, setIsOverLink] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const prevIsOpenRef = useRef<boolean | null>(null)
  const prevIndexRef = useRef(currentIndex)
  const lastNavigationDirectionRef = useRef<'next' | 'prev'>('next')
  const [shouldAnimateText, setShouldAnimateText] = useState(false)

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

  // Track if we should animate text (only on open/close, not navigation)
  const isNavigating =
    isOpen &&
    prevIsOpenRef.current !== null &&
    prevIsOpenRef.current &&
    prevIndexRef.current !== currentIndex

  // Wrapped callbacks to track navigation direction
  const handleNext = useCallback(() => {
    lastNavigationDirectionRef.current = 'next'
    onNext()
  }, [onNext])

  const handlePrev = useCallback(() => {
    lastNavigationDirectionRef.current = 'prev'
    onPrev()
  }, [onPrev])

  // Determine if we're navigating and use the tracked direction
  const navigationDirection = isNavigating ? lastNavigationDirectionRef.current : 'next'

  useEffect(() => {
    const isOpeningOrClosing = prevIsOpenRef.current !== isOpen

    if (isOpeningOrClosing) {
      // Opening or closing - enable animations
      setShouldAnimateText(true)
    } else if (isOpen && prevIndexRef.current !== currentIndex) {
      // Navigating - disable animations and update index
      setShouldAnimateText(false)
      prevIndexRef.current = currentIndex
    } else if (isOpen) {
      // Already open and not navigating - keep animations disabled
      setShouldAnimateText(false)
    }

    prevIsOpenRef.current = isOpen
  }, [isOpen, currentIndex])

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
      const width = rect.width
      const third = width / 3

      // Still determine cursor area even when over links, so we can show scaled-down cursor
      if (x < third) {
        setCursorArea('left')
      } else if (x > third * 2) {
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
      const width = rect.width
      const third = width / 3

      if (x < third) {
        handlePrev()
      } else if (x > third * 2) {
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
  if (!currentSpeaker) {
    return null
  }

  return (
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
          className="fixed inset-0 z-[10000] overflow-y-auto"
          style={{ backgroundColor: '#BFA9FF', cursor: getCursorStyle() }}
        >
          {/* Mobile Navigation Controls */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-[10001] flex justify-between items-center px-0 pt-2 pb-0 bg-[#BFA9FF]">
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

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{
                opacity: 0,
                x: isNavigating ? (navigationDirection === 'next' ? 100 : -100) : 0,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: isNavigating ? (navigationDirection === 'next' ? -100 : 100) : 0,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-8xl mx-auto px-4 md:px-8 pt-20 md:pt-12 pb-10 md:pb-12"
            >
              <div className="grid md:grid-cols-2 gap-10 md:gap-20">
                {/* Left side - Images */}
                <div className="space-y-8">
                  {imageUrl &&
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
                              src={imageUrl}
                              alt={currentSpeaker.names || 'Speaker'}
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
                          key={currentIndex}
                          src={imageUrl}
                          alt={currentSpeaker.names || 'Speaker'}
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
                          {currentSpeaker.studioName && (
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
                              {currentSpeaker.studioName}
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
                            {currentSpeaker.names}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ) : (
                    isOpen && (
                      <div className="space-y-0">
                        {currentSpeaker.studioName && (
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
                            {currentSpeaker.studioName}
                          </p>
                        )}
                        <p
                          className={cn(
                            textVariants({
                              size: '3xl',
                              font: 'oldman',
                              weight: 'normal',
                            }),
                          )}
                        >
                          {currentSpeaker.names}
                        </p>
                      </div>
                    )
                  )}
                  {currentSpeaker.socials &&
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
                              textVariants({ size: 'sm', font: 'ufficio', transform: 'uppercase' }),
                            )}
                          >
                            {renderRichText(currentSpeaker.socials)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ) : (
                      isOpen && (
                        <div
                          className={cn(
                            textVariants({ size: 'sm', font: 'ufficio', transform: 'uppercase' }),
                          )}
                        >
                          {renderRichText(currentSpeaker.socials)}
                        </div>
                      )
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
                          textVariants({ size: 'sm', font: 'ufficio', transform: 'uppercase' }),
                          'whitespace-pre-line',
                        )}
                      >
                        {currentSpeaker.bio ? (
                          renderRichText(currentSpeaker.bio)
                        ) : (
                          <p>No bio available.</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  isOpen && (
                    <div
                      className={cn(
                        textVariants({ size: 'sm', font: 'ufficio', transform: 'uppercase' }),
                        'whitespace-pre-line',
                      )}
                    >
                      {currentSpeaker.bio ? (
                        renderRichText(currentSpeaker.bio)
                      ) : (
                        <p>No bio available.</p>
                      )}
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
