import { useColorMode } from '@/composables/useColorMode'

export default defineNuxtPlugin(() => {
  const { loadColorMode } = useColorMode()
  loadColorMode()
})
