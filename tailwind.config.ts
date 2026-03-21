// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        crimson:  ['var(--font-crimson)',  'Georgia', 'serif'],
        sans:     ['var(--font-dm-sans)',  'system-ui', 'sans-serif'],
      },
      colors: {
        honey:     { DEFAULT: '#C8771E', light: '#F4C56A', pale: '#FBF0D9', deep: '#8A4F0A' },
        forest:    { DEFAULT: '#2A4A2A', mid: '#3D6B3A', light: '#6B9E65', pale: '#EBF4E6' },
        cream:     { DEFAULT: '#FAF5EC', dark: '#F0E7D0' },
        bark:      '#7A5C38',
        ink:       '#1E1A14',
        mist:      '#8A8478',
        lavender:  '#8A7BAF',
        coral:     '#C96B4A',
        sky:       '#4A8BAF',
      },
      maxWidth: { container: '1140px' },
    },
  },
  plugins: [],
}

export default config
