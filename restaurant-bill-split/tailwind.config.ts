// /c:/Users/gekha/Desktop/Cursor Game/megahackathon/restaurant-bill-split/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        cormorant: ['var(--font-cormorant)'],
      },
      colors: {
        forest: {
          50: '#f3f4f6',
          100: '#e5e7eb',
          200: '#d1d5db',
          300: '#9ca3af',
          400: '#6b7280',
          500: '#4b5563',
          600: '#374151',
          700: '#1f2937',
          800: '#111827',
          900: '#0d1117',
          950: '#030712',
        },
      },
    },
  },
  plugins: [require('daisyui')],
}

export default config