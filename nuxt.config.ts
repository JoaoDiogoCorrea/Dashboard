import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['shadcn-nuxt', '@pinia/nuxt'],
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: { htmlAttrs: { lang: 'pt-BR' }, titleTemplate: '%s · Dashboard' },
  },
  routeRules: {
    '/': { redirect: '/campanhas' },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
  nitro: {
    storage: {
      db: { driver: 'fs', base: './data' },
    },
  },
})
