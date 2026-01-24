<script setup lang="ts">
import type { ShoppingListCollection } from '~/types/api/shoppingList/shoppingListCollection'

import { shoppingListCollectionService } from '~/modules/shoppingList/services/shoppingListCollectionService'

const collections = ref<ShoppingListCollection[]>([])
const error = ref<string | null>(null)
const pending = ref(false)

const listCountsByCollection = computed(() => {
  const map = new Map<number, number>()
  for (const c of collections.value) {
    map.set(c.id, (c.shoppingLists ?? []).length)
  }
  return map
})

const loadData = async (): Promise<void> => {
  pending.value = true
  error.value = null
  try {
    collections.value = await shoppingListCollectionService().getAll()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    collections.value = []
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="titleWrap">
        <h1 class="h1">Shopping Collections</h1>
        <p class="subtitle">Collections</p>
      </div>

      <button
        class="refresh"
        type="button"
        :disabled="pending"
        aria-label="Neu laden"
        @click="loadData"
      >
        <Icon :name="pending ? 'ph:spinner-gap' : 'ph:arrow-clockwise'" class="refreshIcon" />
      </button>
    </header>

    <div v-if="error" class="error">
      <div class="errorTitle">Fehler</div>
      <div class="errorMsg">{{ error }}</div>
      <button class="retry" type="button" @click="loadData">Retry</button>
    </div>

    <div v-else-if="pending" class="loadingCard">
      <div class="loadingTitle">Lade Collections…</div>
      <div class="loadingSub">Collections werden abgeholt.</div>
    </div>

    <div v-else class="grid">
      <article v-for="c in collections" :key="c.id" class="card">
        <div class="cardHeader">
          <div class="cardTitle">{{ c.name }}</div>
          <div class="badge">{{ listCountsByCollection.get(c.id) ?? 0 }}</div>
        </div>

        <div class="actions">
          <NuxtLink class="linkPrimary" :to="`/shopping-lists/collections/${c.id}`">
            Collection öffnen
          </NuxtLink>

          <span v-if="(c.shoppingLists?.length ?? 0) === 0" class="mutedSmall">
            Keine Listen in dieser Collection
          </span>
        </div>
      </article>

      <div v-if="(collections?.length ?? 0) === 0" class="empty">
        <div class="emptyTitle">Keine Collections</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.titleWrap {
  display: grid;
  gap: 6px;
}

.h1 {
  margin: 0;
  font-size: 22px;
  color: var(--color-text-primary);
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.refresh {
  border: 1px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-primary);
  border-radius: 12px;
  width: 44px;
  height: 44px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh:disabled .refreshIcon {
  animation: spin 0.9s linear infinite;
}

.refreshIcon {
  width: 20px;
  height: 20px;
}

.grid {
  display: grid;
  gap: 12px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.card {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 12px;
  box-shadow: var(--shadow-elevated);
  display: grid;
  gap: 10px;
}

.cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cardTitle {
  font-weight: 800;
  color: var(--color-text-primary);
}

.badge {
  min-width: 28px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12px;
  background: var(--color-primary-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.cardDesc {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.35;
  min-height: 34px;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.linkPrimary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-text-primary);
  background: var(--color-bg-light);
  border: 1px solid var(--color-border);
}

.linkPrimary:hover {
  background: var(--color-primary-soft);
}

.details {
  border-top: 1px solid var(--color-border);
  padding-top: 8px;
}

.summary {
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.debug {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  display: grid;
  gap: 4px;
}

.k {
  font-weight: 800;
  color: var(--color-text-primary);
}

.muted {
  opacity: 0.7;
}

.mutedSmall {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.loadingCard,
.error,
.empty {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 14px;
  box-shadow: var(--shadow-elevated);
}

.loadingTitle,
.errorTitle,
.emptyTitle {
  font-weight: 800;
  color: var(--color-text-primary);
}

.loadingSub,
.errorMsg,
.emptySub {
  margin-top: 6px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.retry {
  margin-top: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-light);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
}
</style>
