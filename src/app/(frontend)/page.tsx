import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import './styles.css'
import Image from 'next/image'
import { HeroCarousel } from './components/HeroCarousel'
import { MobileMenu } from './components/MobileMenu'
import { Footer } from './components/Footer'
import { PastEventsCarousel } from './components/PastEventsCarousel'
import { PastEventsSection } from './components/PastEventsSection'
import { NextEventSection } from './components/NextEventSection'
import { AboutSection } from './components/AboutSection'
import { RevealText } from './components/RevealText'
import { SofterButton } from './components/SofterButton'
import { CustomCursor } from './components/CustomCursor'
import { AnimatedHeader } from './components/AnimatedHeader'
import { AiFillInstagram, AiFillLinkedin } from 'react-icons/ai'
import { textVariants, buttonVariants, cn } from './lib/variants'

// Force dynamic rendering to avoid database access during build
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch site settings
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
  })

  // Fetch next upcoming event
  const upcomingEvents = await payload.find({
    collection: 'events',
    where: {
      status: {
        equals: 'upcoming',
      },
    },
    sort: 'date',
    limit: 1,
    depth: 2, // Populate speaker images
  })

  // Fetch past events
  const pastEvents = await payload.find({
    collection: 'events',
    where: {
      status: {
        equals: 'past',
      },
    },
    sort: '-date',
    limit: 20,
  })

  const nextEvent = upcomingEvents.docs[0]

  return (
    <div className="min-h-screen bg-yellow text-black">
      <CustomCursor />
      {/* Header */}
      <AnimatedHeader className="sticky top-0 z-[10000] bg-yellow md:bg-transparent md:relative flex justify-between items-center px-2.5 md:px-5 py-5">
        {/* Social Icons - Mobile Left */}
        <div className="flex gap-4 md:hidden">
          {siteSettings?.socialLinks?.instagram && (
            <a
              href={siteSettings.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                textVariants({ size: '2xl' }),
                'hover:opacity-70 hover:scale-110 transition-all duration-300',
              )}
            >
              <AiFillInstagram />
            </a>
          )}
          {siteSettings?.socialLinks?.linkedin && (
            <a
              href={siteSettings.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                textVariants({ size: '2xl' }),
                'hover:opacity-70 hover:scale-110 transition-all duration-300',
              )}
            >
              <AiFillLinkedin />
            </a>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav
          className={cn(
            textVariants({ size: 'xl', font: 'ufficio', transform: 'uppercase' }),
            'hidden md:flex items-center gap-2.5',
          )}
        >
          <a
            href="#next-event"
            className="hover:underline transition-all duration-300 hover:opacity-70"
          >
            NEXT EVENT
          </a>
          <span>/</span>
          <a
            href="#past-events"
            className="hover:underline transition-all duration-300 hover:opacity-70"
          >
            PAST EVENTS
          </a>
          <span>/</span>
          <a
            href="#contact"
            className="hover:underline transition-all duration-300 hover:opacity-70"
          >
            CONTACT
          </a>
        </nav>

        {/* Desktop Right Side - Social Icons + Button */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex gap-4">
            {siteSettings?.socialLinks?.instagram && (
              <a
                href={siteSettings.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  textVariants({ size: '2xl' }),
                  'hover:opacity-70 hover:scale-110 transition-all duration-300',
                )}
              >
                <AiFillInstagram />
              </a>
            )}
            {siteSettings?.socialLinks?.linkedin && (
              <a
                href={siteSettings.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  textVariants({ size: '2xl' }),
                  'hover:opacity-70 hover:scale-110 transition-all duration-300',
                )}
              >
                <AiFillLinkedin />
              </a>
            )}
          </div>
          {nextEvent?.ticketUrl && (
            <SofterButton
              as="a"
              href={nextEvent.ticketUrl}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
              target="_blank"
              rel="noopener noreferrer"
            >
              BUY TICKETS
            </SofterButton>
          )}
        </div>

        {/* Mobile Menu - Hamburger Button */}
        <MobileMenu
          socialLinks={
            siteSettings?.socialLinks
              ? {
                  instagram: siteSettings.socialLinks.instagram || undefined,
                  linkedin: siteSettings.socialLinks.linkedin || undefined,
                }
              : undefined
          }
          ticketUrl={nextEvent?.ticketUrl || undefined}
        />
      </AnimatedHeader>

      {/* Logo */}
      <div className="max-w-8xl mx-auto px-2.5 md:px-5 mb-14 md:mb-24">
        <RevealText animation="mask" className="text-center mx-auto mt-10 md:mt-16">
          <Image
            src="/Multiplicity_Logo.svg"
            alt="Multiplicity Logo"
            width={1392}
            height={322}
            className="w-full h-auto"
          />
        </RevealText>
        {/* Next event + brought to you by */}
        <div className="flex flex-col lg:flex-row justify-start lg:justify-between items-start lg:items-center gap-2 mt-5 lg:-mt-[2.5%] lg:mr-[10.5%]">
          <RevealText delay={0.1} className="text-center">
            <p
              className={cn(
                textVariants({ size: 'base', font: 'ufficio', transform: 'uppercase' }),
                'text-left',
              )}
            >
              Next Event:
              <br className="md:hidden" />
              <a href={`#next-event`} className="hover:underline md:ml-2">
                {nextEvent?.title}&nbsp;
                {(() => {
                  const date = new Date(nextEvent.date)
                  const month = date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()
                  const day = date.getDate()
                  const year = date.getFullYear()

                  // Add ordinal suffix to day
                  const getOrdinal = (n: number) => {
                    const s = ['TH', 'ST', 'ND', 'RD']
                    const v = n % 100
                    return n + (s[(v - 20) % 10] || s[v] || s[0])
                  }

                  return (
                    <>
                      {month} {getOrdinal(day)} {year}
                    </>
                  )
                })()}
              </a>
            </p>
          </RevealText>
          <RevealText delay={0.2} className="text-center">
            <p
              className={cn(
                textVariants({ size: 'base', font: 'ufficio', transform: 'uppercase' }),
                'flex items-center justify-center',
              )}
            >
              <Image
                src="/foilco.svg"
                alt="FOILCO Logo"
                width={100}
                height={100}
                className="w-8 h-8 inline-block mr-3"
              />
              <span className="mt-1">Brought to you by FOILCO</span>
            </p>
          </RevealText>
        </div>
      </div>

      {/* Hero Image Carousel */}
      {siteSettings?.heroImages && siteSettings.heroImages.length > 0 && (
        <div className="mx-auto mb-16">
          <HeroCarousel images={siteSettings.heroImages} />
        </div>
      )}

      {/* About Section */}
      {siteSettings?.aboutParagraphs && siteSettings.aboutParagraphs.length > 0 && (
        <AboutSection paragraphs={siteSettings.aboutParagraphs} />
      )}

      {/* Next Event Section */}
      {nextEvent && <NextEventSection nextEvent={nextEvent} />}
      {/* Past Events Section */}
      {pastEvents.docs.length > 0 && (
        <PastEventsSection>
          <PastEventsCarousel events={[...pastEvents.docs, ...pastEvents.docs]} />
        </PastEventsSection>
      )}
      {/* Footer */}
      <Footer
        socialLinks={
          siteSettings?.socialLinks
            ? {
                instagram: siteSettings.socialLinks.instagram || undefined,
                linkedin: siteSettings.socialLinks.linkedin || undefined,
              }
            : undefined
        }
        name={siteSettings?.footer?.name || 'Sam'}
        email={siteSettings?.footer?.email || 'sam.williams@foilco.com'}
      />
    </div>
  )
}
