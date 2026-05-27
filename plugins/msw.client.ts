export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  const shouldMock = config.public.apiMode === 'mock'

  if (!shouldMock) {
    return
  }

  const { worker } = await import('@/shared/mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
  })
})
