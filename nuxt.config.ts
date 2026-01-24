export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_BASE ?? 'http://localhost:8000',
    },
  },
  modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxt/icon'],
  css: ['@/assets/styles/theme.css', '@/assets/styles/fonts.css'],
})
