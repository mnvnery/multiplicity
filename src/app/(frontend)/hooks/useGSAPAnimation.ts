'use client'

import { useEffect, useRef, RefObject, MutableRefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Hook for creating masked reveal animations
 */
export function useMaskedReveal(
  ref: RefObject<HTMLElement>,
  options: {
    duration?: number
    delay?: number
    direction?: 'up' | 'down' | 'left' | 'right'
    stagger?: number
    trigger?: RefObject<HTMLElement>
  } = {},
) {
  useEffect(() => {
    if (!ref.current) return

    const { duration = 1.2, delay = 0, direction = 'up', stagger = 0, trigger = ref } = options

    const element = ref.current
    const triggerElement = trigger.current || element

    // Set initial state based on direction
    const initialState: any = { opacity: 0 }
    const animateTo: any = { opacity: 1 }

    switch (direction) {
      case 'up':
        initialState.y = 100
        initialState.clipPath = 'inset(100% 0% 0% 0%)'
        animateTo.y = 0
        animateTo.clipPath = 'inset(0% 0% 0% 0%)'
        break
      case 'down':
        initialState.y = -100
        initialState.clipPath = 'inset(0% 0% 100% 0%)'
        animateTo.y = 0
        animateTo.clipPath = 'inset(0% 0% 0% 0%)'
        break
      case 'left':
        initialState.x = 100
        initialState.clipPath = 'inset(0% 0% 0% 100%)'
        animateTo.x = 0
        animateTo.clipPath = 'inset(0% 0% 0% 0%)'
        break
      case 'right':
        initialState.x = -100
        initialState.clipPath = 'inset(0% 100% 0% 0%)'
        animateTo.x = 0
        animateTo.clipPath = 'inset(0% 0% 0% 0%)'
        break
    }

    gsap.set(element, initialState)

    const animation = gsap.to(element, {
      ...animateTo,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: triggerElement,
        start: 'top 85%',
        end: 'top 20%',
        toggleActions: 'play none none none',
      },
    })

    return () => {
      animation.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === triggerElement) {
          st.kill()
        }
      })
    }
  }, [ref, options.duration, options.delay, options.direction, options.stagger])
}

/**
 * Hook for scroll-triggered fade-in with scale
 */
export function useScrollFadeIn(
  ref: RefObject<HTMLElement>,
  options: {
    duration?: number
    delay?: number
    y?: number
    scale?: number
    stagger?: number
  } = {},
) {
  useEffect(() => {
    if (!ref.current) return

    const { duration = 1, delay = 0, y = 50, scale = 0.95, stagger = 0 } = options
    const element = ref.current

    gsap.set(element, {
      opacity: 0,
      y,
      scale,
    })

    const animation = gsap.to(element, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })

    return () => {
      animation.kill()
    }
  }, [ref, options.duration, options.delay, options.y, options.scale])
}

/**
 * Hook for creating magnetic button effect
 */
export function useMagneticEffect(
  ref: RefObject<HTMLElement>,
  options: { strength?: number; speed?: number } = {},
) {
  const { strength = 0.3, speed = 0.3 } = options
  const animationRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const bounds = element.getBoundingClientRect()

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const centerX = bounds.left + bounds.width / 2
      const centerY = bounds.top + bounds.height / 2
      const deltaX = (clientX - centerX) * strength
      const deltaY = (clientY - centerY) * strength

      if (animationRef.current) {
        animationRef.current.kill()
      }

      animationRef.current = gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: speed,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }

      animationRef.current = gsap.to(element, {
        x: 0,
        y: 0,
        duration: speed,
        ease: 'elastic.out(1, 0.3)',
      })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [ref, strength, speed])
}

/**
 * Hook for parallax effect on scroll
 */
export function useParallax(
  ref: RefObject<HTMLElement>,
  options: { speed?: number; direction?: 'vertical' | 'horizontal' } = {},
) {
  useEffect(() => {
    if (!ref.current) return

    const { speed = 0.5, direction = 'vertical' } = options
    const element = ref.current

    const animation = gsap.to(element, {
      [direction === 'vertical' ? 'y' : 'x']: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    })

    return () => {
      animation.kill()
    }
  }, [ref, options.speed, options.direction])
}

/**
 * Hook for split text reveal animation (character by character)
 */
export function useSplitTextReveal(
  ref: RefObject<HTMLElement>,
  options: { duration?: number; stagger?: number; delay?: number } = {},
) {
  useEffect(() => {
    if (!ref.current) return

    const { duration = 0.8, stagger = 0.03, delay = 0 } = options
    const element = ref.current
    const text = element.textContent || ''

    // Split text into characters
    const chars = text.split('').map((char) => {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char
      span.style.display = 'inline-block'
      span.style.opacity = '0'
      span.style.transform = 'translateY(20px)'
      return span
    })

    element.textContent = ''
    chars.forEach((char) => element.appendChild(char))

    const animation = gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    return () => {
      animation.kill()
      element.textContent = text
    }
  }, [ref, options.duration, options.stagger, options.delay])
}

/**
 * Hook for image scale on scroll
 */
export function useImageScale(
  ref: RefObject<HTMLElement>,
  options: { scale?: number; duration?: number } = {},
) {
  useEffect(() => {
    if (!ref.current) return

    const { scale = 1.2, duration = 1 } = options
    const element = ref.current

    gsap.set(element, { scale })

    const animation = gsap.to(element, {
      scale: 1,
      duration,
      ease: 'none',
      scrollTrigger: {
        trigger: element.parentElement || element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    })

    return () => {
      animation.kill()
    }
  }, [ref, options.scale, options.duration])
}
