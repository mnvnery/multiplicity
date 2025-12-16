'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { textVariants, cn, buttonVariants } from '../lib/variants'
import Image from 'next/image'
import { SofterButton } from './SofterButton'

interface FooterProps {
  socialLinks?: {
    instagram?: string | null
    linkedin?: string | null
  }
  name?: string | null
  email?: string | null
}

export function Footer({ socialLinks, name, email }: FooterProps) {
  const mailingRef = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  // Scroll-triggered animations for mailing section
  const { scrollYProgress: mailingProgress } = useScroll({
    target: mailingRef,
    offset: ['start 0.8', 'start 0.3'],
  })

  const mailingOpacity = useTransform(mailingProgress, [0, 0.5], [0, 1])
  const mailingY = useTransform(mailingProgress, [0, 0.5], [50, 0])

  // Scroll-triggered animations for footer
  const { scrollYProgress: footerProgress } = useScroll({
    target: footerRef,
    offset: ['start 0.8', 'start 0.3'],
  })

  const footerOpacity = useTransform(footerProgress, [0, 0.5], [0, 1])
  const footerY = useTransform(footerProgress, [0, 0.5], [30, 0])

  return (
    <>
      {/* Mailing List Section */}
      <section ref={mailingRef} className="bg-black text-white px-3 md:px-5 py-16 md:py-32">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          style={{
            opacity: mailingOpacity,
            y: mailingY,
          }}
        >
          <h2
            className={cn(
              textVariants({
                size: '3xl',
                font: 'oldman',
                leading: 'tight',
              }),
              'mb-10',
            )}
          >
            Join our Mailing List and be the first to
            <br />
            know about upcoming events
          </h2>
          <form className="flex flex-col gap-4 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="JOHN SMITH"
              className={cn(
                'bg-black border-3 border-white text-white px-4 py-3',
                textVariants({ size: 'base', font: 'ufficio', transform: 'uppercase' }),
                'placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white',
              )}
            />
            <input
              type="email"
              placeholder="YOUR@EMAILADDRESS.COM"
              className={cn(
                'bg-black border-3 border-white text-white px-4 py-3',
                textVariants({ size: 'base', font: 'ufficio', transform: 'uppercase' }),
                'placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white',
              )}
            />
            <SofterButton
              type="submit"
              className={cn(
                'bg-white text-black border border-white px-4 py-3',
                buttonVariants({
                  size: 'xl',
                  variant: 'primary',
                }),
                '!fl-py-2/1.5 hover:opacity-90 transition-opacity',
              )}
            >
              SUBMIT
            </SofterButton>
          </form>
        </motion.div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} id="contact" className="bg-black text-white px-3 md:px-5">
        <motion.div
          className="max-w-8xl mx-auto border-t-2 py-8 md:py-16 border-white grid grid-cols-1 md:grid-cols-[1.5fr_1fr_2fr] gap-12"
          style={{
            opacity: footerOpacity,
            y: footerY,
          }}
        >
          {/* Left Column - Company Information */}
          <div
            className={cn(
              textVariants({ size: 'xs', font: 'ufficio', transform: 'uppercase' }),
              'leading-relaxed',
            )}
          >
            <div>
              <div className="flex items-stretch gap-5">
                <div className="flex-shrink-0 h-full">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="cursor-pointer hover:sepia transition-opacity"
                  >
                    <Image
                      src="/foilco-multiplicity.svg"
                      alt="FoilcoMultiplicity Logo"
                      width={76}
                      height={148}
                      className="min-h-[20.5vh] md:min-h-[23vh] w-auto object-contain"
                    />
                  </a>
                </div>
                <div className="flex-1">
                  <p>FOILCO LIMITED</p>
                  <p>ENTERPRISE WAY</p>
                  <p>LOWTON ST MARY&apos;S</p>
                  <p>WARRINGTON, CHESHIRE</p>
                  <p>WA3 2BP</p>
                  <p>UNITED KINGDOM</p>
                  <div className="flex flex-col gap-1 mt-4">
                    <p>+44 (0) 1942 262622</p>
                    <a
                      href="mailto:HELLO@FOILCO.CO.UK"
                      className="underline hover:text-yellow transition-opacity"
                    >
                      HELLO@FOILCO.CO.UK
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Social Media Links */}
          <div
            className={cn(
              textVariants({ size: 'xs', font: 'ufficio', transform: 'uppercase' }),
              'leading-relaxed flex flex-col gap-2',
            )}
          >
            {socialLinks?.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow transition-opacity"
              >
                FOLLOW US ON INSTAGRAM
              </a>
            )}
            {socialLinks?.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow transition-opacity"
              >
                FIND US ON LINKEDIN
              </a>
            )}
          </div>

          {/* Right Column - Speaking/Sponsorship Contact */}
          <div
            className={cn(
              textVariants({ size: 'xs', font: 'ufficio', transform: 'uppercase' }),
              'leading-relaxed flex flex-col h-full justify-between gap-4',
            )}
          >
            <div className="flex flex-col gap-1">
              <p className="text-pretty">
                {`FOR SPEAKING AND SPONSORSHIP, TO HOST AN EVENT, OR FOR ANYTHING ELSE, CONTACT ${name} FOR DETAILS`}
              </p>
              <a
                href={`mailto:${email}`}
                className="underline hover:text-yellow transition-opacity"
              >
                {email}
              </a>
            </div>
            <div
              className={cn(
                textVariants({ size: 'xs', font: 'ufficio', transform: 'uppercase' }),
                'flex flex-col md:flex-row  gap-8',
              )}
            >
              <a
                href="https://studiodbd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow transition-opacity"
              >
                ©FOILCO LIMITED 2025
              </a>
              <p>
                DESIGNED BY{' '}
                <a
                  href="https://studiodbd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow transition-opacity"
                >
                  STUDIODBD
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </footer>
    </>
  )
}
