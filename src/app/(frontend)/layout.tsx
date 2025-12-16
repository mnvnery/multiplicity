import React from 'react'
import localFont from 'next/font/local'
import './styles.css'
import { LenisProvider } from './components/LenisProvider'
import { GSAPProvider } from './components/GSAPProvider'

const ufficioFont = localFont({
  src: '../fonts/UfficioMono-400.woff2',
  variable: '--font-ufficio',
  weight: '400',
  display: 'swap',
})

const oldmanFont = localFont({
  src: [
    {
      path: '../fonts/YTFOldman-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/YTFOldman-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-oldman',
  display: 'swap',
})

export const metadata = {
  description:
    "Follco's roaming creative event series, bringing designers, illustrators, photographers and artists together.",
  title: 'Multiplicity - Creative Events Series',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={`${ufficioFont.variable} ${oldmanFont.variable}`}>
      <body>
        <GSAPProvider>
          <LenisProvider>
            <main>{children}</main>
          </LenisProvider>
        </GSAPProvider>
      </body>
    </html>
  )
}
