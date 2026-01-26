import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'sans-serif'],
      },
      colors: {
        // ชุดสี Brand (ถ้าขาดตรงนี้ไป ปุ่มจะไม่มีสีพื้นหลัง)
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // สีหลัก Sky Blue
          600: '#0284c7', // สีปุ่มตอนปกติ
          700: '#0369a1', // สีปุ่มตอนเอาเมาส์ชี้
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          500: '#6366f1',
        }
      },
      // Animation ต่างๆ
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'blob': 'blob 7s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'shine': 'shine 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        shine: {
          '0%': { left: '-100%' },
          '20%': { left: '100%' },
          '100%': { left: '100%' }
        }
      }
    },
  },
  plugins: [],
};
export default config;