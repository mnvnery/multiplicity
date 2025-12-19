'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { textVariants, buttonVariants, cn } from '../lib/variants'
import Image from 'next/image'
interface MobileMenuProps {
  socialLinks?: {
    instagram?: string | null
    linkedin?: string | null
  }
  ticketUrl?: string | null
}

const navItems = [
  { href: '#next-event', label: 'Next' },
  { href: '#past-events', label: 'Past' },
  { href: '#contact', label: 'Contact' },
]

export function MobileMenu({ socialLinks, ticketUrl }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<HTMLDivElement>(null)
  const brandingRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    if (isOpen) {
      // Start closing
      setIsOpen(false)
    } else {
      // Start opening
      setShouldRender(true)
      setIsOpen(true)
    }
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  // Track client-side mounting for portal
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position and lock scroll
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      // Restore scroll
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  // GSAP mask reveal and content stagger animations
  useEffect(() => {
    if (!menuRef.current || !navItemsRef.current) return

    const menu = menuRef.current
    const navContainer = navItemsRef.current
    const navLinks = navContainer.querySelectorAll('a')
    const branding = brandingRef.current

    if (isOpen) {
      // Opening animation - mask reveal from center
      gsap.set(menu, {
        clipPath: 'circle(0% at 100% 0%)',
        opacity: 1,
      })

      gsap.to(menu, {
        clipPath: 'circle(150% at 100% 0%)',
        duration: 0.8,
        ease: 'power3.inOut',
      })

      // Stagger animation for nav items - soft and subtle
      gsap.set(navLinks, {
        opacity: 0,
        y: 20,
      })

      gsap.to(navLinks, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08, // Subtle stagger delay between items
        ease: 'power2.out',
        delay: 0.3, // Start after mask begins revealing
      })

      // Branding animation
      if (branding) {
        gsap.set(branding, {
          opacity: 0,
          y: 20,
        })

        gsap.to(branding, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.5, // Slightly after nav items start
        })
      }
    } else if (shouldRender) {
      // Fade out content first
      gsap.to([navLinks, branding], {
        opacity: 0,
        y: -10,
        duration: 0.3,
        stagger: -0.03, // Reverse stagger for closing
        ease: 'power2.in',
      })

      // Then close the mask
      gsap.to(menu, {
        clipPath: 'circle(0% at 100% 0%)',
        duration: 0.7,
        ease: 'power3.inOut',
        delay: 0.2, // Wait for content to fade
        onComplete: () => {
          // Remove from DOM after animation completes
          setShouldRender(false)
        },
      })
    }
  }, [isOpen, shouldRender])

  return (
    <>
      {/* Animated Hamburger Button - Mobile Only */}
      <button
        onClick={toggleMenu}
        className={cn(
          'group md:hidden hover:opacity-70 transition-all duration-300 relative z-[1001]',
          isOpen ? 'text-yellow' : 'text-black',
        )}
        data-open={isOpen}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <svg
          className="pointer-events-none w-9 h-9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 12L20 12"
            className={cn(
              'origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)]',
              isOpen ? 'translate-x-0 translate-y-0 rotate-[315deg]' : '-translate-y-[7px]',
            )}
          />
          <path
            d="M4 12H20"
            className={cn(
              'origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)]',
              isOpen ? 'rotate-45' : '',
            )}
          />
          <path
            d="M4 12H20"
            className={cn(
              'origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)]',
              isOpen ? 'translate-y-0 rotate-[135deg]' : 'translate-y-[7px]',
            )}
          />
        </svg>
      </button>

      {/* Mobile Menu Overlay with Animation - Rendered via Portal */}
      {isMounted &&
        shouldRender &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed inset-0 z-[1000] bg-black md:hidden w-full h-full"
            style={{
              clipPath: 'circle(0% at 100% 0%)',
            }}
          >
            {/* Close Button - Top Right */}
            <button
              onClick={closeMenu}
              className="absolute top-5 right-2.5 z-10 text-yellow hover:opacity-70 transition-opacity"
              aria-label="Close menu"
            >
              <svg
                className="w-9 h-9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Links with GSAP Stagger */}
            <div
              ref={navItemsRef}
              className="relative flex flex-col items-left justify-start mt-10 h-[calc(100vh-120px)] p-3 gap-0.5"
            >
              {navItems.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    textVariants({
                      size: '8xl',
                      font: 'oldman',
                      weight: 'bold',
                      leading: 'none',
                    }),
                    'text-yellow',
                  )}
                >
                  {item.label}
                </a>
              ))}

              {/* Buy Tickets Button */}
              {ticketUrl && (
                <a
                  href={ticketUrl}
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ variant: 'primary', size: 'lg', width: 'auto' }),
                    'mt-4 !outline-none !ring-0 !border-0',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  BUY TICKETS
                </a>
              )}
            </div>

            {/* Branding at Bottom with GSAP Animation */}
            <div
              ref={brandingRef}
              className="absolute bottom-5 left-5 right-5 flex justify-between items-end"
            >
              <Image
                src="/foilco-multiplicity-yellow.svg"
                alt="Multiplicity"
                width={70}
                height={70}
              />
              <div
                className={cn(
                  textVariants({
                    size: '4xl',
                    font: 'oldman',
                    weight: 'bold',
                    leading: 'none',
                  }),
                  'text-yellow',
                )}
              >
                Multiplicity
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
