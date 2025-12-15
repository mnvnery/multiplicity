'use client'

import { ReactLenis, useLenis } from 'lenis/react'
import type { LenisOptions } from 'lenis'
import { useEffect } from 'react'

const lenisOptions: LenisOptions = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  syncTouch: false,
}

function AnchorLinkHandler() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return

    // Handle anchor link clicks with offset for sticky header
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]')

      if (anchor) {
        const href = anchor.getAttribute('href')
        if (href && href !== '#') {
          e.preventDefault()
          const targetId = href.slice(1)
          const targetElement = document.getElementById(targetId)

          if (targetElement) {
            // Calculate position accounting for CSS scroll-margin-top
            const computedStyle = window.getComputedStyle(targetElement)
            const scrollMarginTop = parseInt(computedStyle.scrollMarginTop) || 0

            // Get element position and subtract the scroll margin
            const targetPosition =
              targetElement.getBoundingClientRect().top + window.scrollY - scrollMarginTop

            lenis.scrollTo(targetPosition, {
              duration: 1.2,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            })
          }
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [lenis])

  return null
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={lenisOptions}>
      <AnchorLinkHandler />
      {children}
    </ReactLenis>
  )
}
