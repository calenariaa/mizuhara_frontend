<script setup lang="ts">
import type { ProductInformation } from '~/types/api/products/productInformation'
import type { ShoppingList } from '~/types/api/shoppingList/shoppingList'
import type { ShoppingListEntry } from '~/types/api/shoppingList/shoppingListEntry'
import type { User } from '~/types/api/users/user'

import AppBreadcrumbs from '~/components/AppBreadcrumbs.vue'
import { useIriEntityCache } from '~/composables/api/useIriEntityCache'
import { productInformationService } from '~/modules/catalog/services/productInformationService'
import { shoppingListEntryService } from '~/modules/shoppingList/services/shoppingListEntryService'
import { shoppingListService } from '~/modules/shoppingList/services/shoppingListService'
import { userService } from '~/modules/user/services/userService'

const route = useRoute()
const listId = computed(() => Number(route.params.listId))

const list = ref<ShoppingList | null>(null)
const entries = ref<ShoppingListEntry[]>([])
const pending = ref(false)
const error = ref<string | null>(null)
const entryApiPath = (id: number): string => `/api/shopping_list_entries/${id}`

const adding = ref(false)
const addError = ref<string | null>(null)
const selectedProductIri = ref<string>('')

const products = ref<ProductInformation[]>([])
const users = ref<User[]>([])
const currentUserIri = ref<string>('')

const quantity = ref<number | null>(null)

const cache = useIriEntityCache()

type HasIri = { '@id'?: string }

const getIri = (entity: HasIri | null): string => {
  return entity?.['@id'] ?? ''
}

const pickString = (value: unknown): string | null => {
  return typeof value === 'string' && value.length > 0 ? value : null
}

const getUserLabel = (u: User): string => {
  const maybe = u as unknown as Record<string, unknown>

  return (
    pickString(maybe.email) ??
    pickString(maybe.username) ??
    pickString(maybe.name) ??
    pickString(maybe.displayName) ??
    pickString(getIri(u)) ??
    '—'
  )
}

const productLabel = (p: ProductInformation | null, fallbackIri: string): string => {
  return p?.name ?? fallbackIri
}

const load = async (): Promise<void> => {
  pending.value = true
  error.value = null
  addError.value = null

  try {
    const [l, e, prodList, userList] = await Promise.all([
      shoppingListService().getById(listId.value),
      shoppingListEntryService().getByShoppingListId(listId.value),
      productInformationService().getAll(),
      userService().getAll(),
    ])

    list.value = l
    entries.value = e
    products.value = prodList
    users.value = userList

    const productIris = e.map((x) => x.productInformation)
    const userIris = e.map((x) => x.addedBy).filter(Boolean) as string[]

    await Promise.all([cache.fetchProducts(productIris), cache.fetchUsers(userIris)])

    currentUserIri.value = users.value[0]?.['@id'] ?? ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    list.value = null
    entries.value = []
    products.value = []
    users.value = []
    selectedProductIri.value = ''
    currentUserIri.value = ''
    quantity.value = null
  } finally {
    pending.value = false
  }
}

watch(listId, () => void load(), { immediate: true })

const breadcrumbs = computed(() => {
  return [
    { label: 'Shopping Lists', to: '/shopping-lists' },
    { label: list.value?.name ?? 'Liste' },
  ]
})

const rows = computed(() => {
  return entries.value.map((e) => {
    const p = cache.getProductCached(e.productInformation)
    const u = e.addedBy ? cache.getUserCached(e.addedBy) : null

    return {
      iri: getIri(e as unknown as HasIri),
      id: e.id,
      acquired: e.acquired,
      product: productLabel(p, e.productInformation),
      quantity: e.quantity,
      addedBy: u ? getUserLabel(u) : (e.addedBy ?? '—'),
    }
  })
})

