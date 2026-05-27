import {
  CLIENT_STORAGE_KEYS,
  RESET_ON_SERVER_RESTART_STORAGE_KEYS,
} from '@/config/clientStorage'

type AppSessionResponse = {
  id: string
}

const SERVER_SESSION_POLL_INTERVAL_MS = 5000

export default defineNuxtPlugin(async () => {
  const checkServerSession = async (): Promise<void> => {
    try {
      const session = await $fetch<AppSessionResponse>('/api/app-session', {
        headers: {
          'cache-control': 'no-cache',
        },
      })
      const previousSessionId = localStorage.getItem(CLIENT_STORAGE_KEYS.serverSessionId)

      if (previousSessionId && previousSessionId !== session.id) {
        for (const storageKey of RESET_ON_SERVER_RESTART_STORAGE_KEYS) {
          localStorage.removeItem(storageKey)
        }

        localStorage.setItem(CLIENT_STORAGE_KEYS.serverSessionId, session.id)
        window.location.reload()
        return
      }

      localStorage.setItem(CLIENT_STORAGE_KEYS.serverSessionId, session.id)
    } catch {
      // Keep the previous session id. If the dev server is restarting, the next
      // successful check can still detect the changed process session.
    }
  }

  await checkServerSession()
  window.setInterval(() => {
    void checkServerSession()
  }, SERVER_SESSION_POLL_INTERVAL_MS)
})
