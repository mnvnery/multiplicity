'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { gsap, Power4 } from 'gsap'
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
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  // GSAP mask reveal animation
  useEffect(() => {
    if (!menuRef.current) return

    const menu = menuRef.current

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
    } else if (menu.style.clipPath !== 'circle(0% at 100% 0%)') {
      // Closing animation - mask collapse to top right with slight delay for content to fade
      gsap.to(menu, {
        clipPath: 'circle(0% at 100% 0%)',
        duration: 0.7,
        ease: 'power3.inOut',
        delay: 0.15,
      })
    }
  }, [isOpen])

  return (
    <>
      {/* Animated Hamburger Button - Mobile Only */}
      <button
        onClick={toggleMenu}
        className={cn(
          'group md:hidden hover:opacity-70 transition-opacity',
          isOpen ? 'fixed top-5 right-5 z-[60] text-yellow' : 'relative text-black',
        )}
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
            className="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
          />
          <path
            d="M4 12H20"
            className="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
          />
          <path
            d="M4 12H20"
            className="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
          />
        </svg>
      </button>

      {/* Mobile Menu Overlay with Animation */}
      <AnimatePresence>
        {isOpen && (
          <div
            ref={menuRef}
            className="fixed inset-0 z-50 bg-black md:hidden"
            style={{
              clipPath: 'circle(0% at 100% 0%)',
            }}
          >
            {/* Navigation Links with Stagger Animation */}
            <motion.div
              className="flex flex-col items-left justify-start mt-10 h-[calc(100vh-120px)] p-3 gap-0.5"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  transition: { staggerChildren: 0.12, delayChildren: 0.15 },
                },
                closed: {
                  transition: { staggerChildren: 0.05, staggerDirection: -1 },
                },
              }}
            >
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    textVariants({ size: '8xl', font: 'oldman', weight: 'bold', leading: 'none' }),
                    'text-yellow hover:opacity-70 transition-opacity',
                  )}
                  variants={{
                    closed: { opacity: 0, y: -20 },
                    open: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: Power4.easeInOut }}
                >
                  {item.label}
                </motion.a>
              ))}

              {/* Buy Tickets Button */}
              {ticketUrl && (
                <motion.a
                  href={ticketUrl}
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ variant: 'primary', size: 'lg', width: 'auto' }),
                    'mt-4 !outline-none !ring-0 !border-0',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={{
                    closed: { opacity: 0, y: -20 },
                    open: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: Power4.easeInOut }}
                >
                  BUY TICKETS
                </motion.a>
              )}
            </motion.div>

            {/* Branding at Bottom with Animation */}
            <motion.div
              className="absolute bottom-5 left-5 right-5 flex justify-between items-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                delay: 0.15 + (navItems.length + (ticketUrl ? 1 : 0)) * 0.12,
                duration: 0.5,
                ease: Power4.easeInOut,
              }}
            >
              <Image
                src="/foilco-multiplicity-yellow.svg"
                alt="Multiplicity"
                width={70}
                height={70}
              />
              <div
                className={cn(
                  textVariants({ size: '4xl', font: 'oldman', weight: 'bold', leading: 'none' }),
                  'text-yellow',
                )}
              >
                Multiplicity
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
