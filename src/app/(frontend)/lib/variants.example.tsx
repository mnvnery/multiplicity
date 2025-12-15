/**
 * Example usage of textVariants and buttonVariants
 *
 * This file demonstrates how to use the style variants throughout your application.
 * You can delete this file once you're familiar with the patterns.
 */

import { textVariants, buttonVariants, cn } from './variants'

// Example: Text variants
export function TextExamples() {
  return (
    <>
      {/* Basic text with size */}
      <p className={textVariants({ size: 'lg' })}>Large fluid text that scales smoothly</p>

      {/* Text with multiple variants */}
      <h1
        className={textVariants({
          size: '5xl',
          font: 'oldman',
          weight: 'bold',
          transform: 'uppercase',
        })}
      >
        Event Title
      </h1>

      {/* Navigation text */}
      <nav className={textVariants({ size: 'sm', font: 'ufficio', transform: 'uppercase' })}>
        <a href="#next-event">NEXT EVENT</a>
      </nav>

      {/* Body text with custom leading */}
      <p className={textVariants({ size: 'base', leading: 'relaxed' })}>
        Paragraph text with relaxed line height
      </p>
    </>
  )
}

// Example: Button variants
export function ButtonExamples() {
  return (
    <>
      {/* Primary button (default) */}
      <button className={buttonVariants()}>BUY TICKETS</button>

      {/* Button with custom size and variant */}
      <button
        className={buttonVariants({
          variant: 'primary',
          size: 'lg',
          width: 'full',
        })}
      >
        Full Width Button
      </button>

      {/* Secondary button */}
      <a
        href="#"
        className={buttonVariants({
          variant: 'secondary',
          size: 'default',
        })}
      >
        Secondary Button
      </a>

      {/* Outline button */}
      <button
        className={buttonVariants({
          variant: 'outline',
          size: 'sm',
        })}
      >
        Outline Button
      </button>

      {/* Link button */}
      <a
        href="#"
        className={buttonVariants({
          variant: 'link',
          size: 'sm',
          transform: 'none',
        })}
      >
        View on map
      </a>

      {/* Combining with additional classes using cn() */}
      <button
        className={cn(
          buttonVariants({ variant: 'primary', size: 'lg' }),
          'hover:-translate-y-0.5', // Additional custom class
        )}
      >
        Custom Button
      </button>
    </>
  )
}

// Example: Using in your page components
export function PageExample() {
  return (
    <div>
      {/* Headings */}
      <h1
        className={textVariants({
          size: '6xl',
          font: 'oldman',
          weight: 'bold',
          transform: 'uppercase',
        })}
      >
        Event Title
      </h1>

      {/* Body text */}
      <p
        className={textVariants({
          size: 'lg',
          leading: 'relaxed',
          weight: 'medium',
        })}
      >
        About paragraph text
      </p>

      {/* Navigation */}
      <nav className="flex gap-2.5">
        <a
          href="#next-event"
          className={cn(
            textVariants({ size: 'sm', font: 'ufficio', transform: 'uppercase' }),
            'hover:opacity-70 transition-opacity',
          )}
        >
          NEXT EVENT
        </a>
      </nav>

      {/* Buttons */}
      <a
        href="#"
        className={buttonVariants({
          variant: 'primary',
          size: 'lg',
          width: 'full',
        })}
      >
        BUY TICKETS
      </a>
    </div>
  )
}
