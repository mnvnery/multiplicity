import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import './styles.css'
import Image from 'next/image'
import { HeroCarousel } from './components/HeroCarousel'
import { MobileMenu } from './components/MobileMenu'
import { Footer } from './components/Footer'
import { PastEventsCarousel } from './components/PastEventsCarousel'
import { NextEventSection } from './components/NextEventSection'
import { AiFillInstagram, AiFillLinkedin } from 'react-icons/ai'
import { textVariants, buttonVariants, cn } from './lib/variants'

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
      {/* Header */}
      <header className="flex justify-between items-center px-5 py-5">
        {/* Social Icons - Mobile Left */}
        <div className="flex gap-4 md:hidden">
          {siteSettings?.socialLinks?.instagram && (
            <a
              href={siteSettings.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(textVariants({ size: '2xl' }), 'hover:opacity-70 transition-opacity')}
            >
              <AiFillInstagram />
            </a>
          )}
          {siteSettings?.socialLinks?.linkedin && (
            <a
              href={siteSettings.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(textVariants({ size: '2xl' }), 'hover:opacity-70 transition-opacity')}
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
          <a href="#next-event" className="hover:opacity-70 transition-opacity">
            NEXT EVENT
          </a>
          <span>/</span>
          <a href="#past-events" className="hover:opacity-70 transition-opacity">
            PAST EVENTS
          </a>
          <span>/</span>
          <a href="#contact" className="hover:opacity-70 transition-opacity">
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
                className={cn(textVariants({ size: '2xl' }), 'hover:opacity-70 transition-opacity')}
              >
                <AiFillInstagram />
              </a>
            )}
            {siteSettings?.socialLinks?.linkedin && (
              <a
                href={siteSettings.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(textVariants({ size: '2xl' }), 'hover:opacity-70 transition-opacity')}
              >
                <AiFillLinkedin />
              </a>
            )}
          </div>
          {nextEvent?.ticketUrl && (
            <a
              href={nextEvent.ticketUrl}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
              target="_blank"
              rel="noopener noreferrer"
            >
              BUY TICKETS
            </a>
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
      </header>

      {/* Logo */}
      <div className="max-w-8xl mx-auto px-5 mb-24">
        <div className="text-center mx-auto mt-10 md:mt-16">
          <Image
            src="/Multiplicity_Logo.svg"
            alt="Multiplicity Logo"
            width={1392}
            height={322}
            className="w-full h-auto"
          />
        </div>
        {/* Next event + brought to you by */}
        <div className="flex flex-col lg:flex-row justify-start lg:justify-between items-start lg:items-center gap-2 mt-5 lg:-mt-[2.5%] lg:mr-[10.5%]">
          <div className="text-center">
            <p
              className={cn(
                textVariants({ size: 'base', font: 'ufficio', transform: 'uppercase' }),
                'text-left',
              )}
            >
              Next Event:
              <br className="md:hidden" />
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
            </p>
          </div>
          <div className="text-center">
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
          </div>
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
        <section
          className={cn(
            textVariants({
              size: '3xl',
              font: 'oldman',
              weight: 'normal',
              leading: 'tight',
            }),
            'max-w-5xl mx-auto px-5 mb-24 text-center',
            'text-center',
          )}
        >
          <div className="flex flex-col gap-20">
            {siteSettings.aboutParagraphs.map((paragraph: any, index: number) => (
              <p key={index}>{paragraph.text}</p>
            ))}
          </div>
        </section>
      )}

      {/* Next Event Section */}
      {nextEvent && <NextEventSection nextEvent={nextEvent} />}

      {/* Past Events Section */}
      {pastEvents.docs.length > 0 && (
        <section id="past-events" className="bg-pink pb-24">
          <div className="text-center max-w-8xl mx-auto px-5 py-8 md:py-8">
            <Image
              src="/PAST EVENTS.svg"
              alt="Past Events"
              width={1392}
              height={322}
              className="w-full h-auto"
            />
          </div>
          <PastEventsCarousel events={[...pastEvents.docs, ...pastEvents.docs]} />
        </section>
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
