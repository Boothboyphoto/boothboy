import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#4A7CC7',
          dark: '#2E5BA3',
          light: '#6B97D9',
          pale: '#EBF1FA',
        },
        cream: {
          DEFAULT: '#F5F0E8',
          dark: '#EDE5D4',
        },
        yellow: { DEFAULT: '#F5D020', dark: '#D4AF0A' },
        ink: '#0E1420',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
