<script setup lang="ts">
import type { ShoppingListCollection } from '@/types/api/shoppingList/shoppingListCollection'
import type { User } from '@/types/api/users/user'

import { useI18n, useLocalePath } from '#imports'
import { useBackendReconnect, useMockApiMode } from '@/composables/api/useMockApi'
import { shoppingListCollectionService } from '@/modules/shoppingList/services/shoppingListCollectionService'
import { userService } from '@/modules/user/services/userService'
import { getIri, getNumericIdFromIri } from '@/services/resource/iri'

const { t } = useI18n()
const localePath = useLocalePath()
const mockApiMode = useMockApiMode()
const { retryBackendConnection } = useBackendReconnect()

const collections = ref<ShoppingListCollection[]>([])
const users = ref<User[]>([])
const errorMessage = ref<string | null>(null)
const isLoading = ref(false)
const isCreating = ref(false)
const createError = ref<string | null>(null)
const newCollectionName = ref('')
const newCollectionDescription = ref('')
const newCollectionOwnerIri = ref('')

const collectionNumericId = (c: ShoppingListCollection): number | null => {
  if (typeof c.id === 'number') return c.id
  return getNumericIdFromIri(c['@id'] ?? '')
}

const collectionKey = (c: ShoppingListCollection): string => {
  return c['@id'] ?? String(collectionNumericId(c) ?? 'unknown')
}

const userLabel = (user: User): string => user.username || user.email || getIri(user) || 'User'

type CollectionCard = {
  key: string
  name: string
  listCount: number
  detailPath?: string
  hasLists: boolean
}

const collectionCards = computed<CollectionCard[]>(() =>
  collections.value.map((collection) => {
    const key = collectionKey(collection)
    const numericId = collectionNumericId(collection)
    const detailPath = numericId === null ? undefined : `/shopping-lists/collections/${numericId}`
    const listCount = (collection.shoppingLists ?? []).length

    return {
      key,
      name: collection.name,
      listCount,
      detailPath,
      hasLists: listCount > 0,
    }
  }),
)

const loadCollections = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const [collectionList, userList] = await Promise.all([
      shoppingListCollectionService().getAll(),
      userService().getAll(),
    ])

    collections.value = collectionList
    users.value = userList
    newCollectionOwnerIri.value ||= getIri(userList[0]) || ''
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : t('errors.unknown')
    collections.value = []
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const refreshCollections = async (): Promise<void> => {
  if (mockApiMode.value === 'fallback') {
    await retryBackendConnection()
  }

  await loadCollections()
}

const createCollection = async (): Promise<void> => {
  const name = newCollectionName.value.trim()
  const description = newCollectionDescription.value.trim()

  if (!name || !newCollectionOwnerIri.value) return

  isCreating.value = true
  createError.value = null

  try {
    const created = await shoppingListCollectionService().create({
      name,
      description: description || undefined,
      owner: newCollectionOwnerIri.value,
    })

    collections.value = [created, ...collections.value]
    newCollectionName.value = ''
    newCollectionDescription.value = ''
  } catch (err) {
    createError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isCreating.value = false
  }
}

onMounted(() => {
  void loadCollections()
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
        :disabled="isLoading"
        :aria-label="t('shoppingLists.collections.actions.refreshAria')"
        @click="refreshCollections"
      >
        <Icon :name="isLoading ? 'ph:spinner-gap' : 'ph:arrow-clockwise'" class="refreshIcon" />
      </button>
    </header>

    <form class="createPanel" @submit.prevent="createCollection">
      <div class="createHeader">
        <div class="createTitle">{{ t('shoppingLists.collections.create.title') }}</div>
      </div>

      <div class="formGrid">
        <label class="field">
          <span>{{ t('shoppingLists.collections.create.nameLabel') }}</span>
          <input
            v-model="newCollectionName"
            class="input"
            type="text"
            :placeholder="t('shoppingLists.collections.create.namePlaceholder')"
            :disabled="isCreating"
          />
        </label>

        <label class="field">
          <span>{{ t('shoppingLists.collections.create.ownerLabel') }}</span>
          <select v-model="newCollectionOwnerIri" class="input" :disabled="isCreating">
            <option value="">{{ t('shoppingLists.collections.create.ownerPlaceholder') }}</option>
            <option v-for="user in users" :key="getIri(user) || String(user.id)" :value="getIri(user)">
              {{ userLabel(user) }}
            </option>
          </select>
        </label>

        <label class="field fieldWide">
          <span>{{ t('shoppingLists.collections.create.descriptionLabel') }}</span>
          <input
            v-model="newCollectionDescription"
            class="input"
            type="text"
            :placeholder="t('shoppingLists.collections.create.descriptionPlaceholder')"
            :disabled="isCreating"
          />
        </label>
      </div>

      <div class="createActions">
        <div v-if="createError" class="formError">{{ createError }}</div>
        <button
          class="createButton"
          type="submit"
          :disabled="isCreating || !newCollectionName.trim() || !newCollectionOwnerIri"
        >
          {{
            isCreating
              ? t('shoppingLists.collections.create.creatingButton')
              : t('shoppingLists.collections.create.submitButton')
          }}
        </button>
      </div>
    </form>

    <div v-if="errorMessage" class="error">
      <div class="errorTitle">{{ t('shoppingLists.state.errorTitle') }}</div>
      <div class="errorMsg">{{ errorMessage }}</div>
      <button class="retry" type="button" @click="refreshCollections">
        {{ t('shoppingLists.state.retry') }}
      </button>
    </div>

    <div v-else-if="isLoading" class="loadingCard">
      <div class="loadingTitle">{{ t('shoppingLists.collections.state.loadingTitle') }}</div>
      <div class="loadingSub">{{ t('shoppingLists.collections.state.loadingSubtitle') }}</div>
    </div>

    <div v-else class="grid">
      <article v-for="collection in collectionCards" :key="collection.key" class="card">
        <div class="cardHeader">
          <div class="cardTitle">{{ collection.name }}</div>
          <div class="badge">{{ collection.listCount }}</div>
        </div>

        <div class="actions">
          <NuxtLink
            v-if="collection.detailPath"
            class="linkPrimary"
            :to="localePath(collection.detailPath)"
          >
            {{ t('shoppingLists.collections.actions.openCollection') }}
          </NuxtLink>

          <span v-else class="mutedSmall">
            {{ t('errors.unknown') }}
          </span>

          <span v-if="!collection.hasLists" class="mutedSmall">
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

.createPanel {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 14px;
  box-shadow: var(--shadow-elevated);
  display: grid;
  gap: 12px;
}

.createHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.createTitle {
  font-weight: 800;
  color: var(--color-text-primary);
}

.formGrid {
  display: grid;
  gap: 10px;
}

@media (min-width: 768px) {
  .formGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fieldWide {
    grid-column: 1 / -1;
  }
}

.field {
  display: grid;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.input {
  width: 100%;
  min-height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg-light);
  color: var(--color-text-primary);
  padding: 8px 10px;
  font: inherit;
}

.input:disabled {
  opacity: 0.65;
}

.createActions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.formError {
  margin-right: auto;
  color: var(--color-danger, #b42318);
  font-size: 12px;
}

.createButton {
  border: 1px solid var(--color-border);
  background: var(--color-primary-soft);
  color: var(--color-text-primary);
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 800;
  cursor: pointer;
}

.createButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
