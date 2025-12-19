'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePathname } from 'next/navigation'
import { useLenis } from 'lenis/react'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Custom debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    // Refresh ScrollTrigger on route change
    ScrollTrigger.refresh()
  }, [pathname])

  useEffect(() => {
    // Set default GSAP settings for smooth, performant animations
    gsap.defaults({
      ease: 'power2.out',
      duration: 0.8,
    })

    // Configure ScrollTrigger
    ScrollTrigger.defaults({
      markers: false,
    })

    // Only integrate if Lenis is available
    if (!lenis) {
      ScrollTrigger.refresh()
      return
    }

    // Sync Lenis scroll with ScrollTrigger
    // ReactLenis already handles RAF internally, we just need to update ScrollTrigger
    const unsubscribe = lenis.on('scroll', ScrollTrigger.update)

    // Disable lag smoothing for smoother integration
    gsap.ticker.lagSmoothing(0)

    // Give Lenis a moment to initialize, then refresh ScrollTrigger
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 200)

    // Refresh on window resize with debounce
    const handleResize = debounce(() => {
      ScrollTrigger.refresh()
    }, 300)

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      if (unsubscribe) unsubscribe()
      // Clean up all ScrollTriggers on unmount
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [lenis])

  return <>{children}</>
}
