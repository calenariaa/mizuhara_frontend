<script setup lang="ts">
import type { ShoppingList } from '~/types/api/shoppingList/shoppingList'
import type { ShoppingListCollection } from '~/types/api/shoppingList/shoppingListCollection'

import AppBreadcrumbs from '~/components/AppBreadcrumbs.vue'
import { useApiClient } from '~/composables/api/useApiClient'
import { shoppingListCollectionService } from '~/modules/shoppingList/services/shoppingListCollectionService'

type HasIri = { '@id'?: string }

const getIri = (entity: HasIri | null): string => entity?.['@id'] ?? ''

const route = useRoute()
const collectionId = computed(() => Number(route.params.id))

const collection = ref<ShoppingListCollection | null>(null)
const lists = ref<ShoppingList[]>([])
const pending = ref(false)
const error = ref<string | null>(null)

const { getItem } = useApiClient()

const load = async (): Promise<void> => {
  pending.value = true
  error.value = null

  try {
    const c = await shoppingListCollectionService().getById(collectionId.value)
    collection.value = c

    const iris = (c.shoppingLists ?? []).filter((x) => typeof x === 'string' && x.length > 0)

    const loaded = await Promise.all(iris.map((iri) => getItem<ShoppingList>(iri)))
    lists.value = loaded
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    collection.value = null
    lists.value = []
  } finally {
    pending.value = false
  }
}

watch(collectionId, () => void load(), { immediate: true })

const breadcrumbs = computed(() => [
  { label: 'Shopping Lists', to: '/shopping-lists' },
  { label: collection.value?.name ?? 'Collection' },
])
</script>

<template>
  <div class="page">
    <AppBreadcrumbs :items="breadcrumbs" />

    <header class="header">
      <div class="titleWrap">
        <h1 class="h1">{{ collection?.name ?? 'Collection' }}</h1>
        <p class="subtitle">{{ lists.length }} Listen</p>
      </div>
    </header>

    <div v-if="error" class="stateCard">
      <div class="stateTitle">Fehler</div>
      <div class="stateMsg">{{ error }}</div>
      <button class="retry" type="button" @click="load">Retry</button>
    </div>

    <div v-else-if="pending" class="stack">
      <div class="skeletonCard">
        <div class="skLine w40" />
        <div class="skLine w70" />
      </div>
      <div class="skeletonCard">
        <div class="skLine w55" />
        <div class="skLine w85" />
      </div>
    </div>

    <div v-else class="grid">
      <NuxtLink
        v-for="l in lists"
        :key="getIri(l) || String(l.id)"
        class="cardLink"
        :to="`/shopping-lists/collections/${collectionId}/lists/${String(l.id)}`"
      >
        <article class="card">
          <div class="cardHeader">
            <div class="cardTitle">{{ l.name }}</div>
          </div>
          <div class="mutedSmall">Liste öffnen</div>
        </article>
      </NuxtLink>

      <div v-if="lists.length === 0" class="empty">
        <div class="emptyTitle">Keine Listen in dieser Collection</div>
        <div class="emptySub">Lege im Backend eine ShoppingList an und verknüpfe sie.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1080px;
  margin: 0 auto;
  width: 100%;
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

.stack {
  display: grid;
  gap: 12px;
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

.cardLink {
  text-decoration: none;
  color: inherit;
  min-width: 0;
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
  font-weight: 900;
  color: var(--color-text-primary);
}

.mutedSmall {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.empty {
  border: 1px dashed var(--color-border);
  border-radius: 16px;
  padding: 16px;
  background: var(--color-bg-light);
}

.emptyTitle {
  font-weight: 900;
  color: var(--color-text-primary);
}

.emptySub {
  margin-top: 6px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.stateCard {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 14px;
  box-shadow: var(--shadow-elevated);
}

.stateTitle {
  font-weight: 900;
  color: var(--color-text-primary);
}

.stateMsg {
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
  font-weight: 900;
}

.skeletonCard {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 14px;
  box-shadow: var(--shadow-elevated);
  display: grid;
  gap: 10px;
}

.skLine {
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--color-bg-light),
    var(--color-primary-soft),
    var(--color-bg-light)
  );
  background-size: 200% 100%;
  animation: shimmer 1.1s linear infinite;
}

.w40 {
  width: 40%;
}
.w55 {
  width: 55%;
}
.w70 {
  width: 70%;
}
.w85 {
  width: 85%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
