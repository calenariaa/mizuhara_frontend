<script setup lang="ts">
import type { ShoppingList } from '~/types/api/shoppingList/shoppingList'
import type { ShoppingListCollection } from '~/types/api/shoppingList/shoppingListCollection'

import { shoppingListCollectionService } from '~/modules/shoppingList/services/shoppingListCollectionService'
import { shoppingListService } from '~/modules/shoppingList/services/shoppingListService'

const route = useRoute()
const collectionId = computed(() => Number(route.params.id))

const collection = ref<ShoppingListCollection | null>(null)
const lists = ref<ShoppingList[]>([])
const pending = ref(false)
const error = ref<string | null>(null)

const load = async (): Promise<void> => {
  pending.value = true
  error.value = null

  try {
    const [c, l] = await Promise.all([
      shoppingListCollectionService().getById(collectionId.value),
      shoppingListService().getByCollectionId(collectionId.value),
    ])

    collection.value = c
    lists.value = l
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    collection.value = null
    lists.value = []
  } finally {
    pending.value = false
  }
}

watch(collectionId, () => void load(), { immediate: true })
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="titleWrap">
        <NuxtLink class="back" to="/shopping-lists">← Zurück</NuxtLink>
        <h1 class="h1">{{ collection?.name ?? 'Collection' }}</h1>
        <p class="subtitle">{{ lists.length }} Listen</p>
      </div>
    </header>

    <div v-if="error" class="stateCard">
      <div class="stateTitle">Fehler</div>
      <div class="stateMsg">{{ error }}</div>
      <button class="retry" type="button" @click="load">Retry</button>
    </div>

    <div v-else-if="pending" class="stateCard">
      <div class="stateTitle">Lade Listen…</div>
      <div class="stateMsg">Die ShoppingLists werden vom Backend abgeholt.</div>
    </div>

    <div v-else class="grid">
      <article v-for="l in lists" :key="l.id" class="card">
        <div class="cardHeader">
          <div class="cardTitle">{{ l.name }}</div>
        </div>

        <div class="actions">
          <NuxtLink class="linkPrimary" :to="`/shopping-lists/lists/${l.id}`">
            Liste öffnen
          </NuxtLink>
        </div>
      </article>

      <div v-if="lists.length === 0" class="stateCard">
        <div class="stateTitle">Keine Listen</div>
        <div class="stateMsg">In dieser Collection gibt es noch keine ShoppingLists.</div>
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

.back {
  display: inline-flex;
  width: fit-content;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-weight: 700;
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

.stateCard {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 14px;
  box-shadow: var(--shadow-elevated);
}

.stateTitle {
  font-weight: 800;
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
}
</style>
