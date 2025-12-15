'use client'

import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect, useCallback, useState, useRef } from 'react'

interface HeroImage {
  image:
    | number
    | {
        url?: string | null
        alt?: string | null
      }
  id?: string | null
}

interface HeroCarouselProps {
  images: HeroImage[]
}

export function HeroCarousel({ images }: HeroCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      slidesToScroll: 1,
      skipSnaps: false,
      dragFree: false,
    },
    [],
  )

  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  // Custom scroll function with controllable animation duration
  const scrollToWithDuration = useCallback(
    (targetIndex: number, duration: number = 800) => {
      if (!emblaApi || !containerRef.current) {
        emblaApi?.scrollTo(targetIndex)
        return
      }

      const scrollContainer =
        containerRef.current.querySelector('div[style*="overflow"]') ||
        (containerRef.current.firstElementChild as HTMLElement)

      if (!scrollContainer) {
        emblaApi.scrollTo(targetIndex)
        return
      }

      const startScroll = scrollContainer.scrollLeft
      const startTime = performance.now()

      // Scroll immediately to target to measure target position, then animate
      emblaApi.scrollTo(targetIndex)
      const targetScroll = scrollContainer.scrollLeft

      // Reset and animate
      scrollContainer.scrollLeft = startScroll

      // Animate
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-in-out)
        const ease =
          progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

        scrollContainer.scrollLeft = startScroll + (targetScroll - startScroll) * ease

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

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (emblaApi) {
      // Optional: Auto-advance (you can remove this if not needed)
      const interval = setInterval(() => {
        if (emblaApi) {
          const nextIndex = (emblaApi.selectedScrollSnap() + 1) % images.length
          scrollToWithDuration(nextIndex, 800) // duration: 800ms (adjust for speed - higher = slower)
        }
      }, 8000)

      return () => clearInterval(interval)
    }
  }, [emblaApi, images.length, scrollToWithDuration])

  if (!images || images.length === 0) return null

  return (
    <div className="relative rounded-xl overflow-hidden" ref={containerRef}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y cursor-grab active:cursor-grabbing">
          {images.map((heroImage, index) => {
            // Handle case where image might be an ID or a full Media object
            const imageData =
              typeof heroImage.image === 'object' && heroImage.image !== null
                ? heroImage.image
                : null

            const imageUrl = imageData?.url || ''
            const imageAlt = imageData?.alt || 'Hero image'

            if (!imageUrl) return null

            const isSelected = selectedIndex === index

            // Calculate distance accounting for infinite loop
            let distance = Math.abs(selectedIndex - index)
            const wrappedDistance = images.length - distance
            distance = Math.min(distance, wrappedDistance)

            // Calculate scale: center (selected) = 1.0, immediate neighbors = 0.75, others = 0.65
            let scale = 0.65
            let opacity = 0.6
            if (isSelected) {
              scale = 1.0
              opacity = 1.0
            } else if (distance === 1) {
              // Immediate neighbors
              scale = 0.9
              opacity = 0.8
            }

            return (
              <div
                key={heroImage.id || index}
                className="flex-[0_0_66.666%] min-w-0 pl-4"
                style={
                  {
                    // Show 1/3 of side images, so each slide takes 66.666% width
                    // This allows 33.333% (1/3) of each side image to peek through
                  }
                }
              >
                <div
                  className="relative w-full aspect-[16/9] transition-all duration-300 ease-out"
                  style={{
                    transform: `scaleY(${scale})`,
                    opacity: opacity,
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    width={1200}
                    height={600}
                    className="w-full h-full object-cover rounded-lg"
                    priority={index === 0}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
