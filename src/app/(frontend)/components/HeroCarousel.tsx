'use client'

import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect, useCallback, useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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
  const sectionRef = useRef<HTMLDivElement>(null)
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
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasAnimated, setHasAnimated] = useState(false)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  // Parallax scroll effect on page scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Subtle parallax movement as page scrolls
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  // Handle individual image load
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => {
      const newSet = new Set(prev)
      newSet.add(index)
      return newSet
    })
  }, [])

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

  // Trigger initial animation after mount
  useEffect(() => {
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // GSAP mask reveal animation - staggered slides from TOP (mirrors logo from bottom)
  useEffect(() => {
    if (!imagesLoaded || hasAnimated || slideRefs.current.length === 0) return

    const slides = slideRefs.current.filter((ref) => ref !== null)
    if (slides.length === 0) return

    // Sort slides by their x position (left to right)
    const sortedSlides = [...slides].sort((a, b) => {
      const rectA = a.getBoundingClientRect()
      const rectB = b.getBoundingClientRect()
      return rectA.left - rectB.left
    })

    // Set initial state - mask from top for each slide
    gsap.set(sortedSlides, {
      clipPath: 'inset(0% 0% 100% 0%)',
      opacity: 0,
    })

    // Animate reveal with stagger - coordinated with logo timing
    const timeline = gsap.timeline({
      delay: 0.1,
      onComplete: () => setHasAnimated(true),
    })

    timeline.to(sortedSlides, {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out',
    })

    return () => {
      timeline.kill()
    }
  }, [imagesLoaded, hasAnimated])

  // Track when images are ready - start animation when first image loads or after timeout
  useEffect(() => {
    if (emblaApi && !imagesLoaded) {
      // Start animation if first image is loaded
      if (loadedImages.has(0)) {
        setImagesLoaded(true)
        return
      }

      // Fallback: start animation after timeout even if images haven't loaded
      const timer = setTimeout(() => {
        setImagesLoaded(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [emblaApi, imagesLoaded, loadedImages])

  if (!images || images.length === 0) return null

  return (
    <div
      ref={sectionRef}
      className="transition-all duration-[1200ms] ease-out"
      style={{
        width: isInitialLoad ? '100vw' : '100%',
        marginLeft: isInitialLoad ? 'calc(-50vw + 50%)' : '0',
        marginRight: isInitialLoad ? 'calc(-50vw + 50%)' : '0',
      }}
    >
      <div className="relative overflow-hidden" ref={containerRef}>
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

              // Calculate opacity and scale for depth effect
              let opacity = 0.6
              let scale = 0.9
              if (isSelected) {
                opacity = 1.0
                scale = 1.0
              } else if (distance === 1) {
                // Immediate neighbors
                opacity = 0.9
                scale = 0.97
              }

              const imageIsLoaded = loadedImages.has(index)

              return (
                <div
                  key={heroImage.id || index}
                  className="flex-[0_0_85%] md:flex-[0_0_66.666%] min-w-0 px-1 md:px-1"
                  style={
                    {
                      // Show 1/3 of side images, so each slide takes 66.666% width
                      // This allows 33.333% (1/3) of each side image to peek through
                    }
                  }
                >
                  <div
                    ref={(el) => {
                      slideRefs.current[index] = el
                    }}
                    className="relative w-full aspect-[16/9] transition-all duration-300 ease-out overflow-hidden rounded-2xl bg-pink"
                    style={{
                      opacity: hasAnimated ? opacity : 0,
                      transform: `scale(${scale})`,
                    }}
                  >
                    {/* Skeleton loader */}
                    {!imageIsLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 animate-pulse" />
                    )}

                    <motion.div
                      style={{
                        y: parallaxY,
                      }}
                      className="w-full h-full"
                    >
                      <motion.div
                        initial={{ scale: 1.15 }}
                        animate={{ scale: isSelected ? 1.15 : 1.08 }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full h-full"
                      >
                        <Image
                          src={imageUrl}
                          alt={imageAlt}
                          width={1200}
                          height={600}
                          className="w-full h-full object-cover"
                          priority={index === 0}
                          onLoad={() => handleImageLoad(index)}
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
