<script setup lang="ts">
import type { ShoppingListDetailVM } from '~/modules/shoppingList/types/viewModels'
import type { ProductInformation } from '~/types/api/products/productInformation'

import { productInformationService } from '~/modules/catalog/services/productInformationService'
import { shoppingListEntryService } from '~/modules/shoppingList/services/shoppingListEntryService'
import { loadShoppingListDetail } from '~/modules/shoppingList/useCases/loadShoppingListDetail'

const route = useRoute()

const id = computed(() => {
  const raw = route.params.id
  const value = Array.isArray(raw) ? raw[0] : raw
  return Number(value)
})

const listIri = computed(() => `/api/shopping_lists/${id.value}`)

const state = ref<ShoppingListDetailVM | null>(null)
const error = ref<string | null>(null)
const pending = ref(false)

const products = ref<ProductInformation[]>([])
const productsPending = ref(false)
const productsError = ref<string | null>(null)

const selectedProductIri = ref<string>('')

const adding = ref(false)
const addError = ref<string | null>(null)

const reload = async (): Promise<void> => {
  pending.value = true
  error.value = null
  try {
    state.value = await loadShoppingListDetail(listIri.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    state.value = null
  } finally {
    pending.value = false
  }
}

const loadProducts = async (): Promise<void> => {
  productsPending.value = true
  productsError.value = null
  try {
    products.value = await productInformationService().getAll()
    if (selectedProductIri.value.length === 0) {
      const first = products.value.at(0)
      if (first) {
        selectedProductIri.value = first['@id']
      }
    }
  } catch (e) {
    productsError.value = e instanceof Error ? e.message : 'Unknown error'
    products.value = []
  } finally {
    productsPending.value = false
  }
}

const addEntry = async (): Promise<void> => {
  addError.value = null

  const productIri = selectedProductIri.value
  if (productIri.length === 0) {
    addError.value = 'Please select a product.'
    return
  }

  adding.value = true
  try {
    await shoppingListEntryService().create({
      shoppingList: listIri.value,
      productInformation: productIri,
    })
    await reload()
  } catch (e) {
    addError.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    adding.value = false
  }
}

onMounted(() => {
  void reload()
  void loadProducts()
})
</script>

<template>
  <div>
    <div v-if="error">
      <p>{{ error }}</p>
      <button type="button" @click="reload">Retry</button>
    </div>

    <div v-else-if="pending || !state">
      <p>Loading…</p>
    </div>

    <div v-else>
      <h1>{{ state.list.name }}</h1>

      <div>
        <h2>Add item</h2>

        <p v-if="productsError">{{ productsError }}</p>
        <p v-else-if="productsPending">Loading products…</p>

        <div v-else>
          <select v-model="selectedProductIri">
            <option v-for="p in products" :key="p['@id']" :value="p['@id']">
              {{ p.name }}
            </option>
          </select>

          <button type="button" :disabled="adding" @click="addEntry">
            {{ adding ? 'Adding…' : 'Add' }}
          </button>

          <p v-if="addError">{{ addError }}</p>
        </div>
      </div>

      <h2>Items</h2>

      <ul v-if="state.entries.length > 0">
        <li v-for="row in state.entries" :key="row.entry.id">
          {{ row.product.name }}
        </li>
      </ul>

      <p v-else>No entries yet.</p>
    </div>
  </div>
</template>
