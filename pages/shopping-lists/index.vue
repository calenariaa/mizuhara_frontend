<script setup lang="ts">
import type { ShoppingListCollection } from '@/types/api/shoppingList/shoppingListCollection'

import { useI18n, useLocalePath } from '#imports'
import { shoppingListCollectionService } from '@/modules/shoppingList/services/shoppingListCollectionService'

const { t } = useI18n()
const localePath = useLocalePath()

const collections = ref<ShoppingListCollection[]>([])
const error = ref<string | null>(null)
const pending = ref(false)

const listCountsByCollection = computed(() => {
  const map = new Map<number, number>()
  for (const collection of collections.value) {
    map.set(collection.id, (collection.shoppingLists ?? []).length)
  }
  return map
})

const loadData = async (): Promise<void> => {
  pending.value = true
  error.value = null

  try {
    collections.value = await shoppingListCollectionService().getAll()
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('errors.unknown')
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
        <h1 class="h1">{{ t('shoppingLists.collections.title') }}</h1>
        <p class="subtitle">{{ t('shoppingLists.collections.subtitle') }}</p>
      </div>

      <button
        class="refresh"
        type="button"
        :disabled="pending"
        :aria-label="t('shoppingLists.collections.actions.refreshAria')"
        @click="loadData"
      >
        <Icon :name="pending ? 'ph:spinner-gap' : 'ph:arrow-clockwise'" class="refreshIcon" />
      </button>
    </header>

    <div v-if="error" class="error">
      <div class="errorTitle">{{ t('shoppingLists.state.errorTitle') }}</div>
      <div class="errorMsg">{{ error }}</div>
      <button class="retry" type="button" @click="loadData">
        {{ t('shoppingLists.state.retry') }}
      </button>
    </div>

    <div v-else-if="pending" class="loadingCard">
      <div class="loadingTitle">{{ t('shoppingLists.collections.state.loadingTitle') }}</div>
      <div class="loadingSub">{{ t('shoppingLists.collections.state.loadingSubtitle') }}</div>
    </div>

    <div v-else class="grid">
      <article v-for="collection in collections" :key="collection.id" class="card">
        <div class="cardHeader">
          <div class="cardTitle">{{ collection.name }}</div>
          <div class="badge">{{ listCountsByCollection.get(collection.id) ?? 0 }}</div>
        </div>

        <div class="actions">
          <NuxtLink
            class="linkPrimary"
            :to="localePath(`/shopping-lists/collections/${collection.id}`)"
          >
            {{ t('shoppingLists.collections.actions.openCollection') }}
          </NuxtLink>

          <span v-if="(collection.shoppingLists?.length ?? 0) === 0" class="mutedSmall">
            {{ t('shoppingLists.collections.empty.noListsInCollection') }}
          </span>
        </div>
      </article>

      <div v-if="collections.length === 0" class="empty">
        <div class="emptyTitle">{{ t('shoppingLists.collections.empty.noCollectionsTitle') }}</div>
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
