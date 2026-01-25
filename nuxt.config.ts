export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://192.168.178.74:8000',
    },
  },
  modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxt/icon', '@nuxtjs/i18n'],
  css: ['@/assets/styles/theme.css', '@/assets/styles/fonts.css', '@/assets/styles/base.css'],
  app: {
    head: {
      meta: [{ name: 'theme-color', content: '#c084fc' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  i18n: {
    langDir: 'locales',
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'de', file: 'de.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      fallbackLocale: 'en',
    },
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
  },
})
