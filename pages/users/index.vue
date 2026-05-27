<script setup lang="ts">
import type { User } from '@/types/api/users/user'

import { useI18n } from '#imports'
import { userService } from '@/modules/user/services/userService'
import { getIri, getNumericIdFromIri } from '@/services/resource/iri'

const { t } = useI18n()

type UserCard = {
  id: number | null
  key: string
  username: string
  email: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

const users = ref<User[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const isCreating = ref(false)
const createError = ref<string | null>(null)
const newUsername = ref('')
const newEmail = ref('')
const newIsActive = ref(true)

const editingUserId = ref<number | null>(null)
const editUsername = ref('')
const editEmail = ref('')
const editIsActive = ref(true)
const isSaving = ref(false)
const actionError = ref<string | null>(null)

const userNumericId = (user: User): number | null => {
  if (typeof user.id === 'number') return user.id
  return getNumericIdFromIri(user['@id'] ?? '')
}

const userCards = computed<UserCard[]>(() =>
  users.value.map((user) => {
    const id = userNumericId(user)

    return {
      id,
      key: getIri(user) || String(id ?? user.username),
      username: user.username,
      email: user.email,
      active: user.active ?? false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }),
)

const loadUsers = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = null
  actionError.value = null

  try {
    users.value = await userService().getAll()
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : t('errors.unknown')
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const createUser = async (): Promise<void> => {
  const username = newUsername.value.trim()
  const email = newEmail.value.trim()

  if (!username || !email) return

  isCreating.value = true
  createError.value = null

  try {
    const createdUser = await userService().create({
      username,
      email,
      isActive: newIsActive.value,
    })

    users.value = [createdUser, ...users.value]
    newUsername.value = ''
    newEmail.value = ''
    newIsActive.value = true
  } catch (err) {
    createError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isCreating.value = false
  }
}

const startEdit = (user: UserCard): void => {
  if (user.id === null) return

  editingUserId.value = user.id
  editUsername.value = user.username
  editEmail.value = user.email
  editIsActive.value = user.active
  actionError.value = null
}

const cancelEdit = (): void => {
  editingUserId.value = null
  editUsername.value = ''
  editEmail.value = ''
  editIsActive.value = true
  actionError.value = null
}

const saveUser = async (user: UserCard): Promise<void> => {
  const username = editUsername.value.trim()
  const email = editEmail.value.trim()

  if (user.id === null || !username || !email) return

  isSaving.value = true
  actionError.value = null

  try {
    const updatedUser = await userService().update(user.id, {
      username,
      email,
      isActive: editIsActive.value,
    })

    users.value = users.value.map((currentUser) =>
      userNumericId(currentUser) === user.id ? updatedUser : currentUser,
    )
    cancelEdit()
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isSaving.value = false
  }
}

const deleteUser = async (user: UserCard): Promise<void> => {
  if (user.id === null) return
  if (!window.confirm(t('users.actions.deleteConfirm'))) return

  actionError.value = null

  try {
    await userService().remove(user.id)
    users.value = users.value.filter((currentUser) => userNumericId(currentUser) !== user.id)
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : t('errors.unknown')
  }
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="titleWrap">
        <h1 class="h1">{{ t('users.title') }}</h1>
        <p class="subtitle">{{ t('users.subtitle') }}</p>
      </div>

      <button class="refresh" type="button" :disabled="isLoading" @click="loadUsers">
        <Icon :name="isLoading ? 'ph:spinner-gap' : 'ph:arrow-clockwise'" class="refreshIcon" />
      </button>
    </header>

    <form class="panel" @submit.prevent="createUser">
      <div class="panelTitle">{{ t('users.create.title') }}</div>

      <div class="formGrid">
        <label class="field">
          <span>{{ t('users.fields.username') }}</span>
          <input v-model="newUsername" class="input" type="text" :disabled="isCreating" />
        </label>

        <label class="field">
          <span>{{ t('users.fields.email') }}</span>
          <input v-model="newEmail" class="input" type="email" :disabled="isCreating" />
        </label>

        <label class="checkField">
          <input v-model="newIsActive" type="checkbox" :disabled="isCreating" />
          <span>{{ t('users.fields.active') }}</span>
        </label>
      </div>

      <div class="actions">
        <div v-if="createError" class="formError">{{ createError }}</div>
        <button
          class="primaryButton"
          type="submit"
          :disabled="isCreating || !newUsername.trim() || !newEmail.trim()"
        >
          {{ isCreating ? t('users.create.creatingButton') : t('users.create.submitButton') }}
        </button>
      </div>
    </form>

    <div v-if="errorMessage" class="stateCard">
      <div class="stateTitle">{{ t('users.state.errorTitle') }}</div>
      <div class="stateMsg">{{ errorMessage }}</div>
      <button class="secondaryButton" type="button" @click="loadUsers">
        {{ t('users.state.retry') }}
      </button>
    </div>

    <div v-else-if="isLoading" class="stateCard">
      <div class="stateTitle">{{ t('users.state.loadingTitle') }}</div>
      <div class="stateMsg">{{ t('users.state.loadingSubtitle') }}</div>
    </div>

    <div v-else class="grid">
      <article v-for="user in userCards" :key="user.key" class="card">
        <template v-if="editingUserId === user.id">
          <div class="editStack">
            <label class="field">
              <span>{{ t('users.fields.username') }}</span>
              <input v-model="editUsername" class="input" type="text" />
            </label>

            <label class="field">
              <span>{{ t('users.fields.email') }}</span>
              <input v-model="editEmail" class="input" type="email" />
            </label>

            <label class="checkField">
              <input v-model="editIsActive" type="checkbox" />
              <span>{{ t('users.fields.active') }}</span>
            </label>
          </div>

          <div v-if="actionError" class="formError">{{ actionError }}</div>

          <div class="buttonRow">
            <button class="secondaryButton" type="button" :disabled="isSaving" @click="cancelEdit">
              {{ t('users.actions.cancel') }}
            </button>
            <button
              class="primaryButton"
              type="button"
              :disabled="isSaving || !editUsername.trim() || !editEmail.trim()"
              @click="saveUser(user)"
            >
              {{ t('users.actions.save') }}
            </button>
          </div>
        </template>

        <template v-else>
          <div class="cardHeader">
            <div>
              <div class="cardTitle">{{ user.username }}</div>
              <div class="cardSub">{{ user.email }}</div>
            </div>
            <div class="badge" :class="{ inactive: !user.active }">
              {{ user.active ? t('users.state.active') : t('users.state.inactive') }}
            </div>
          </div>

          <div class="meta">
            <span v-if="user.createdAt">{{ t('users.fields.createdAt') }}: {{ user.createdAt }}</span>
            <span v-if="user.updatedAt">{{ t('users.fields.updatedAt') }}: {{ user.updatedAt }}</span>
          </div>

          <div class="buttonRow">
            <button class="secondaryButton" type="button" :disabled="user.id === null" @click="startEdit(user)">
              {{ t('users.actions.edit') }}
            </button>
            <button class="dangerButton" type="button" :disabled="user.id === null" @click="deleteUser(user)">
              {{ t('users.actions.delete') }}
            </button>
          </div>
        </template>
      </article>

      <div v-if="userCards.length === 0" class="stateCard">
        <div class="stateTitle">{{ t('users.state.emptyTitle') }}</div>
        <div class="stateMsg">{{ t('users.state.emptySubtitle') }}</div>
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

.header,
.cardHeader,
.actions,
.buttonRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.buttonRow,
.actions {
  justify-content: flex-end;
  flex-wrap: wrap;
}

.titleWrap,
.panel,
.editStack,
.grid,
.card,
.stateCard {
  display: grid;
  gap: 12px;
}

.h1 {
  margin: 0;
  font-size: 22px;
  color: var(--color-text-primary);
}

.subtitle,
.cardSub,
.stateMsg,
.meta {
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

.refresh:disabled .refreshIcon {
  animation: spin 0.9s linear infinite;
}

.refreshIcon {
  width: 20px;
  height: 20px;
}

.panel,
.card,
.stateCard {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 14px;
  box-shadow: var(--shadow-elevated);
}

.panelTitle,
.cardTitle,
.stateTitle {
  font-weight: 900;
  color: var(--color-text-primary);
}

.formGrid {
  display: grid;
  gap: 10px;
}

@media (min-width: 768px) {
  .formGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: end;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.field {
  display: grid;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.checkField {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
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

.badge {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 5px 8px;
  background: var(--color-primary-soft);
  font-size: 12px;
  font-weight: 900;
}

.badge.inactive {
  background: #f3f4f6;
  color: var(--color-text-secondary);
}

.meta {
  display: grid;
  gap: 4px;
}

.primaryButton,
.secondaryButton,
.dangerButton {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 9px 11px;
  font-weight: 900;
  cursor: pointer;
}

.primaryButton {
  background: var(--color-primary-soft);
  color: var(--color-text-primary);
}

.secondaryButton {
  background: var(--color-bg-light);
  color: var(--color-text-primary);
}

.dangerButton {
  background: #fef2f2;
  color: #991b1b;
}

.primaryButton:disabled,
.secondaryButton:disabled,
.dangerButton:disabled,
.refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.formError {
  margin-right: auto;
  color: var(--color-danger, #b42318);
  font-size: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
