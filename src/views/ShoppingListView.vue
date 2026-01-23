<template>
  <div class="shopping-list-container">
    <!-- Header -->
    <header class="header">
      <h1 class="title">🛒 Shopping Lists</h1>
      <button class="btn-primary" @click="refreshLists">
        <span class="icon">↻</span> Refresh
      </button>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading your shopping lists...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <span class="icon">⚠️</span>
      <p>{{ error }}</p>
      <button class="btn-secondary" @click="refreshLists">Try Again</button>
    </div>

    <!-- Shopping Lists -->
    <div v-else class="lists-grid">
      <div
        v-for="list in shoppingLists"
        :key="list.id"
        class="list-card"
        :class="{ 'all-checked': isAllChecked(list) }"
      >
        <!-- Card Header -->
        <div class="card-header">
          <h2 class="list-name">{{ list.name }}</h2>
          <div class="list-meta">
            <span v-if="list.addedBy" class="added-by">
              👤 {{ list.addedBy.name }}
            </span>
            <span class="item-count">
              {{ checkedCount(list) }} / {{ list.shoppingListEntries.length }} items
            </span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${progressPercentage(list)}%` }"
          ></div>
        </div>

        <!-- Shopping List Entries -->
        <ul class="entries-list">
          <li
            v-for="entry in list.shoppingListEntries"
            :key="entry.id"
            class="entry-item"
            :class="{ checked: entry.checked }"
          >
            <label class="entry-label">
              <input
                type="checkbox"
                v-model="entry.checked"
                class="entry-checkbox"
              />
              <span class="checkbox-custom"></span>
              <div class="entry-content">
                <span class="product-name">
                  {{ entry.productInformation.name }}
                </span>
                <span v-if="entry.productInformation.category" class="product-category">
                  {{ entry.productInformation.category }}
                </span>
              </div>
            </label>
            <span v-if="entry.addedBy" class="entry-meta">
              by {{ entry.addedBy.name }}
            </span>
          </li>
        </ul>

        <!-- Empty State -->
        <div v-if="list.shoppingListEntries.length === 0" class="empty-state">
          <span class="icon">📝</span>
          <p>No items yet. Start adding products!</p>
        </div>
      </div>
    </div>

    <!-- Empty State for no lists -->
    <div v-if="!loading && !error && shoppingLists.length === 0" class="empty-state-main">
      <span class="icon">🛍️</span>
      <h2>No Shopping Lists Yet</h2>
      <p>Create your first shopping list to get started!</p>
      <p class="hint">Use the buttons in the bottom-right corner ↘️</p>
    </div>

    <!-- Create Forms Component -->
    <CreateForms @created="handleCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { shoppingListService } from '@/services/shoppingListService'
import type { ShoppingList } from '@/types/shoppingList'
import CreateForms from '@/components/CreateForms.vue'

const shoppingLists = ref<ShoppingList[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchShoppingLists = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await shoppingListService.getShoppingLists()
    
    // Handle undefined or null response
    if (!data || !Array.isArray(data)) {
      shoppingLists.value = []
      return
    }
    
    shoppingLists.value = data
    
    // Initialize checked state for entries
    shoppingLists.value.forEach(list => {
      // Initialize shoppingListEntries if undefined
      if (!list.shoppingListEntries) {
        list.shoppingListEntries = []
      }
      list.shoppingListEntries.forEach(entry => {
        entry.checked = false
      })
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load shopping lists'
    console.error('Error fetching shopping lists:', err)
  } finally {
    loading.value = false
  }
}

const refreshLists = () => {
  fetchShoppingLists()
}

const handleCreated = () => {
  // Refresh the list when something is created
  fetchShoppingLists()
}

const checkedCount = (list: ShoppingList): number => {
  return list.shoppingListEntries.filter(entry => entry.checked).length
}

const progressPercentage = (list: ShoppingList): number => {
  if (list.shoppingListEntries.length === 0) return 0
  return (checkedCount(list) / list.shoppingListEntries.length) * 100
}

const isAllChecked = (list: ShoppingList): boolean => {
  return (
    list.shoppingListEntries.length > 0 &&
    checkedCount(list) === list.shoppingListEntries.length
  )
}

onMounted(() => {
  fetchShoppingLists()
})
</script>

<style scoped>
.shopping-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: #991b1b;
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.list-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  border: 2px solid transparent;
}

.list-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.list-card.all-checked {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.card-header {
  margin-bottom: 1rem;
}

.list-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.list-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.added-by {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.item-count {
  font-weight: 600;
  color: #4f46e5;
}

.progress-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
  transition: width 0.3s ease;
}

.all-checked .progress-fill {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.entries-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.entry-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
}

.entry-item:hover {
  background: #f9fafb;
}

.entry-item.checked {
  opacity: 0.6;
}

.entry-item.checked .product-name {
  text-decoration: line-through;
  color: #9ca3af;
}

.entry-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
}

.entry-checkbox {
  display: none;
}

.checkbox-custom {
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.entry-checkbox:checked + .checkbox-custom {
  background: #4f46e5;
  border-color: #4f46e5;
}

.entry-checkbox:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.entry-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 600;
  color: #1a1a1a;
}

.product-category {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.entry-meta {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
}

.empty-state,
.empty-state-main {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.empty-state .icon,
.empty-state-main .icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.empty-state-main {
  margin-top: 4rem;
}

.empty-state-main h2 {
  color: #1a1a1a;
  margin: 1rem 0 0.5rem;
}

.hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

.icon {
  display: inline-block;
}
</style>