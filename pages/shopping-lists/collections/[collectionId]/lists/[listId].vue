<script setup lang="ts">
import type { ProductInformation } from '@/types/api/products/productInformation'
import type { ShoppingList } from '@/types/api/shoppingList/shoppingList'
import type { ShoppingListEntry } from '@/types/api/shoppingList/shoppingListEntry'
import type { User } from '@/types/api/users/user'

import { useI18n } from '#imports'
import { productInformationService } from '@/modules/catalog/services/productInformationService'
import { shoppingListCollectionService } from '@/modules/shoppingList/services/shoppingListCollectionService'
import { shoppingListEntryService } from '@/modules/shoppingList/services/shoppingListEntryService'
import { shoppingListService } from '@/modules/shoppingList/services/shoppingListService'
import { userService } from '@/modules/user/services/userService'

const route = useRoute()
const { t } = useI18n()

const collectionId = computed(() => {
  const raw = route.params.collectionId
  const value = Array.isArray(raw) ? raw[0] : raw
  return Number(value)
})

const collectionName = ref<string | null>(null)

const loadCollection = async (): Promise<void> => {
  try {
    const c = await shoppingListCollectionService().getById(collectionId.value)
    collectionName.value = c.name ?? null
  } catch {
    collectionName.value = null
  }
}

const listId = computed(() => {
  const raw = route.params.listId
  const value = Array.isArray(raw) ? raw[0] : raw
  return Number(value)
})

type HasIri = { '@id'?: string }
type EmbeddedUser = {
  username?: string | null
  email?: string | null
  name?: string | null
  displayName?: string | null
} & HasIri
type EmbeddedProductInformation = { productName?: string | null } & HasIri

const getIri = (entity: HasIri | null | undefined): string => entity?.['@id'] ?? ''
const entryApiPathFromEntry = (entry: ShoppingListEntry): string => {
  const iri = getIri(entry as unknown as HasIri)
  if (iri) return iri

  const anyEntry = entry as unknown as { id?: number }
  if (typeof anyEntry.id === 'number') return `/api/shopping_list_entries/${anyEntry.id}`

  throw new Error('ShoppingListEntry hat weder @id noch id')
}

const shoppingListIri = computed(() => {
  if (!list.value) return ''
  return getIri(list.value as unknown as HasIri) || `/api/shopping_lists/${list.value.id}`
})

const list = ref<ShoppingList | null>(null)
const entries = ref<ShoppingListEntry[]>([])
const products = ref<ProductInformation[]>([])
const users = ref<User[]>([])
const currentUserIri = ref<string>('')

const usersByIri = computed(() => {
  const map = new Map<string, User>()
  for (const u of users.value) {
    const iri = getIri(u)
    if (iri) map.set(iri, u)
  }
  return map
})

const pending = ref(false)
const error = ref<string | null>(null)

const adding = ref(false)
const addError = ref<string | null>(null)

const selectedProductIri = ref<string>('')
const quantity = ref<number | null>(1)

const pickString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

const getUserLabel = (u: User): string => {
  const maybe = u as unknown as Record<string, unknown>

  return (
    pickString(maybe.username) ??
    pickString(maybe.displayName) ??
    pickString(maybe.name) ??
    pickString(maybe.email) ??
    pickString(getIri(u)) ??
    '—'
  )
}

const userLabelFromEntry = (u: string | EmbeddedUser | null | undefined): string => {
  if (!u) return '—'

  if (typeof u !== 'string') {
    return u.username ?? u.displayName ?? u.name ?? u.email ?? getIri(u) ?? '—'
  }

  const fromCache = usersByIri.value.get(u)
  if (fromCache) return getUserLabel(fromCache)

  const match = u.match(/\/(\d+)\/?$/)
  if (!match) return u
  return `User #${match[1]}`
}

const productLabelFromEntry = (
  p: string | EmbeddedProductInformation | null | undefined,
): string => {
  if (!p) return '—'
  if (typeof p === 'string') return p
  return p.productName ?? getIri(p) ?? '—'
}

const productOptionLabel = (p: ProductInformation): string => {
  const maybe = p as unknown as { productName?: string | null; name?: string | null }
  return maybe.productName ?? maybe.name ?? getIri(p) ?? '—'
}

const localePath = useLocalePath()

const breadcrumbs = computed(() => [
  {
    label: collectionName.value ?? '…',
    to: localePath(`/shopping-lists/collections/${collectionId.value}`),
  },
  {
    label: list.value?.name ?? '…',
  },
])

const load = async (): Promise<void> => {
  pending.value = true
  error.value = null
  addError.value = null

  try {
    const [l, prodList, userList] = await Promise.all([
      shoppingListService().getById(listId.value),
      productInformationService().getAll(),
      userService().getAll(),
    ])

    list.value = l

    const raw = (l.shoppingListEntries ?? []) as unknown[]
    entries.value = raw.filter((x): x is ShoppingListEntry => typeof x === 'object' && x !== null)

    products.value = prodList
    users.value = userList
    currentUserIri.value = getIri(users.value[0]) ?? ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('errors.unknown')
    list.value = null
    entries.value = []
    products.value = []
    users.value = []
    currentUserIri.value = ''
    selectedProductIri.value = ''
    quantity.value = 1
  } finally {
    pending.value = false
  }
}

watch(listId, () => void load(), { immediate: true })
watch(collectionId, () => void loadCollection(), { immediate: true })

