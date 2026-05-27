export type MockApiMode = 'off' | 'manual' | 'fallback'

export const useMockApiMode = () => useState<MockApiMode>('mockApiMode', () => 'off')

export const useBackendReconnect = () => {
  const nuxtApp = useNuxtApp()

  return {
    retryBackendConnection: nuxtApp.$retryBackendConnection ?? (async () => false),
  }
}
