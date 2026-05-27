<script setup lang="ts">
import type { GenericTask } from '@/types/api/tasks/genericTask'
import type { TaskEntry } from '@/types/api/tasks/taskEntry'
import type { User } from '@/types/api/users/user'

import { useI18n } from '#imports'
import { genericTaskService } from '@/modules/tasks/services/genericTaskService'
import { taskEntryService } from '@/modules/tasks/services/taskEntryService'
import { userService } from '@/modules/user/services/userService'
import { getIri, getNumericIdFromIri, type HasIri } from '@/services/resource/iri'

type EmbeddedUser = {
  username?: string | null
  email?: string | null
  displayName?: string | null
} & HasIri

type TaskCard = {
  task: GenericTask
  id: number | null
  key: string
  assigneeIri: string
  assigneeLabel: string
  status: string
  statusLabel: string
  isComplete: boolean
  entries: TaskEntry[]
}

const { t } = useI18n()

const tasks = ref<GenericTask[]>([])
const users = ref<User[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const isCreatingTask = ref(false)
const createTaskError = ref<string | null>(null)
const newTaskAssigneeIri = ref('')

const editingTaskId = ref<number | null>(null)
const editTaskAssigneeIri = ref('')
const editTaskStatus = ref('')
const isSavingTask = ref(false)
const togglingTaskId = ref<number | null>(null)
const taskActionError = ref<string | null>(null)

const activeEntryTaskId = ref<number | null>(null)
const newEntryDescription = ref('')
const newEntrySortOrder = ref<number | null>(1)
const isCreatingEntry = ref(false)
const entryActionError = ref<string | null>(null)

const editingEntryId = ref<number | null>(null)
const editEntryDescription = ref('')
const editEntrySortOrder = ref<number | null>(1)
const isSavingEntry = ref(false)

const usersByIri = computed(() => {
  const map = new Map<string, User>()

  for (const user of users.value) {
    const iri = getIri(user)
    if (iri) map.set(iri, user)
  }

  return map
})

const numericIdFromEntity = (entity: { id?: number; '@id'?: string }): number | null => {
  if (typeof entity.id === 'number') return entity.id
  return getNumericIdFromIri(entity['@id'] ?? '')
}

const userLabel = (user: User): string => user.username || user.email || getIri(user) || 'User'

const userLabelFromValue = (value: string | EmbeddedUser | null | undefined): string => {
  if (!value) return t('tasks.unassigned')
  if (typeof value !== 'string') return value.username ?? value.displayName ?? value.email ?? getIri(value)

  const cachedUser = usersByIri.value.get(value)
  if (cachedUser) return userLabel(cachedUser)

  return value
}

const userIriFromValue = (value: string | EmbeddedUser | null | undefined): string => {
  if (!value) return ''
  return typeof value === 'string' ? value : getIri(value)
}

const completedTaskStatuses = new Set(['completed', 'done'])

const taskStatusLabel = (status: string | null | undefined): string => {
  if (!status) return t('tasks.status.unknown')

  const labels: Record<string, string> = {
    open: t('tasks.status.open'),
    in_progress: t('tasks.status.inProgress'),
    completed: t('tasks.status.completed'),
    done: t('tasks.status.completed'),
  }

  return labels[status] ?? status.replaceAll('_', ' ')
}

const taskCards = computed<TaskCard[]>(() =>
  tasks.value.map((task) => {
    const entries = (task.entries ?? []).filter(
      (entry): entry is TaskEntry => typeof entry === 'object' && entry !== null,
    )
    const assignee = task.assignee as string | EmbeddedUser | null | undefined
    const id = numericIdFromEntity(task)

    return {
      task,
      id,
      key: getIri(task) || String(id ?? 'task'),
      assigneeIri: userIriFromValue(assignee),
      assigneeLabel: userLabelFromValue(assignee),
      status: task.status ?? '',
      statusLabel: taskStatusLabel(task.status),
      isComplete: completedTaskStatuses.has(task.status ?? ''),
      entries: [...entries].sort((firstEntry, secondEntry) => firstEntry.sortOrder - secondEntry.sortOrder),
    }
  }),
)

const loadTasks = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = null
  taskActionError.value = null
  entryActionError.value = null

  try {
    const [taskList, userList] = await Promise.all([
      genericTaskService().getAll(),
      userService().getAll(),
    ])

    tasks.value = taskList
    users.value = userList
    newTaskAssigneeIri.value ||= getIri(userList[0]) || ''
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : t('errors.unknown')
    tasks.value = []
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const createTask = async (): Promise<void> => {
  isCreatingTask.value = true
  createTaskError.value = null

  try {
    const createdTask = await genericTaskService().create({
      assignee: newTaskAssigneeIri.value || undefined,
    })

    tasks.value = [createdTask, ...tasks.value]
  } catch (err) {
    createTaskError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isCreatingTask.value = false
  }
}

const startEditTask = (task: TaskCard): void => {
  if (task.id === null) return

  editingTaskId.value = task.id
  editTaskAssigneeIri.value = task.assigneeIri
  editTaskStatus.value = task.status
  taskActionError.value = null
}

const cancelEditTask = (): void => {
  editingTaskId.value = null
  editTaskAssigneeIri.value = ''
  editTaskStatus.value = ''
  taskActionError.value = null
}

const saveTask = async (task: TaskCard): Promise<void> => {
  if (task.id === null) return

  isSavingTask.value = true
  taskActionError.value = null

  try {
    const updatedTask = await genericTaskService().update(task.id, {
      assignee: editTaskAssigneeIri.value || null,
      status: editTaskStatus.value || null,
    })

    tasks.value = tasks.value.map((currentTask) =>
      numericIdFromEntity(currentTask) === task.id ? updatedTask : currentTask,
    )
    cancelEditTask()
  } catch (err) {
    taskActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isSavingTask.value = false
  }
}

const deleteTask = async (task: TaskCard): Promise<void> => {
  if (task.id === null) return
  if (!window.confirm(t('tasks.actions.deleteTaskConfirm'))) return

  taskActionError.value = null

  try {
    await genericTaskService().remove(task.id)
    tasks.value = tasks.value.filter((currentTask) => numericIdFromEntity(currentTask) !== task.id)
  } catch (err) {
    taskActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  }
}

const toggleTaskCompleted = async (task: TaskCard): Promise<void> => {
  if (task.id === null) return

  togglingTaskId.value = task.id
  taskActionError.value = null

  try {
    const updatedTask = await genericTaskService().update(task.id, {
      status: task.isComplete ? 'open' : 'completed',
    })

    tasks.value = tasks.value.map((currentTask) =>
      numericIdFromEntity(currentTask) === task.id ? updatedTask : currentTask,
    )
  } catch (err) {
    taskActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    togglingTaskId.value = null
  }
}

const openEntryForm = (task: TaskCard): void => {
  if (task.id === null) return

  activeEntryTaskId.value = task.id
  newEntryDescription.value = ''
  newEntrySortOrder.value = task.entries.length + 1
  entryActionError.value = null
}

const createEntry = async (task: TaskCard): Promise<void> => {
  const description = newEntryDescription.value.trim()
  const taskIri = getIri(task.task)

  if (!description || !taskIri) return

  isCreatingEntry.value = true
  entryActionError.value = null

  try {
    await taskEntryService().create({
      task: taskIri,
      description,
      sortOrder: typeof newEntrySortOrder.value === 'number' ? newEntrySortOrder.value : undefined,
    })

    await loadTasks()
    activeEntryTaskId.value = null
    newEntryDescription.value = ''
    newEntrySortOrder.value = 1
  } catch (err) {
    entryActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isCreatingEntry.value = false
  }
}

const startEditEntry = (entry: TaskEntry): void => {
  const entryId = numericIdFromEntity(entry)
  if (entryId === null) return

  editingEntryId.value = entryId
  editEntryDescription.value = entry.description
  editEntrySortOrder.value = entry.sortOrder
  entryActionError.value = null
}

const cancelEditEntry = (): void => {
  editingEntryId.value = null
  editEntryDescription.value = ''
  editEntrySortOrder.value = 1
}

const saveEntry = async (entry: TaskEntry): Promise<void> => {
  const entryId = numericIdFromEntity(entry)
  const description = editEntryDescription.value.trim()

  if (entryId === null || !description) return

  isSavingEntry.value = true
  entryActionError.value = null

  try {
    await taskEntryService().update(entryId, {
      description,
      sortOrder: typeof editEntrySortOrder.value === 'number' ? editEntrySortOrder.value : undefined,
    })

    await loadTasks()
    cancelEditEntry()
  } catch (err) {
    entryActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isSavingEntry.value = false
  }
}

const deleteEntry = async (entry: TaskEntry): Promise<void> => {
  const entryId = numericIdFromEntity(entry)
  if (entryId === null) return

  entryActionError.value = null

  try {
    await taskEntryService().remove(entryId)
    await loadTasks()
  } catch (err) {
    entryActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  }
}

onMounted(() => {
  void loadTasks()
})
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="titleWrap">
        <h1 class="h1">{{ t('tasks.title') }}</h1>
        <p class="subtitle">{{ t('tasks.subtitle') }}</p>
      </div>

      <button class="refresh" type="button" :disabled="isLoading" @click="loadTasks">
        <Icon :name="isLoading ? 'ph:spinner-gap' : 'ph:arrow-clockwise'" class="refreshIcon" />
      </button>
    </header>

    <form class="panel" @submit.prevent="createTask">
      <div class="panelTitle">{{ t('tasks.create.title') }}</div>
      <div class="formGrid">
        <label class="field">
          <span>{{ t('tasks.fields.assignee') }}</span>
          <select v-model="newTaskAssigneeIri" class="input" :disabled="isCreatingTask">
            <option value="">{{ t('tasks.unassigned') }}</option>
            <option v-for="user in users" :key="getIri(user)" :value="getIri(user)">
              {{ userLabel(user) }}
            </option>
          </select>
        </label>

        <button class="primaryButton" type="submit" :disabled="isCreatingTask">
          {{ isCreatingTask ? t('tasks.create.creatingButton') : t('tasks.create.submitButton') }}
        </button>
      </div>
      <div v-if="createTaskError" class="formError">{{ createTaskError }}</div>
    </form>

    <div v-if="errorMessage" class="stateCard">
      <div class="stateTitle">{{ t('tasks.state.errorTitle') }}</div>
      <div class="stateMsg">{{ errorMessage }}</div>
      <button class="secondaryButton" type="button" @click="loadTasks">
        {{ t('tasks.state.retry') }}
      </button>
    </div>

    <div v-else-if="isLoading" class="stateCard">
      <div class="stateTitle">{{ t('tasks.state.loadingTitle') }}</div>
      <div class="stateMsg">{{ t('tasks.state.loadingSubtitle') }}</div>
    </div>

    <div v-else class="grid">
      <article v-for="task in taskCards" :key="task.key" class="card">
        <template v-if="editingTaskId === task.id">
          <div class="editGrid">
            <label class="field">
              <span>{{ t('tasks.fields.assignee') }}</span>
              <select v-model="editTaskAssigneeIri" class="input">
                <option value="">{{ t('tasks.unassigned') }}</option>
                <option v-for="user in users" :key="getIri(user)" :value="getIri(user)">
                  {{ userLabel(user) }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ t('tasks.fields.status') }}</span>
              <input v-model="editTaskStatus" class="input" type="text" />
            </label>
          </div>

          <div v-if="taskActionError" class="formError">{{ taskActionError }}</div>

          <div class="buttonRow">
            <button class="secondaryButton" type="button" :disabled="isSavingTask" @click="cancelEditTask">
              {{ t('tasks.actions.cancel') }}
            </button>
            <button class="primaryButton" type="button" :disabled="isSavingTask" @click="saveTask(task)">
              {{ t('tasks.actions.save') }}
            </button>
          </div>
        </template>

        <template v-else>
          <div class="cardHeader">
            <div>
              <div class="cardTitle">{{ t('tasks.card.title', { id: task.id ?? '-' }) }}</div>
              <div class="cardSub">{{ task.assigneeLabel }}</div>
            </div>
            <div class="cardStatus">
              <button
                class="checkButton"
                :class="{ isComplete: task.isComplete }"
                type="button"
                :disabled="task.id === null || togglingTaskId === task.id"
                @click="toggleTaskCompleted(task)"
              >
                <Icon :name="task.isComplete ? 'lucide:check' : 'lucide:circle'" size="18" />
                <span>{{ task.isComplete ? t('tasks.actions.reopen') : t('tasks.actions.complete') }}</span>
              </button>
              <div class="badge" :class="{ isComplete: task.isComplete }">{{ task.statusLabel }}</div>
            </div>
          </div>

          <div class="entryList">
            <div v-if="task.entries.length === 0" class="emptyText">
              {{ t('tasks.entries.empty') }}
            </div>

            <div v-for="entry in task.entries" :key="getIri(entry) || String(entry.id)" class="entryRow">
              <template v-if="editingEntryId === numericIdFromEntity(entry)">
                <input v-model="editEntryDescription" class="input" type="text" />
                <input v-model.number="editEntrySortOrder" class="numberInput" type="number" min="1" />
                <button class="iconButton" type="button" :disabled="isSavingEntry" @click="saveEntry(entry)">
                  <Icon name="lucide:check" size="18" />
                </button>
                <button class="iconButton" type="button" :disabled="isSavingEntry" @click="cancelEditEntry">
                  <Icon name="lucide:undo-2" size="18" />
                </button>
              </template>

              <template v-else>
                <div class="entryText">
                  <span class="sortOrder">{{ entry.sortOrder }}</span>
                  <span>{{ entry.description }}</span>
                </div>
                <button class="iconButton" type="button" @click="startEditEntry(entry)">
                  <Icon name="lucide:pencil" size="18" />
                </button>
                <button class="iconButton" type="button" @click="deleteEntry(entry)">
                  <Icon name="lucide:x" size="18" />
                </button>
              </template>
            </div>
          </div>

          <form v-if="activeEntryTaskId === task.id" class="entryForm" @submit.prevent="createEntry(task)">
            <input
              v-model="newEntryDescription"
              class="input"
              type="text"
              :placeholder="t('tasks.entries.descriptionPlaceholder')"
              :disabled="isCreatingEntry"
            />
            <input
              v-model.number="newEntrySortOrder"
              class="numberInput"
              type="number"
              min="1"
              :disabled="isCreatingEntry"
            />
            <button
              class="primaryButton"
              type="submit"
              :disabled="isCreatingEntry || !newEntryDescription.trim()"
            >
              {{ t('tasks.entries.addButton') }}
            </button>
          </form>

          <div v-if="entryActionError && activeEntryTaskId === task.id" class="formError">
            {{ entryActionError }}
          </div>

          <div v-if="taskActionError" class="formError">{{ taskActionError }}</div>

          <div class="buttonRow">
            <button class="secondaryButton" type="button" :disabled="task.id === null" @click="openEntryForm(task)">
              {{ t('tasks.entries.openCreate') }}
            </button>
            <button class="secondaryButton" type="button" :disabled="task.id === null" @click="startEditTask(task)">
              {{ t('tasks.actions.edit') }}
            </button>
            <button class="dangerButton" type="button" :disabled="task.id === null" @click="deleteTask(task)">
              {{ t('tasks.actions.delete') }}
            </button>
          </div>
        </template>
      </article>

      <div v-if="taskCards.length === 0" class="stateCard">
        <div class="stateTitle">{{ t('tasks.state.emptyTitle') }}</div>
        <div class="stateMsg">{{ t('tasks.state.emptySubtitle') }}</div>
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
.buttonRow,
.formGrid,
.entryRow,
.entryForm {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header,
.cardHeader {
  justify-content: space-between;
}

.cardHeader {
  align-items: flex-start;
}

.buttonRow {
  justify-content: flex-end;
  flex-wrap: wrap;
}

.titleWrap,
.panel,
.grid,
.card,
.stateCard,
.entryList,
.editGrid {
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
.emptyText {
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
  align-items: end;
  flex-wrap: wrap;
}

.field {
  display: grid;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
  min-width: min(260px, 100%);
}

.input,
.numberInput {
  min-height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg-light);
  color: var(--color-text-primary);
  padding: 8px 10px;
  font: inherit;
  min-width: 0;
}

.input {
  width: 100%;
}

.numberInput {
  width: 88px;
}

.badge,
.sortOrder {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 5px 8px;
  background: var(--color-primary-soft);
  font-size: 12px;
  font-weight: 900;
}

.badge.isComplete {
  background: #ecfdf3;
  color: #027a48;
}

.cardStatus {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.entryRow {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 8px;
}

.entryText {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
  font-weight: 800;
}

.entryForm {
  align-items: end;
  flex-wrap: wrap;
}

.primaryButton,
.secondaryButton,
.dangerButton,
.checkButton,
.iconButton {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-weight: 900;
  cursor: pointer;
}

.primaryButton,
.secondaryButton,
.dangerButton {
  min-height: 40px;
  padding: 9px 11px;
}

.iconButton {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-white);
  color: var(--color-text-secondary);
}

.checkButton {
  min-height: 32px;
  padding: 6px 9px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-bg-light);
  color: var(--color-text-primary);
}

.checkButton.isComplete {
  background: #ecfdf3;
  color: #027a48;
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
.checkButton:disabled,
.iconButton:disabled,
.refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.formError {
  color: var(--color-danger, #b42318);
  font-size: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
