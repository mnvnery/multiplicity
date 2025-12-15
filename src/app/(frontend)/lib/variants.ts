import { cva, type VariantProps } from 'class-variance-authority'
import { clsx, type ClassValue } from 'clsx'

// Utility function to merge class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Text size variants with fluid scaling
export const textVariants = cva('', {
  variants: {
    size: {
      xs: 'fl-text-xs/sm',
      sm: 'fl-text-sm/base',
      base: 'fl-text-base/lg',
      lg: 'fl-text-lg/xl',
      xl: 'fl-text-base/2xl',
      '2xl': 'text-4xl',
      '3xl': 'fl-text-3xl/5xl',
      '4xl': 'fl-text-4xl/6xl',
      '5xl': 'fl-text-5xl/7xl',
      '6xl': 'fl-text-6xl/8xl',
      '7xl': 'fl-text-7xl/9xl',
      '8xl': 'fl-text-8xl/9xl',
    },
    font: {
      ufficio: 'font-ufficio',
      oldman: 'font-oldman',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      black: 'font-black',
    },
    transform: {
      none: 'normal-case',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
    },
    leading: {
      under: 'leading-[0.8]',
      none: 'leading-none',
      tight: 'leading-tight',
      snug: 'leading-snug',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    transform: 'none',
    leading: 'normal',
  },
})

export type TextVariants = VariantProps<typeof textVariants>

// Button variants
export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-white text-black border-3 border-black hover:bg-pink hover:text-black',
        secondary: 'bg-black text-yellow border-3 border-black hover:bg-yellow hover:text-black',
        tertiary: 'bg-yellow text-black border-3 border-black hover:bg-pink hover:text-black',
        outline: 'bg-transparent text-black border-3 border-black hover:bg-black hover:text-yellow',
        link: 'bg-transparent text-black underline hover:opacity-70',
        social: 'text-black hover:opacity-70',
      },
      size: {
        sm: 'fl-px-3/4 fl-py-1.5/2 fl-text-sm/base',
        default: 'fl-px-4/6 fl-py-2/3 fl-text-base/lg',
        lg: 'fl-px-5/8 fl-py-6/4 fl-text-3xl/2xl',
        xl: 'fl-px-6/10 fl-py-3/4 fl-text-xl/3xl',
        '2xl': 'fl-px-8/12 fl-py-4/6 fl-text-2xl/4xl',
        '3xl': 'fl-px-10/14 fl-py-4/6 fl-text-6xl/5xl',
      },
      font: {
        ufficio: 'font-ufficio',
        oldman: 'font-oldman',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        black: 'font-black',
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
      },
      transform: {
        none: 'normal-case',
        uppercase: 'uppercase',
        lowercase: 'lowercase',
        capitalize: 'capitalize',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      font: 'oldman',
      weight: 'bold',
      width: 'auto',
      transform: 'uppercase',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
