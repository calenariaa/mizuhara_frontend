export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_BASE ?? 'http://192.168.178.74:8000',
    },
  },
  modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxt/icon'],
  css: ['@/assets/styles/theme.css', '@/assets/styles/fonts.css'],
  app: {
    head: {
      title: 'Mizuhara · Smart Home',
      meta: [
        { name: 'description', content: 'Smart Home Smart' },
        { name: 'theme-color', content: '#c084fc' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