const rows = computed(() => {
  return entries.value.map((e) => {
    const prod = e.productInformation as unknown as
      | string
      | EmbeddedProductInformation
      | null
      | undefined
    const by = e.addedBy as unknown as string | EmbeddedUser | null | undefined

    return {
      entry: e,
      iri: getIri(e as unknown as HasIri),
      id: e.id,
      acquired: e.acquired,
      product: productLabelFromEntry(prod),
      quantity: e.quantity,
      addedBy: userLabelFromEntry(by),
    }
  })
})

const removeEntry = async (entry: ShoppingListEntry): Promise<void> => {
  const prev = entries.value
  entries.value = entries.value.filter((x) => x !== entry)

  try {
    const path = entryApiPathFromEntry(entry)
    await shoppingListEntryService().remove(path)
  } catch (err) {
    entries.value = prev
    error.value = err instanceof Error ? err.message : t('errors.unknown')
  }
}

const toggleAcquired = async (entry: ShoppingListEntry): Promise<void> => {
  const prev = entry.acquired
  entry.acquired = !entry.acquired

  try {
    const path = entryApiPathFromEntry(entry)
    await shoppingListEntryService().setAcquired(path, entry.acquired)
  } catch (err) {
    entry.acquired = prev
    error.value = err instanceof Error ? err.message : t('errors.unknown')
  }
}

const addEntry = async (): Promise<void> => {
  if (!list.value) return
  if (!selectedProductIri.value) return

  adding.value = true
  addError.value = null

  try {
    await shoppingListEntryService().create({
      shoppingList: shoppingListIri.value,
      productInformation: selectedProductIri.value,
      quantity: typeof quantity.value === 'number' ? quantity.value : 1,
      addedBy: currentUserIri.value || undefined,
      acquired: false,
    })

    selectedProductIri.value = ''
    quantity.value = 1

    await load()
  } catch (err) {
    addError.value = err instanceof Error ? err.message : t('errors.unknown')
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
      </div>
    </header>

    <div v-if="error" class="stateCard">
      <div class="stateTitle">{{ t('shoppingLists.state.errorTitle') }}</div>
      <div class="stateMsg">{{ error }}</div>
      <button class="retry" type="button" @click="load">
        {{ t('shoppingLists.state.retry') }}
      </button>
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
          <div class="cardTitle">{{ t('shoppingLists.list.addEntry.title') }}</div>
        </div>

        <div class="formRow">
          <label class="label">
            {{ t('shoppingLists.list.addEntry.product') }}
            <select v-model="selectedProductIri" class="select" :disabled="adding">
              <option value="">{{ t('shoppingLists.list.addEntry.productPlaceholder') }}</option>
              <option
                v-for="p in products"
                :key="getIri(p) || String((p as any).id)"
                :value="getIri(p) || `/api/product_informations/${(p as any).id}`"
              >
                {{ productOptionLabel(p) }}
              </option>
            </select>
          </label>

          <label class="label">
            {{ t('shoppingLists.list.content.table.quantity') }}
            <input
              v-model.number="quantity"
              class="input"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              :disabled="adding"
            />
          </label>

          <label class="label">
            {{ t('shoppingLists.list.content.table.addedBy') }}
            <select v-model="currentUserIri" class="select" :disabled="adding">
              <option value="">—</option>
              <option
                v-for="u in users"
                :key="getIri(u) || String((u as any).id)"
                :value="getIri(u)"
              >
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
            {{
              adding
                ? t('shoppingLists.list.addEntry.addingButton')
                : t('shoppingLists.list.addEntry.addButton')
            }}
          </button>
        </div>

        <div v-if="addError" class="hintError">{{ addError }}</div>
        <div v-else class="hint">{{ t('shoppingLists.list.addEntry.hint') }}</div>
      </section>

      <section class="card">
        <div class="cardHeader">
          <div class="cardTitle">{{ t('shoppingLists.list.content.title') }}</div>
          <div class="pill">{{ rows.length }}</div>
        </div>

        <div v-if="rows.length === 0" class="empty">
          <div class="emptyTitle">{{ t('shoppingLists.list.content.emptyTitle') }}</div>
          <div class="emptySub">{{ t('shoppingLists.list.content.emptySubtitle') }}</div>
        </div>

        <div v-else class="tableWrap">
          <table class="table">
            <thead>
              <tr>
                <th class="thCheck">✓</th>
                <th>{{ t('shoppingLists.list.content.table.product') }}</th>
                <th class="thQty">{{ t('shoppingLists.list.content.table.quantity') }}</th>
                <th>{{ t('shoppingLists.list.content.table.addedBy') }}</th>
                <th class="thActions" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in rows"
                :key="r.iri ?? String(r.id)"
                :class="{ isAcquired: r.acquired }"
              >
                <td class="cellCheck">
                  <button
                    class="checkBtn"
                    type="button"
                    :aria-label="
                      r.acquired
                        ? t('shoppingLists.list.content.aria.markNotAcquired')
                        : t('shoppingLists.list.content.aria.markAcquired')
                    "
                    @click="toggleAcquired(r.entry)"
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
                  <button
                    class="iconBtn"
                    type="button"
                    :aria-label="t('shoppingLists.list.content.aria.deleteEntry')"
                    @click="removeEntry(r.entry)"
                  >
                    <Icon name="lucide:x" size="18" />
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

.select,
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

.thActions,
.cellActions {
  width: 64px;
}

.thQty,
.cellQty {
  width: 110px;
}

.cellQty {
  text-align: center;
  font-variant-numeric: tabular-nums;
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

.prodName {
  font-weight: 900;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cellMuted {
  color: var(--color-text-secondary);
  font-weight: 700;
}

.iconBtn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.iconBtn:hover {
  background: var(--color-bg-light);
  color: var(--color-error);
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

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
