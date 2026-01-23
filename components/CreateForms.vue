<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { ShoppingList, ShoppingListCollection } from '~/types/api/shoppingList/shoppingList'

import { shoppingListService } from '~/services/shoppingListService'

type UserOption = { id: number; name?: string; email?: string }
type ProductOption = { id: number; name: string }

const emit = defineEmits<{
  (e: 'created'): void
}>()

const showModal = ref(false)
const modalType = ref<'collection' | 'list' | 'entry'>('collection')
const saving = ref(false)

const collections = ref<ShoppingListCollection[]>([])
const shoppingLists = ref<ShoppingList[]>([])
const users = ref<UserOption[]>([])
const products = ref<ProductOption[]>([])

const collectionForm = ref({
  name: '',
  description: '',
  ownerId: '',
})

const listForm = ref({
  name: '',
  collectionId: '',
  addedById: '',
})

const entryForm = ref({
  shoppingListId: '',
  productId: '',
  addedById: '',
})

const hasShoppingLists = computed(() => shoppingLists.value.length > 0)

const openModal = (type: 'collection' | 'list' | 'entry') => {
  modalType.value = type
  showModal.value = true
  resetForms()
}

const closeModal = () => {
  showModal.value = false
  resetForms()
}

const resetForms = () => {
  collectionForm.value = { name: '', description: '', ownerId: '' }
  listForm.value = { name: '', collectionId: '', addedById: '' }
  entryForm.value = { shoppingListId: '', productId: '', addedById: '' }
}

const loadData = async () => {
  try {
    const [collectionsData, listsData, usersData, productsData] = await Promise.all([
      shoppingListService.getCollections(),
      shoppingListService.getShoppingLists(),
      shoppingListService.getUsers(),
      shoppingListService.getProducts(),
    ])

    collections.value = collectionsData
    shoppingLists.value = listsData
    users.value = usersData
    products.value = productsData
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const createCollection = async () => {
  try {
    saving.value = true
    await shoppingListService.createCollection({
      name: collectionForm.value.name,
      description: collectionForm.value.description || undefined,
      owner: `/api/users/${collectionForm.value.ownerId}`,
    })

    closeModal()
    emit('created')
    await loadData()
  } catch (error) {
    console.error('Error creating collection:', error)
    alert('Failed to create collection. Check console for details.')
  } finally {
    saving.value = false
  }
}

const createList = async () => {
  try {
    saving.value = true
    await shoppingListService.createShoppingList({
      name: listForm.value.name,
      shoppingListCollection: listForm.value.collectionId
        ? `/api/shopping_list_collections/${listForm.value.collectionId}`
        : undefined,
      addedBy: listForm.value.addedById ? `/api/users/${listForm.value.addedById}` : undefined,
    })

    closeModal()
    emit('created')
    await loadData()
  } catch (error) {
    console.error('Error creating list:', error)
    alert('Failed to create shopping list. Check console for details.')
  } finally {
    saving.value = false
  }
}

const createEntry = async () => {
  try {
    saving.value = true
    await shoppingListService.createShoppingListEntry({
      shoppingList: `/api/shopping_lists/${entryForm.value.shoppingListId}`,
      productInformation: `/api/product_informations/${entryForm.value.productId}`,
      addedBy: entryForm.value.addedById ? `/api/users/${entryForm.value.addedById}` : undefined,
    })

    closeModal()
    emit('created')
    await loadData()
  } catch (error) {
    console.error('Error creating entry:', error)
    alert('Failed to add item. Check console for details.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
