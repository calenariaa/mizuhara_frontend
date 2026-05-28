<script setup lang="ts">
import { useHead, useI18n } from '#imports'
import { useBackendReconnect, useMockApiMode } from '@/composables/api/useMockApi'

const { t } = useI18n()
const mockApiMode = useMockApiMode()
const { retryBackendConnection } = useBackendReconnect()
const isReconnecting = ref(false)
const reconnectFailed = ref(false)

const reconnectBackend = async (): Promise<void> => {
  isReconnecting.value = true
  reconnectFailed.value = false

  try {
    const connected = await retryBackendConnection()

    if (connected) {
      window.location.reload()
      return
    }

    reconnectFailed.value = true
  } finally {
    isReconnecting.value = false
  }
}

useHead(() => ({
  title: t('app.title'),
  meta: [{ name: 'description', content: t('app.description') }],
  bodyAttrs: {
    class: mockApiMode.value !== 'off' ? 'hasMockBanner' : '',
  },
}))
</script>

<template>
  <div v-if="mockApiMode !== 'off'" class="mockBanner" role="status">
    <span>
      {{ mockApiMode === 'fallback' ? t('mockApi.fallback') : t('mockApi.manual') }}
      <span v-if="reconnectFailed">{{ t('mockApi.reconnectFailed') }}</span>
    </span>

    <button
      v-if="mockApiMode === 'fallback'"
      class="mockReconnect"
      type="button"
      :disabled="isReconnecting"
      @click="reconnectBackend"
    >
      {{ isReconnecting ? t('mockApi.reconnecting') : t('mockApi.reconnect') }}
    </button>
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style scoped>
.mockBanner {
  position: sticky;
  top: 0;
  z-index: 1000;
  min-height: 54px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  background: #fff7ed;
  color: #7c2d12;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  text-align: center;
}

:global(body.hasMockBanner) {
  --mock-banner-offset: 54px;
}

@media (max-width: 640px) {
  .mockBanner {
    min-height: 76px;
  }

  :global(body.hasMockBanner) {
    --mock-banner-offset: 76px;
  }
}

.mockReconnect {
  border: 1px solid #fed7aa;
  background: #ffffff;
  color: #7c2d12;
  border-radius: 8px;
  padding: 6px 10px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.mockReconnect:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
