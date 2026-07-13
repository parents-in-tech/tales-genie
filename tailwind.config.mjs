/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens backed by CSS variables (light/dark set in Layout)
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        'paper-deep': 'rgb(var(--c-paper-deep) / <alpha-value>)',
        card: 'rgb(var(--c-card) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--c-ink-soft) / <alpha-value>)',
        ember: 'rgb(var(--c-ember) / <alpha-value>)',
        'ember-deep': 'rgb(var(--c-ember-deep) / <alpha-value>)',
        gold: 'rgb(var(--c-gold) / <alpha-value>)',
        dusk: 'rgb(var(--c-dusk) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        body: ['"Nunito Variable"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pagein: {
          '0%': { opacity: '0', transform: 'translateY(18px) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite ease-in-out',
        twinkle: 'twinkle 2.6s infinite ease-in-out',
        floaty: 'floaty 5s infinite ease-in-out',
        pagein: 'pagein 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      boxShadow: {
        page: '0 1px 2px rgb(61 44 30 / 0.06), 0 8px 24px -8px rgb(61 44 30 / 0.18)',
        'page-hover': '0 2px 4px rgb(61 44 30 / 0.08), 0 16px 40px -12px rgb(61 44 30 / 0.28)',
      },
    },
  },
  plugins: [],
};
