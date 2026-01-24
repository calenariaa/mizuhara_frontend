<script setup lang="ts">
import type { ProductInformation } from '~/types/api/products/productInformation'
import type { ShoppingList } from '~/types/api/shoppingList/shoppingList'
import type { ShoppingListEntry } from '~/types/api/shoppingList/shoppingListEntry'

import { useApiClient } from '~/composables/api/useApiClient'
import { shoppingListService } from '~/modules/shoppingList/services/shoppingListService'
import { shoppingListEntryService } from '~/modules/shoppingList/services/shoppingListEntryService'

const route = useRoute()
const listId = computed(() => Number(route.params.id))

const list = ref<ShoppingList | null>(null)
const entries = ref<ShoppingListEntry[]>([])
const productsByIri = ref(new Map<string, ProductInformation>())

const pending = ref(false)
const error = ref<string | null>(null)

const { getItem } = useApiClient()

const ensureProductsLoaded = async (iris: string[]): Promise<void> => {
  const unique = [...new Set(iris)].filter((iri) => iri && !productsByIri.value.has(iri))
  if (unique.length === 0) return

  const fetched = await Promise.all(unique.map((iri) => getItem<ProductInformation>(iri)))

  const next = new Map(productsByIri.value)
  for (const p of fetched) {
    if (p['@id']) next.set(p['@id'], p)
  }
  productsByIri.value = next
}

const load = async (): Promise<void> => {
  pending.value = true
  error.value = null

  try {
    const [l, e] = await Promise.all([
      shoppingListService().getById(listId.value),
      shoppingListEntryService().getByShoppingListId(listId.value),
    ])

    list.value = l
    entries.value = e

    await ensureProductsLoaded(e.map((x) => x.productInformation))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    list.value = null
    entries.value = []
    productsByIri.value = new Map()
  } finally {
    pending.value = false
  }
}

watch(listId, () => void load(), { immediate: true })

const rows = computed(() => {
  return entries.value.map((e) => {
    const p = productsByIri.value.get(e.productInformation)
    return {
      id: e.id,
      product: p?.name ?? e.productInformation,
      addedBy: e.addedBy ?? '—',
    }
  })
})
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="titleWrap">
        <NuxtLink class="back" to="/shopping-lists">← Zurück</NuxtLink>
        <h1 class="h1">{{ list?.name ?? 'Shopping List' }}</h1>
        <p class="subtitle">{{ rows.length }} Einträge</p>
      </div>
    </header>

    <div v-if="error" class="stateCard">
      <div class="stateTitle">Fehler</div>
      <div class="stateMsg">{{ error }}</div>
      <button class="retry" type="button" @click="load">Retry</button>
    </div>

    <div v-else-if="pending" class="stateCard">
      <div class="stateTitle">Lade Einträge…</div>
      <div class="stateMsg">Entries + ProductInfos werden abgeholt.</div>
    </div>

    <div v-else class="card">
      <div class="tableWrap">
        <table class="table">
          <thead>
            <tr>
              <th>Produkt</th>
              <th>Added by</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td class="cellStrong">{{ r.product }}</td>
              <td class="cellMuted">{{ r.addedBy }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="rows.length === 0" class="emptyInline">Keine Einträge in dieser Liste.</div>
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

.card {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 12px;
  box-shadow: var(--shadow-elevated);
}

.tableWrap {
  width: 100%;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th {
  text-align: left;
  padding: 10px 12px;
  background: var(--color-bg-light);
  color: var(--color-text-secondary);
  font-weight: 800;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}

.table tbody tr:hover td {
  background: var(--color-primary-soft);
}

.cellStrong {
  font-weight: 800;
  color: var(--color-text-primary);
}

.cellMuted {
  color: var(--color-text-secondary);
}

.emptyInline {
  padding: 12px;
  color: var(--color-text-secondary);
}
</style>
