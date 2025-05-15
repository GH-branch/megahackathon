import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'forest-primary': '#2C5530',
        'forest-secondary': '#8BA888',
        'forest-dark': '#1A2F1C',
        'forest-light': '#E6EFE9',
        'forest-accent': '#D4B483',
      },
      backgroundImage: {
        'forest-pattern': "url('/forest-bg.jpg')",
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        forest: {
          primary: '#2C5530',
          secondary: '#8BA888',
          accent: '#D4B483',
          neutral: '#1A2F1C',
          'base-100': '#E6EFE9',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBD23',
          error: '#F87272',
        },
      },
    ],
  },
} as Config

export default config; 