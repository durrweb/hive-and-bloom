'use client'
// components/layout/HeroBackground.tsx
import { useEffect, useState } from 'react'

// Free high-quality images from Unsplash — no API key needed
const IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80', // honeybee on flower
  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600&q=80', // beekeeper with hive
  'https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=1600&q=80', // butterfly on wildflower
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&q=80', // wildflower meadow
  'https://images.unsplash.com/photo-1568526381923-caf3fd520382?w=1600&q=80', // honeybee close up
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1600&q=80', // honeycomb
]

const INTERVAL_MS = 5000  // 5 seconds per image
const FADE_MS     = 1200  // 1.2 second crossfade

export default function HeroBackground() {
  const [current, setCurrent] = useState(0)
  const [next,    setNext]    = useState<number | null>(null)
  const [fading,  setFading]  = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (current + 1) % IMAGES.length
      setNext(nextIndex)
      setFading(true)

      setTimeout(() => {
        setCurrent(nextIndex)
        setNext(null)
        setFading(false)
      }, FADE_MS)
    }, INTERVAL_MS)

    return () => clearInterval(timer)
  }, [current])

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: `opacity ${FADE_MS}ms ease-in-out`,
  }

  return (
    <>
      {/* Current image */}
      <div style={{
        ...baseStyle,
        backgroundImage: `url(${IMAGES[current]})`,
        opacity: 1,
      }} />

      {/* Next image fading in */}
      {next !== null && (
        <div style={{
          ...baseStyle,
          backgroundImage: `url(${IMAGES[next]})`,
          opacity: fading ? 1 : 0,
        }} />
      )}

      {/* Dark overlay so text stays readable */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(20,44,20,0.88) 0%, rgba(20,44,20,0.65) 55%, rgba(20,44,20,0.45) 100%)',
      }} />

      {/* Subtle radial glow for depth */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 80% at 65% 40%, rgba(200,119,30,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </>
  )
}
