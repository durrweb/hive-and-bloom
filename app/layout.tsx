// app/layout.tsx
import type { Metadata } from 'next'
import { Playfair_Display, Crimson_Pro, DM_Sans } from 'next/font/google'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})
const crimson = Crimson_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-crimson',
  display: 'swap',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Hive & Bloom', template: '%s | Hive & Bloom' },
  description: 'Your guide to honeybee keeping, butterfly gardening, pollinator plants, honey recipes, and everything that helps pollinators thrive.',
  keywords: ['beekeeping', 'pollinators', 'honeybees', 'butterfly garden', 'mason bees', 'honey recipes'],
  openGraph: {
    siteName: 'Hive & Bloom',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${crimson.variable} ${dmSans.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
