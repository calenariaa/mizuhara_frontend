import type { NuxtApp } from '#app'

declare module '#app' {
  interface NuxtApp {
    $retryBackendConnection?: () => Promise<boolean>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $retryBackendConnection?: NuxtApp['$retryBackendConnection']
  }
}
