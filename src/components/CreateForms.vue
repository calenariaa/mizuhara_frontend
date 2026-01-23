<template>
  <div>
    <!-- Floating Action Buttons -->
    <div class="fab-container">
      <button class="fab" @click="openModal('collection')" title="New Collection">
        <span class="icon">📁</span>
      </button>
      <button class="fab" @click="openModal('list')" title="New Shopping List">
        <span class="icon">📝</span>
      </button>
      <button 
        class="fab" 
        @click="openModal('entry')" 
        title="Add Item"
        :disabled="!hasShoppingLists"
      >
        <span class="icon">➕</span>
      </button>
    </div>

    <!-- Modal Overlay -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <!-- Collection Form -->
          <div v-if="modalType === 'collection'" class="form-container">
            <h2 class="modal-title">📁 Create Collection</h2>
            <p class="modal-description">A collection groups related shopping lists together</p>
            
            <form @submit.prevent="createCollection">
              <div class="form-group">
                <label for="collection-name">Collection Name *</label>
                <input
                  id="collection-name"
                  v-model="collectionForm.name"
                  type="text"
                  placeholder="e.g., Family Shopping"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="collection-description">Description</label>
                <textarea
                  id="collection-description"
                  v-model="collectionForm.description"
                  placeholder="Optional description..."
                  rows="3"
                  class="form-input"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="collection-owner">Owner *</label>
                <select 
                  id="collection-owner" 
                  v-model="collectionForm.ownerId" 
                  required
                  class="form-input"
                >
                  <option value="">Select owner...</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.name || user.email }}
                  </option>
                </select>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeModal" class="btn-secondary">
                  Cancel
                </button>
                <button type="submit" class="btn-primary" :disabled="saving">
                  {{ saving ? 'Creating...' : 'Create Collection' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Shopping List Form -->
          <div v-else-if="modalType === 'list'" class="form-container">
            <h2 class="modal-title">📝 Create Shopping List</h2>
            <p class="modal-description">Add a new shopping list to organize your items</p>
            
            <form @submit.prevent="createList">
              <div class="form-group">
                <label for="list-name">List Name *</label>
                <input
                  id="list-name"
                  v-model="listForm.name"
                  type="text"
                  placeholder="e.g., Weekly Groceries"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="list-collection">Collection (Optional)</label>
                <select 
                  id="list-collection" 
                  v-model="listForm.collectionId"
                  class="form-input"
                >
                  <option value="">No collection</option>
                  <option v-for="col in collections" :key="col.id" :value="col.id">
                    {{ col.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="list-added-by">Added By</label>
                <select 
                  id="list-added-by" 
                  v-model="listForm.addedById"
                  class="form-input"
                >
                  <option value="">Select user...</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.name || user.email }}
                  </option>
                </select>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeModal" class="btn-secondary">
                  Cancel
                </button>
                <button type="submit" class="btn-primary" :disabled="saving">
                  {{ saving ? 'Creating...' : 'Create List' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Entry Form -->
          <div v-else-if="modalType === 'entry'" class="form-container">
            <h2 class="modal-title">➕ Add Item</h2>
            <p class="modal-description">Add a product to your shopping list</p>
            
            <form @submit.prevent="createEntry">
              <div class="form-group">
                <label for="entry-list">Shopping List *</label>
                <select 
                  id="entry-list" 
                  v-model="entryForm.shoppingListId" 
                  required
                  class="form-input"
                >
                  <option value="">Select list...</option>
                  <option v-for="list in shoppingLists" :key="list.id" :value="list.id">
                    {{ list.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="entry-product">Product *</label>
                <div class="product-input-group">
                  <select 
                    v-if="products.length > 0"
                    id="entry-product" 
                    v-model="entryForm.productId" 
                    required
                    class="form-input"
                  >
                    <option value="">Select product...</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                      {{ product.name }}
                    </option>
                  </select>
                  <p v-else class="no-products-message">
                    ⚠️ No products available. Please create products in EasyAdmin first.
                  </p>
                </div>
              </div>

              <div class="form-group">
                <label for="entry-added-by">Added By</label>
                <select 
                  id="entry-added-by" 
                  v-model="entryForm.addedById"
                  class="form-input"
                >
                  <option value="">Select user...</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.name || user.email }}
                  </option>
                </select>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeModal" class="btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn-primary" 
                  :disabled="saving || products.length === 0"
                >
                  {{ saving ? 'Adding...' : 'Add Item' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { shoppingListService } from '@/services/shoppingListService'
import type { ShoppingList, ShoppingListCollection } from '@/types/shoppingList'

const emit = defineEmits(['created'])

// Modal state
const showModal = ref(false)
const modalType = ref<'collection' | 'list' | 'entry'>('collection')
const saving = ref(false)

// Data
const collections = ref<ShoppingListCollection[]>([])
const shoppingLists = ref<ShoppingList[]>([])
const users = ref<any[]>([])
const products = ref<any[]>([])

// Forms
const collectionForm = ref({
  name: '',
  description: '',
  ownerId: ''
})

const listForm = ref({
  name: '',
  collectionId: '',
  addedById: ''
})

const entryForm = ref({
  shoppingListId: '',
  productId: '',
  addedById: ''
})

// Computed
const hasShoppingLists = computed(() => shoppingLists.value.length > 0)

// Methods
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
      shoppingListService.getProducts()
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
      owner: `/api/users/${collectionForm.value.ownerId}`
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
      addedBy: listForm.value.addedById 
        ? `/api/users/${listForm.value.addedById}` 
        : undefined
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
      addedBy: entryForm.value.addedById 
        ? `/api/users/${entryForm.value.addedById}` 
        : undefined
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

<style scoped>
/* Floating Action Buttons */
.fab-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 100;
}

.fab {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6);
}

.fab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #9ca3af;
}

.fab .icon {
  font-size: 1.5rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-container {
  padding: 2rem;
}

.modal-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-description {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Form */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.product-input-group {
  position: relative;
}

.no-products-message {
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  color: #92400e;
  font-size: 0.875rem;
  margin: 0;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>