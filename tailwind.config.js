/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors:{
        // Cor principal da marca - Verde Corporativo #00884f
        primary: {
          50: '#e6f5ef',   // Verde muito claro
          100: '#ccebdf',  // Verde claro
          200: '#99d7bf',  // Verde suave
          300: '#66c39f',  // Verde médio claro
          400: '#33af7f',  // Verde médio
          500: '#00aa62',  // Verde vibrante
          600: '#00884f',  // Verde marca (principal)
          700: '#00663b',  // Verde escuro
          800: '#004427',  // Verde muito escuro
          900: '#002214',  // Verde quase preto
          950: '#001109',  // Verde extremamente escuro
        },
        // Paleta dark mode com tema da empresa
        dark: {
          bg: '#0a1410',      // Background principal - verde muito escuro
          card: '#0f1d17',    // Cards e componentes - verde escuro
          border: '#1a2e24',  // Bordas - verde médio escuro
          hover: '#152820',   // Hover states - verde escuro
        },
        // Cor secundária da marca - Dourado #bf9c4b
        secondary: {
          50: '#faf7f0',   // Dourado muito claro
          100: '#f5efe1',  // Dourado claro
          200: '#ebdfc3',  // Dourado suave
          300: '#e0cfa5',  // Dourado médio claro
          400: '#d6bf87',  // Dourado médio
          500: '#ccaf69',  // Dourado vibrante
          600: '#bf9c4b',  // Dourado marca (principal)
          700: '#9f7f3d',  // Dourado escuro
          800: '#7f642f',  // Dourado muito escuro
          900: '#5f4921',  // Dourado profundo
        },
        // Alias para manter compatibilidade
        accent: {
          50: '#faf7f0',
          100: '#f5efe1',
          200: '#ebdfc3',
          300: '#e0cfa5',
          400: '#d6bf87',
          500: '#ccaf69',
          600: '#bf9c4b',
          700: '#9f7f3d',
          800: '#7f642f',
          900: '#5f4921',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