const removeEntry = async (entry: ShoppingListEntry): Promise<void> => {
  const path = entryApiPath(entry.id)

  const prev = entries.value
  entries.value = entries.value.filter((x) => x.id !== entry.id)

  try {
    await shoppingListEntryService().remove(path)
  } catch (err) {
    entries.value = prev
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const toggleAcquired = async (entry: ShoppingListEntry): Promise<void> => {
  const path = entryApiPath(entry.id)

  const prev = entry.acquired
  entry.acquired = !entry.acquired

  try {
    await shoppingListEntryService().setAcquired(path, entry.acquired)
  } catch (err) {
    entry.acquired = prev
    error.value = err instanceof Error ? err.message : 'Unknown error'
  }
}

const addEntry = async (): Promise<void> => {
  if (!selectedProductIri.value) return
  if (!list.value) return

  adding.value = true
  addError.value = null

  try {
    const created = await shoppingListEntryService().create({
      shoppingList:
        getIri(list.value as unknown as HasIri) || `/api/shopping_lists/${list.value.id}`,
      productInformation: selectedProductIri.value,
      quantity: quantity.value || 1,
      addedBy: currentUserIri.value || undefined,
    })

    entries.value = [created, ...entries.value]
    await cache.fetchProducts([created.productInformation])
    if (created.addedBy) await cache.fetchUsers([created.addedBy])

    selectedProductIri.value = ''
    quantity.value = null
  } catch (err) {
    addError.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <div class="page">
    <AppBreadcrumbs :items="breadcrumbs" />

    <header class="header">
      <div class="titleWrap">
        <h1 class="h1">{{ list?.name ?? 'Shopping List' }}</h1>
        <p class="subtitle">{{ rows.length }} Einträge</p>
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
        <div class="skLine w65" />
      </div>
    </div>

    <div v-else class="stack">
      <section class="card">
        <div class="cardHeader">
          <div class="cardTitle">Eintrag hinzufügen</div>
        </div>

        <div class="formRow">
          <label class="label">
            Produkt
            <select v-model="selectedProductIri" class="select" :disabled="adding">
              <option value="">Bitte wählen…</option>
              <option v-for="p in products" :key="p['@id'] ?? p.name" :value="p['@id']">
                {{ p.name }}
              </option>
            </select>
          </label>

          <label class="label">
            Quantity
            <input
              v-model.number="quantity"
              class="input"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              :disabled="adding"
              placeholder="z.B. 2"
            />
          </label>

          <label class="label">
            Added by
            <select v-model="currentUserIri" class="select" :disabled="adding">
              <option value="">—</option>
              <option v-for="u in users" :key="getIri(u) || String(u.id)" :value="getIri(u)">
                {{ getUserLabel(u) }}
              </option>
            </select>
          </label>

          <button
            class="btnPrimary"
            type="button"
            :disabled="adding || !selectedProductIri"
            @click="addEntry"
          >
            {{ adding ? 'Hinzufügen…' : 'Hinzufügen' }}
          </button>
        </div>

        <div v-if="addError" class="hintError">{{ addError }}</div>
        <div v-else class="hint">Produkt wird über IRI aufgelöst, User ebenfalls.</div>
      </section>

      <section class="card">
        <div class="cardHeader">
          <div class="cardTitle">Inhalt</div>
          <div class="pill">{{ rows.length }}</div>
        </div>

        <div v-if="rows.length === 0" class="empty">
          <div class="emptyTitle">Noch keine Einträge</div>
          <div class="emptySub">
            Füge oben ein Produkt hinzu, dann erscheint es hier in der Tabelle.
          </div>
        </div>

        <div v-else class="tableWrap">
          <table class="table">
            <thead>
              <tr>
                <th class="thCheck">✓</th>
                <th>Produkt</th>
                <th class="thQty">Quantity</th>
                <th>Added by</th>
                <th class="thActions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, idx) in rows"
                :key="r.iri ?? r.id ?? idx"
                :class="{ isAcquired: r.acquired }"
              >
                <td class="cellCheck">
                  <button
                    class="checkBtn"
                    type="button"
                    :aria-label="
                      r.acquired ? 'Als nicht gekauft markieren' : 'Als gekauft markieren'
                    "
                    @click="toggleAcquired(entries[idx])"
                  >
                    <span class="checkDot" />
                  </button>
                </td>

                <td>
                  <div class="prodName">{{ r.product }}</div>
                </td>

                <td class="cellQty">{{ r.quantity ?? '—' }}</td>

                <td class="cellMuted">{{ r.addedBy }}</td>

                <td class="cellActions">
                  <button class="btnGhost" type="button" @click="removeEntry(entries[idx])">
                    Löschen
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
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

.stack {
  display: grid;
  gap: 12px;
}

.card {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 12px;
  box-shadow: var(--shadow-elevated);
  display: grid;
  gap: 12px;
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

.pill {
  min-width: 28px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 12px;
  background: var(--color-primary-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.formRow {
  display: grid;
  gap: 10px;
}

@media (min-width: 860px) {
  .formRow {
    grid-template-columns: 1fr 1fr 1fr auto;
    align-items: end;
  }
}

.label {
  display: grid;
  gap: 6px;
  font-weight: 800;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.select {
  height: 40px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-white);
  border-radius: 12px;
  padding: 0 10px;
  color: var(--color-text-primary);
  font-weight: 700;
  width: 100%;
  min-width: 0;
}

.input {
  height: 40px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-white);
  border-radius: 12px;
  padding: 0 10px;
  color: var(--color-text-primary);
  font-weight: 700;
  width: 100%;
  min-width: 0;
}

.btnPrimary {
  height: 40px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-light);
  border-radius: 12px;
  padding: 0 14px;
  cursor: pointer;
  font-weight: 900;
  color: var(--color-text-primary);
}

.btnPrimary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.hintError {
  font-size: 12px;
  color: var(--color-error);
  font-weight: 800;
}

.tableWrap {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  -webkit-overflow-scrolling: touch;
}

.table {
  width: 100%;
  min-width: 840px;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

.table th {
  text-align: left;
  padding: 10px 12px;
  background: var(--color-bg-light);
  color: var(--color-text-secondary);
  font-weight: 900;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.table th,
.table td {
  padding: 10px 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.table tbody tr:hover td {
  background: var(--color-primary-soft);
}

.cellMuted {
  color: var(--color-text-secondary);
  font-weight: 700;
}

.thActions,
.cellActions {
  width: 110px;
}

.thQty,
.cellQty {
  width: 110px;
}

.cellQty {
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.cellActions {
  padding: 8px 12px;
  text-align: left;
  white-space: nowrap;
}

.btnGhost {
  border: 1px solid var(--color-border);
  background: var(--color-bg-white);
  border-radius: 12px;
  padding: 8px 10px;
  cursor: pointer;
  font-weight: 900;
  color: var(--color-text-primary);
}

.btnGhost:hover {
  background: var(--color-bg-light);
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
.w65 {
  width: 65%;
}
.w70 {
  width: 70%;
}
.w85 {
  width: 85%;
}

.prodName {
  font-weight: 900;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.thCheck,
.cellCheck {
  width: 56px;
}

.cellCheck {
  padding: 8px;
}

.checkBtn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.checkBtn:hover {
  background: var(--color-bg-light);
}

.checkDot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid var(--color-border);
  background: transparent;
}

.isAcquired .checkDot {
  border-color: var(--color-success);
  background: var(--color-success);
}

.isAcquired .prodName {
  text-decoration: line-through;
  opacity: 0.75;
}

.isAcquired td {
  opacity: 0.95;
}
</style>
