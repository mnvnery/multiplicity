'use client'

import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect } from 'react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { textVariants, cn } from '../lib/variants'

interface PastEvent {
  id: string | number
  title: string
  date: string
  images?: Array<{
    image?:
      | number
      | {
          url?: string | null
        }
      | null
    aspectRatio?: 'portrait' | 'landscape' | 'square' | null
  } | null> | null
  speakers?: Array<{
    names?: string | null
    studioName?: string | null
  } | null> | null
}

interface PastEventsCarouselProps {
  events: any[] // Using any to match Payload's Event type structure
}

export function PastEventsCarousel({ events }: PastEventsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      dragFree: true,
      skipSnaps: true,
    },
    [
      AutoScroll({
        speed: 1,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
        playOnInit: true,
      }),
    ],
  )

  // Wait for images to decode before starting auto-scroll
  useEffect(() => {
    if (!emblaApi) return

    const autoScroll = emblaApi.plugins().autoScroll as ReturnType<typeof AutoScroll> | undefined
    if (!autoScroll) return

    const emblaNode = emblaApi.rootNode()
    if (!emblaNode) return

    const imgs = Array.from(emblaNode.querySelectorAll('img'))

    const start = async () => {
      // Wait for decode where possible to prevent late paint shifts
      await Promise.all(
        imgs.map(async (img) => {
          try {
            // If already loaded, decode still helps prevent late paint shifts
            if ('decode' in img) {
              await (img as HTMLImageElement).decode()
            }
          } catch {
            // Ignore decode errors
          }
        }),
      )

      // Reinitialize to recalculate dimensions after images are decoded
      emblaApi.reInit()

      // Start auto-scroll if not already playing
      if (!autoScroll.isPlaying()) {
        autoScroll.play()
      }
    }

    start()
  }, [emblaApi])

  // Resume auto-scroll when mouse leaves the carousel
  useEffect(() => {
    if (!emblaApi) return

    const autoScroll = emblaApi.plugins().autoScroll as ReturnType<typeof AutoScroll> | undefined
    if (!autoScroll) return

    const resumeAutoScroll = () => {
      if (autoScroll && !autoScroll.isPlaying()) {
        autoScroll.play()
      }
    }

    const emblaNode = emblaApi.rootNode()
    if (emblaNode) {
      emblaNode.addEventListener('mouseleave', resumeAutoScroll)
    }

    return () => {
      if (emblaNode) {
        emblaNode.removeEventListener('mouseleave', resumeAutoScroll)
      }
    }
  }, [emblaApi])

  // Map aspect ratio preset to Tailwind classes
  const aspectRatioClasses = {
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    square: 'aspect-square',
  }

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex items-end gap-0 touch-pan-y cursor-grab active:cursor-grabbing">
        {events.map((event, index) => {
          const firstImage = event.images && event.images.length > 0 ? event.images[0] : null
          const aspectRatio = firstImage?.aspectRatio || 'landscape'

          return (
            <div
              key={`${event.id}-${index}`}
              className="pl-4 overflow-hidden flex flex-col flex-[0_0_auto] shrink-0 basis-[400px]"
            >
              {/* Image section at bottom */}
              {firstImage?.image &&
                typeof firstImage.image === 'object' &&
                firstImage.image?.url && (
                  <div
                    className={`${aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses] || aspectRatioClasses.landscape} overflow-hidden`}
                  >
                    <Image
                      src={firstImage.image.url}
                      alt={event.title}
                      width={400}
                      height={300}
                      sizes="(min-width: 1024px) 340px, (min-width: 640px) 300px, 260px"
                      className="w-full h-full object-cover"
                      priority={index < 2}
                    />
                  </div>
                )}

              {/* Text section at top */}
              <div className="py-3 flex flex-col h-[280px]">
                <div className="flex justify-start items-center gap-1 mb-3">
                  <h3
                    className={cn(
                      textVariants({
                        size: '2xl',
                        font: 'oldman',
                        transform: 'uppercase',
                        weight: 'bold',
                        leading: 'none',
                      }),
                      'mb-2',
                    )}
                  >
                    {event.title}
                  </h3>
                  <div
                    className={cn(
                      textVariants({
                        size: '2xl',
                        font: 'oldman',
                        transform: 'uppercase',
                        weight: 'normal',
                        leading: 'none',
                      }),
                      'mb-2',
                    )}
                  >
                    {new Date(event.date)
                      .toLocaleDateString('en-US', {
                        year: 'numeric',
                      })
                      .toUpperCase()}
                  </div>
                </div>
                <div
                  className={cn(
                    textVariants({
                      size: 'base',
                      font: 'ufficio',
                      transform: 'uppercase',
                      weight: 'normal',
                      leading: 'none',
                    }),
                    'flex flex-col',
                  )}
                >
                  {event.speakers && event.speakers.length > 0 ? (
                    <>
                      {event.speakers.map((speaker: any, idx: number) => (
                        <p key={idx} className="py-3 border-b border-dashed border-black">
                          {speaker?.names} {speaker?.studioName && `/ ${speaker.studioName}`}
                        </p>
                      ))}
                      {/* Add empty space for events with fewer than 4 speakers */}
                      {Array.from({ length: Math.max(0, 4 - event.speakers.length) }).map(
                        (_, idx) => (
                          <p
                            key={`spacer-${idx}`}
                            className="py-3 border-b border-dashed border-transparent"
                          >
                            &nbsp;
                          </p>
                        ),
                      )}
                    </>
                  ) : (
                    // Empty space for events without speakers
                    Array.from({ length: 4 }).map((_, idx) => (
                      <p
                        key={`spacer-${idx}`}
                        className="py-3 border-b border-dashed border-transparent"
                      >
                        &nbsp;
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
