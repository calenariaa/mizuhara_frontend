import { useMockApiMode } from '@/composables/api/useMockApi'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const mockApiMode = useMockApiMode()
  let workerApi: Awaited<typeof import('@/shared/mocks/browser')>['worker'] | null = null

  const apiEntrypoint = `${String(config.public.apiBase).replace(/\/$/, '')}/api`

  const checkBackend = async (): Promise<void> => {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      Number(config.public.apiFallbackTimeoutMs),
    )

    try {
      await fetch(apiEntrypoint, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      })
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  const startWorker = async (mode: 'manual' | 'fallback') => {
    workerApi ??= (await import('@/shared/mocks/browser')).worker
    await workerApi.start({
      onUnhandledRequest: 'bypass',
    })
    mockApiMode.value = mode
  }

  const retryBackendConnection = async (): Promise<boolean> => {
    if (config.public.apiMode === 'mock') {
      return false
    }

    if (workerApi) {
      workerApi.stop()
    }

    try {
      await checkBackend()
      mockApiMode.value = 'off'
      return true
    } catch {
      await startWorker('fallback')
      return false
    }
  }

  if (config.public.apiMode === 'mock') {
    await startWorker('manual')
  } else if (config.public.apiMode !== 'live') {
    try {
      await checkBackend()
    } catch {
      await startWorker('fallback')
    }
  }

  return {
    provide: {
      retryBackendConnection,
    },
  }
})
