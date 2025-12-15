'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
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
  const overlayRef = useRef<HTMLDivElement>(null)

  const currentSpeaker = speakers[currentIndex]
  const imageData =
    currentSpeaker && typeof currentSpeaker.image === 'object' && currentSpeaker.image !== null
      ? currentSpeaker.image
      : null
  const imageUrl = imageData?.url

  useEffect(() => {
    if (!isOpen) return

    // Only enable custom cursor on desktop
    const isDesktop = window.innerWidth >= 768

    const handleMouseMove = (e: MouseEvent) => {
      if (!overlayRef.current || !isDesktop) {
        setCursorArea(null)
        return
      }

      // Check if hovering over a link - if so, use default cursor
      const target = e.target as HTMLElement
      if (target.closest('a')) {
        setCursorArea(null)
        return
      }

      const rect = overlayRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width
      const third = width / 3

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
        onPrev()
      } else if (x > third * 2) {
        onNext()
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
  }, [isOpen, onClose, onNext, onPrev])

  const getCursorStyle = () => {
    // Only show custom cursor on desktop
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 'default'
    if (!cursorArea) return 'default'
    switch (cursorArea) {
      case 'left':
        return 'url("/prev.svg") 16 16, auto'
      case 'right':
        return 'url("/next.svg") 16 16, auto'
      case 'center':
        return 'url("/close.svg") 16 16, auto'
      default:
        return 'default'
    }
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
            rotate: 3,
            opacity: 0,
          }}
          animate={{
            y: 0,
            rotate: 0,
            opacity: 1,
          }}
          exit={{
            y: '100%',
            rotate: -3,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed inset-0 z-[10000] overflow-y-auto"
          style={{ backgroundColor: '#E8D5FF', cursor: getCursorStyle() }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-8xl mx-auto px-8 py-10 md:py-12"
            >
              <div className="grid md:grid-cols-2 gap-10 md:gap-20">
                {/* Left side - Images */}
                <div className="space-y-8">
                  {imageUrl && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`image-${currentIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="relative w-full aspect-[3/2]"
                      >
                        <Image
                          src={imageUrl}
                          alt={currentSpeaker.names || 'Speaker'}
                          fill
                          className="object-top object-cover mix-blend-multiply"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </motion.div>
                    </AnimatePresence>
                  )}
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
                  {currentSpeaker.socials && (
                    <div
                      className={cn(
                        textVariants({ size: 'sm', font: 'ufficio', transform: 'uppercase' }),
                      )}
                    >
                      {renderRichText(currentSpeaker.socials)}
                    </div>
                  )}
                </div>

                {/* Right side - Bio */}
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
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
