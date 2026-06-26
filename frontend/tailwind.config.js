/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        /*
          🎨 Palette Pastel Aurora — Cité d'Innovation UCA
          ───────────────────────────────────────────────
          - Corail (primary)   : chaleur, action principale
          - Menthe (secondary) : fraîcheur, validation
          - Ambre  (accent)    : highlight, énergie douce
          - Lavande (extra)    : élégance, infos
          - Rose pastel        : touches féminines/douces
          - Pêche pastel       : transitions chaleureuses
        */
        primary: {
          50:  '#FEF4F1',
          100: '#FDE8E2',
          200: '#FACFC2',
          300: '#F4AC97',
          400: '#EC8E73',
          500: '#E07A5F', // base corail
          600: '#C96A50',
          700: '#A85540',
          800: '#864435',
          900: '#5C2E25',
          DEFAULT: '#E07A5F',
          dark: '#C96A50',
        },
        secondary: {
          50:  '#EFFAF6',
          100: '#D9F3E8',
          200: '#B5E6D2',
          300: '#88D4B7',
          400: '#6BC8A8',
          500: '#5BBFA0', // base menthe
          600: '#4AA88D',
          700: '#3D8B74',
          800: '#306E5D',
          900: '#22503F',
          DEFAULT: '#5BBFA0',
          dark: '#4AA88D',
        },
        accent: {
          50:  '#FEF9EE',
          100: '#FCF1D8',
          200: '#F9E3B0',
          300: '#F5D391',
          400: '#F3CC8F',
          500: '#F2CC8F', // base ambre
          600: '#E9B86A',
          700: '#D29F4E',
          800: '#A57A3A',
          900: '#6E5128',
          DEFAULT: '#F2CC8F',
          dark: '#E9B86A',
        },
        lavender: {
          50:  '#F5F3FA',
          100: '#E9E4F2',
          200: '#D4CBE6',
          300: '#B8AAD4',
          400: '#A89AC9',
          500: '#9B8EC4', // base lavande
          600: '#806FB0',
          700: '#65548F',
          800: '#4F4170',
          900: '#372D4F',
          DEFAULT: '#9B8EC4',
          dark: '#806FB0',
        },
        peach: {
          DEFAULT: '#FFD9C2',
          light:   '#FFE6D5',
        },
        rose: {
          soft:    '#FFCFD8',
          softer:  '#FFE2E8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#FBF9F7',
          page:    '#F5F7FA',
          aurora:  '#FAF6F2',
        },
        ink: {
          900: '#1B1A1F',
          800: '#292524',
          700: '#3D3A36',
          600: '#57534E',
          500: '#78716C',
          400: '#A8A29E',
          300: '#D6D3D1',
          200: '#E7E5E4',
          100: '#F5F4F2',
        },
        // On garde 'slate' "réchauffé" pour compat
        slate: {
          850: '#1C1815',
          950: '#14110F',
        },
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',

        // 🌸 Aurora pastel — utilisée comme background hero & sections
        'aurora-soft':
          'radial-gradient(40% 50% at 15% 20%, rgba(224,122,95,0.22) 0%, transparent 70%),' +
          'radial-gradient(35% 45% at 85% 15%, rgba(155,142,196,0.20) 0%, transparent 70%),' +
          'radial-gradient(45% 55% at 80% 85%, rgba(242,204,143,0.22) 0%, transparent 70%),' +
          'radial-gradient(40% 50% at 20% 90%, rgba(91,191,160,0.18) 0%, transparent 70%)',

        // Dégradés cards (4 pôles d'excellence)
        'pole-coral':    'linear-gradient(135deg, #F4AC97 0%, #E07A5F 100%)',
        'pole-mint':     'linear-gradient(135deg, #88D4B7 0%, #5BBFA0 100%)',
        'pole-amber':    'linear-gradient(135deg, #F5D391 0%, #E9B86A 100%)',
        'pole-lavender': 'linear-gradient(135deg, #B8AAD4 0%, #9B8EC4 100%)',
        'pole-peach':    'linear-gradient(135deg, #FFE6D5 0%, #FFD9C2 100%)',
        'pole-rose':     'linear-gradient(135deg, #FFE2E8 0%, #FFCFD8 100%)',

        // Hero principal (image bâtiment + overlay pastel)
        'hero-pastel':
          'linear-gradient(135deg, rgba(224,122,95,0.92) 0%, rgba(232,149,111,0.88) 45%, rgba(242,204,143,0.92) 100%)',

        // Hero alternatif (mint)
        'hero-mint':
          'linear-gradient(135deg, rgba(91,191,160,0.92) 0%, rgba(125,212,184,0.88) 50%, rgba(168,230,207,0.92) 100%)',

        // Grille subtile (overlay points)
        'dot-grid':
          'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)',
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },

      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-lg': ['3.5rem', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-md': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em',  fontWeight: '700' }],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        soft:           '0 4px 20px -2px rgba(60, 40, 30, 0.08)',
        'soft-lg':      '0 12px 35px -8px rgba(60, 40, 30, 0.12)',
        'glow-coral':   '0 0 28px rgba(224, 122, 95, 0.22)',
        'glow-mint':    '0 0 28px rgba(91, 191, 160, 0.22)',
        'glow-amber':   '0 0 28px rgba(242, 204, 143, 0.30)',
        'glow-lavender':'0 0 28px rgba(155, 142, 196, 0.22)',
        'hover-elevate':'0 12px 30px -8px rgba(60, 40, 30, 0.14), 0 8px 12px -6px rgba(60, 40, 30, 0.08)',
        'card-pastel':  '0 10px 30px -10px rgba(224, 122, 95, 0.25)',
        'inset-soft':   'inset 0 1px 2px rgba(255,255,255,0.6)',
      },

      backdropBlur: {
        xs: '2px',
      },

      animation: {
        'fade-in':    'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'aurora':     'auroraMove 22s ease-in-out infinite',
        'aurora-slow':'auroraMove 32s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer':    'shimmer 2.4s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // ✨ Aurora — mouvement très doux des nappes de couleur
        auroraMove: {
          '0%, 100%': {
            transform: 'translate3d(0, 0, 0) scale(1)',
            opacity: '0.65',
          },
          '25%': {
            transform: 'translate3d(2%, -3%, 0) scale(1.05)',
            opacity: '0.78',
          },
          '50%': {
            transform: 'translate3d(-2%, 2%, 0) scale(0.98)',
            opacity: '0.6',
          },
          '75%': {
            transform: 'translate3d(3%, 1%, 0) scale(1.03)',
            opacity: '0.72',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.55' },
          '50%':      { opacity: '0.85' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};