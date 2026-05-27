<script setup lang="ts">
import type { Task } from '@/types/api/tasks/task'
import type { TaskDefinition } from '@/types/api/tasks/taskDefinition'
import type { TaskEntry } from '@/types/api/tasks/taskEntry'
import type { TaskEntryTemplate } from '@/types/api/tasks/taskEntryTemplate'
import type { User } from '@/types/api/users/user'

import { useI18n } from '#imports'
import {
  DEFAULT_TASK_DAY_OF_WEEK,
  DEFAULT_TASK_RECURRENCE_TYPE,
  DEFAULT_TASK_WEEK_ORDINAL,
  taskDayOfWeekOptions,
  taskRecurrenceTypeOptions,
  taskWeekOrdinalOptions,
} from '@/modules/tasks/services/definitionOptions'
import {
  formatTaskDueDate as formatTaskDueDateValue,
  getTaskDueDateInfo,
  getTaskDueDateStateClass,
} from '@/modules/tasks/services/dueDate'
import { taskStatusTranslationKeys } from '@/modules/tasks/services/status'
import { taskDefinitionService } from '@/modules/tasks/services/taskDefinitionService'
import { taskEntryService } from '@/modules/tasks/services/taskEntryService'
import { taskEntryTemplateService } from '@/modules/tasks/services/taskEntryTemplateService'
import { taskService } from '@/modules/tasks/services/taskService'
import { DEFAULT_TASK_URGENCY, taskUrgencyOptions, toLowerEnumUiValue } from '@/modules/tasks/services/urgency'
import { userService } from '@/modules/user/services/userService'
import { getIri, getNumericIdFromIri, type HasIri } from '@/services/resource/iri'

type EmbeddedUser = {
  username?: string | null
  email?: string | null
  displayName?: string | null
} & HasIri

type TaskSectionId = 'tasks' | 'definitions'

type TaskCard = {
  task: Task
  id: number | null
  key: string
  title: string
  description: string
  assigneeIri: string
  assigneeLabel: string
  urgency: string
  urgencyLabel: string
  dueDate: string
  dueDateDisplay: string
  dueDateState: string
  status: string
  statusLabel: string
  definitionIri: string
  definitionLabel: string
  entries: TaskEntry[]
}

type DefinitionCard = {
  definition: TaskDefinition
  id: number | null
  key: string
  title: string
  description: string
  urgency: string
  urgencyLabel: string
  recurrenceLabel: string
  isActive: boolean
  entryTemplates: TaskEntryTemplate[]
}

const { t } = useI18n()

const activeSection = ref<TaskSectionId>('tasks')
const tasks = ref<Task[]>([])
const definitions = ref<TaskDefinition[]>([])
const templates = ref<TaskEntryTemplate[]>([])
const users = ref<User[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const isCreatingTask = ref(false)
const createTaskError = ref<string | null>(null)
const newTaskTitle = ref('')
const newTaskDescription = ref('')
const newTaskAssigneeIri = ref('')
const newTaskUrgency = ref(DEFAULT_TASK_URGENCY)
const newTaskDueDate = ref('')
const newTaskDueTime = ref('')

const editingTaskId = ref<number | null>(null)
const editTaskTitle = ref('')
const editTaskDescription = ref('')
const editTaskAssigneeIri = ref('')
const editTaskUrgency = ref(DEFAULT_TASK_URGENCY)
const editTaskDueDate = ref('')
const editTaskDueTime = ref('')
const isSavingTask = ref(false)
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

const isCreatingDefinition = ref(false)
const createDefinitionError = ref<string | null>(null)
const newDefinitionTitle = ref('')
const newDefinitionDescription = ref('')
const newDefinitionUrgency = ref(DEFAULT_TASK_URGENCY)
const newDefinitionRecurrenceType = ref(DEFAULT_TASK_RECURRENCE_TYPE)
const newDefinitionRecurrenceInterval = ref<number | null>(1)
const newDefinitionDayOfWeek = ref(DEFAULT_TASK_DAY_OF_WEEK)
const newDefinitionWeekOrdinal = ref(DEFAULT_TASK_WEEK_ORDINAL)

const editingDefinitionId = ref<number | null>(null)
const editDefinitionTitle = ref('')
const editDefinitionDescription = ref('')
const editDefinitionUrgency = ref(DEFAULT_TASK_URGENCY)
const editDefinitionRecurrenceType = ref(DEFAULT_TASK_RECURRENCE_TYPE)
const editDefinitionRecurrenceInterval = ref<number | null>(1)
const editDefinitionDayOfWeek = ref(DEFAULT_TASK_DAY_OF_WEEK)
const editDefinitionWeekOrdinal = ref(DEFAULT_TASK_WEEK_ORDINAL)
const isSavingDefinition = ref(false)
const definitionActionError = ref<string | null>(null)

const activeTemplateDefinitionId = ref<number | null>(null)
const newTemplateDescription = ref('')
const newTemplateSortOrder = ref<number | null>(1)
const isCreatingTemplate = ref(false)
const templateActionError = ref<string | null>(null)

const editingTemplateId = ref<number | null>(null)
const editTemplateDescription = ref('')
const editTemplateSortOrder = ref<number | null>(1)
const isSavingTemplate = ref(false)

const usersByIri = computed(() => {
  const map = new Map<string, User>()

  for (const user of users.value) {
    const iri = getIri(user)
    if (iri) map.set(iri, user)
  }

  return map
})

const definitionsByIri = computed(() => {
  const map = new Map<string, TaskDefinition>()

  for (const definition of definitions.value) {
    const iri = getIri(definition)
    if (iri) map.set(iri, definition)
  }

  return map
})

const templatesByDefinitionIri = computed(() => {
  const map = new Map<string, TaskEntryTemplate[]>()

  for (const template of templates.value) {
    const definitionIri = definitionIriFromValue(template.definition)
    if (!definitionIri) continue

    const existingTemplates = map.get(definitionIri) ?? []
    existingTemplates.push(template)
    map.set(definitionIri, existingTemplates)
  }

  for (const existingTemplates of map.values()) {
    existingTemplates.sort(
      (firstTemplate, secondTemplate) => (firstTemplate.sortOrder ?? 0) - (secondTemplate.sortOrder ?? 0),
    )
  }

  return map
})

const numericIdFromEntity = (entity: { id?: number; '@id'?: string }): number | null => {
  if (typeof entity.id === 'number') return entity.id
  return getNumericIdFromIri(entity['@id'] ?? '')
}

const taskUserLabel = (user: User): string => user.username || user.email || getIri(user) || 'User'

const userLabelFromValue = (value: string | EmbeddedUser | null | undefined): string => {
  if (!value) return t('tasks.unassigned')
  if (typeof value !== 'string') return value.username ?? value.displayName ?? value.email ?? getIri(value)

  const cachedUser = usersByIri.value.get(value)
  if (cachedUser) return taskUserLabel(cachedUser)

  return value
}

const userIriFromValue = (value: string | EmbeddedUser | null | undefined): string => {
  if (!value) return ''
  return typeof value === 'string' ? value : getIri(value)
}

const taskStatusLabel = (status: string | null | undefined): string => {
  if (!status) return t('tasks.status.unknown')

  const translationKey = taskStatusTranslationKeys[status]

  return translationKey ? t(`tasks.status.${translationKey}`) : status.replaceAll('_', ' ')
}

const urgencyLabel = (urgency: string | null | undefined): string => {
  if (!urgency) return t('tasks.urgency.unknown')
  const normalizedUrgency = urgency.toLowerCase()

  const labels: Record<string, string> = {
    emergency: t('tasks.urgency.emergency'),
    critical: t('tasks.urgency.critical'),
    important: t('tasks.urgency.important'),
    normal: t('tasks.urgency.normal'),
    whenever: t('tasks.urgency.whenever'),
  }

  return labels[normalizedUrgency] ?? normalizedUrgency.replaceAll('_', ' ')
}

const urgencyBadgeClass = (urgency: string | null | undefined): string => {
  switch (urgency?.toLowerCase()) {
    case 'emergency':
      return 'urgencyEmergency'
    case 'critical':
      return 'urgencyCritical'
    case 'important':
      return 'urgencyImportant'
    case 'normal':
      return 'urgencyNormal'
    case 'whenever':
      return 'urgencyWhenever'
    default:
      return 'urgencyDefault'
  }
}

const taskDefinitionOptionLabel = (
  translationGroup: 'recurrenceTypes' | 'days' | 'weekOrdinals',
  value: string | null | undefined,
  options: readonly string[],
): string | null => {
  if (!value) return null

  const normalizedValue = value.toLowerCase()
  if (!options.includes(normalizedValue)) return normalizedValue.replaceAll('_', ' ')

  return t(`tasks.definitions.${translationGroup}.${normalizedValue}`)
}

const recurrenceLabel = (definition: TaskDefinition): string => {
  const parts: string[] = []
  const recurrenceTypeLabel = taskDefinitionOptionLabel(
    'recurrenceTypes',
    definition.recurrenceType,
    taskRecurrenceTypeOptions,
  )
  const dayOfWeekLabel = taskDefinitionOptionLabel('days', definition.dayOfWeek, taskDayOfWeekOptions)
  const weekOrdinalLabel = taskDefinitionOptionLabel('weekOrdinals', definition.weekOrdinal, taskWeekOrdinalOptions)

  if (recurrenceTypeLabel) parts.push(recurrenceTypeLabel)
  if (definition.recurrenceInterval) parts.push(t('tasks.definitions.recurrence.interval', { count: definition.recurrenceInterval }))
  if (dayOfWeekLabel) parts.push(dayOfWeekLabel)
  if (weekOrdinalLabel) parts.push(weekOrdinalLabel)

  return parts.length > 0 ? parts.join(' - ') : t('tasks.definitions.recurrence.none')
}

const definitionIriFromValue = (value: string | TaskDefinition | null | undefined): string => {
  if (!value) return ''
  return typeof value === 'string' ? value : getIri(value)
}

const definitionLabelFromValue = (value: string | TaskDefinition | null | undefined): string => {
  if (!value) return t('tasks.definitions.undefined')
  if (typeof value !== 'string') return value.title?.trim() || getIri(value) || t('tasks.definitions.undefined')

  const cachedDefinition = definitionsByIri.value.get(value)
  if (cachedDefinition) return cachedDefinition.title?.trim() || getIri(cachedDefinition)

  return value
}

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return t('tasks.fields.notSet')

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const dueDateDisplay = (value: string | null | undefined): string => {
  const formatted = formatTaskDueDateValue(value, t('tasks.fields.notSet'))
  const dueDateInfo = getTaskDueDateInfo(value)

  if (dueDateInfo?.state === 'overdue') {
    return `${formatted} - ${t('tasks.dueDate.overdue')}`
  }

  return formatted
}

const formatDateInput = (value: string | null | undefined): string => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

const formatTimeInput = (value: string | null | undefined): string => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(11, 16)
}

const buildDueDateIso = (dateValue: string, timeValue: string): string | null => {
  if (!dateValue.trim()) return null

  const dueDate = new Date(`${dateValue}T${timeValue.trim() || '00:00'}`)
  return Number.isNaN(dueDate.getTime()) ? null : dueDate.toISOString()
}

const taskCards = computed<TaskCard[]>(() =>
  tasks.value.map((task) => {
    const entries = (task.entries ?? []).filter(
      (entry): entry is TaskEntry => typeof entry === 'object' && entry !== null,
    )
    const assignee = task.assignee as string | EmbeddedUser | null | undefined
    const definition = task.definition as string | TaskDefinition | null | undefined
    const id = numericIdFromEntity(task)

    return {
      task,
      id,
      key: getIri(task) || String(id ?? 'task'),
      title: task.title?.trim() || t('tasks.card.titleFallback', { id: id ?? '-' }),
      description: task.description?.trim() || t('tasks.card.descriptionFallback'),
      assigneeIri: userIriFromValue(assignee),
      assigneeLabel: userLabelFromValue(assignee),
      urgency: task.urgency ?? '',
      urgencyLabel: urgencyLabel(task.urgency),
      dueDate: formatDateTime(task.dueDate),
      dueDateDisplay: dueDateDisplay(task.dueDate),
        dueDateState: getTaskDueDateStateClass(task.dueDate),
      status: task.status ?? '',
      statusLabel: taskStatusLabel(task.status),
      definitionIri: definitionIriFromValue(definition),
      definitionLabel: definitionLabelFromValue(definition),
      entries: [...entries].sort((firstEntry, secondEntry) => (firstEntry.sortOrder ?? 0) - (secondEntry.sortOrder ?? 0)),
    }
  }),
)

const definitionCards = computed<DefinitionCard[]>(() =>
  definitions.value.map((definition) => {
    const id = numericIdFromEntity(definition)
    const definitionIri = getIri(definition)
    const embeddedTemplates = definition.entryTemplates ?? []
    const templateList = embeddedTemplates.filter(
      (template): template is TaskEntryTemplate => typeof template === 'object' && template !== null,
    )
    const templateFallbackList = templatesByDefinitionIri.value.get(definitionIri) ?? []
    const entryTemplates = templateList.length > 0 ? templateList : templateFallbackList

    return {
      definition,
      id,
      key: definitionIri || String(id ?? 'definition'),
      title: definition.title?.trim() || t('tasks.definitions.titleFallback', { id: id ?? '-' }),
      description: definition.description?.trim() || t('tasks.definitions.descriptionFallback'),
      urgency: definition.urgency ?? '',
      urgencyLabel: urgencyLabel(definition.urgency),
      recurrenceLabel: recurrenceLabel(definition),
      isActive: definition.active ?? false,
      entryTemplates: [...entryTemplates].sort(
        (firstTemplate, secondTemplate) => (firstTemplate.sortOrder ?? 0) - (secondTemplate.sortOrder ?? 0),
      ),
    }
  }),
)

const resetTaskForm = (): void => {
  newTaskTitle.value = ''
  newTaskDescription.value = ''
  newTaskAssigneeIri.value = getIri(users.value[0]) || ''
  newTaskUrgency.value = DEFAULT_TASK_URGENCY
  newTaskDueDate.value = ''
  newTaskDueTime.value = ''
}

const resetDefinitionForm = (): void => {
  newDefinitionTitle.value = ''
  newDefinitionDescription.value = ''
  newDefinitionUrgency.value = DEFAULT_TASK_URGENCY
  newDefinitionRecurrenceType.value = DEFAULT_TASK_RECURRENCE_TYPE
  newDefinitionRecurrenceInterval.value = 1
  newDefinitionDayOfWeek.value = DEFAULT_TASK_DAY_OF_WEEK
  newDefinitionWeekOrdinal.value = DEFAULT_TASK_WEEK_ORDINAL
}

const loadTasks = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = null
  taskActionError.value = null
  entryActionError.value = null
  definitionActionError.value = null
  templateActionError.value = null

  try {
    const [taskList, definitionList, templateList, userList] = await Promise.all([
      taskService().getAll(),
      taskDefinitionService().getAll(),
      taskEntryTemplateService().getAll(),
      userService().getAll(),
    ])

    tasks.value = taskList
    definitions.value = definitionList
    templates.value = templateList
    users.value = userList
    newTaskAssigneeIri.value ||= getIri(userList[0]) || ''
    editTaskAssigneeIri.value ||= getIri(userList[0]) || ''
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : t('errors.unknown')
    tasks.value = []
    definitions.value = []
    templates.value = []
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const createTask = async (): Promise<void> => {
  const title = newTaskTitle.value.trim()
  if (!title) return

  isCreatingTask.value = true
  createTaskError.value = null

  try {
    const createdTask = await taskService().create({
      title,
      description: newTaskDescription.value.trim() || null,
      assignee: newTaskAssigneeIri.value || null,
      urgency: newTaskUrgency.value || null,
      dueDate: buildDueDateIso(newTaskDueDate.value, newTaskDueTime.value),
    })

    tasks.value = [createdTask, ...tasks.value]
    resetTaskForm()
  } catch (err) {
    createTaskError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isCreatingTask.value = false
  }
}

const startEditTask = (task: TaskCard): void => {
  if (task.id === null) return

  editingTaskId.value = task.id
  editTaskTitle.value = task.task.title ?? ''
  editTaskDescription.value = task.task.description ?? ''
  editTaskAssigneeIri.value = task.assigneeIri
  editTaskUrgency.value = toLowerEnumUiValue(task.task.urgency, DEFAULT_TASK_URGENCY)
  editTaskDueDate.value = formatDateInput(task.task.dueDate)
  editTaskDueTime.value = formatTimeInput(task.task.dueDate)
  taskActionError.value = null
}

const cancelEditTask = (): void => {
  editingTaskId.value = null
  editTaskTitle.value = ''
  editTaskDescription.value = ''
  editTaskAssigneeIri.value = ''
  editTaskUrgency.value = DEFAULT_TASK_URGENCY
  editTaskDueDate.value = ''
  editTaskDueTime.value = ''
  taskActionError.value = null
}

const saveTask = async (task: TaskCard): Promise<void> => {
  if (task.id === null) return
  const title = editTaskTitle.value.trim()
  if (!title) return

  isSavingTask.value = true
  taskActionError.value = null

  try {
    const updatedTask = await taskService().update(task.id, {
      title,
      description: editTaskDescription.value.trim() || null,
      assignee: editTaskAssigneeIri.value || null,
      urgency: editTaskUrgency.value || null,
      dueDate: buildDueDateIso(editTaskDueDate.value, editTaskDueTime.value),
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
    await taskService().remove(task.id)
    tasks.value = tasks.value.filter((currentTask) => numericIdFromEntity(currentTask) !== task.id)
  } catch (err) {
    taskActionError.value = err instanceof Error ? err.message : t('errors.unknown')
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
  editEntryDescription.value = entry.description ?? ''
  editEntrySortOrder.value = entry.sortOrder ?? 1
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

const startEditDefinition = (definition: DefinitionCard): void => {
  if (definition.id === null) return

  editingDefinitionId.value = definition.id
  editDefinitionTitle.value = definition.definition.title ?? ''
  editDefinitionDescription.value = definition.definition.description ?? ''
  editDefinitionUrgency.value = toLowerEnumUiValue(definition.definition.urgency, DEFAULT_TASK_URGENCY)
  editDefinitionRecurrenceType.value = toLowerEnumUiValue(
    definition.definition.recurrenceType,
    DEFAULT_TASK_RECURRENCE_TYPE,
  )
  editDefinitionRecurrenceInterval.value = definition.definition.recurrenceInterval ?? 1
  editDefinitionDayOfWeek.value = toLowerEnumUiValue(definition.definition.dayOfWeek, DEFAULT_TASK_DAY_OF_WEEK)
  editDefinitionWeekOrdinal.value = toLowerEnumUiValue(definition.definition.weekOrdinal, DEFAULT_TASK_WEEK_ORDINAL)
  definitionActionError.value = null
}

const cancelEditDefinition = (): void => {
  editingDefinitionId.value = null
  editDefinitionTitle.value = ''
  editDefinitionDescription.value = ''
  editDefinitionUrgency.value = DEFAULT_TASK_URGENCY
  editDefinitionRecurrenceType.value = DEFAULT_TASK_RECURRENCE_TYPE
  editDefinitionRecurrenceInterval.value = 1
  editDefinitionDayOfWeek.value = DEFAULT_TASK_DAY_OF_WEEK
  editDefinitionWeekOrdinal.value = DEFAULT_TASK_WEEK_ORDINAL
  definitionActionError.value = null
}

const createDefinition = async (): Promise<void> => {
  const title = newDefinitionTitle.value.trim()
  if (!title) return

  isCreatingDefinition.value = true
  createDefinitionError.value = null

  try {
    const createdDefinition = await taskDefinitionService().create({
      title,
      description: newDefinitionDescription.value.trim() || null,
      urgency: newDefinitionUrgency.value || null,
      recurrenceType: newDefinitionRecurrenceType.value || null,
      recurrenceInterval:
        typeof newDefinitionRecurrenceInterval.value === 'number'
          ? newDefinitionRecurrenceInterval.value
          : null,
      dayOfWeek: newDefinitionDayOfWeek.value || null,
      weekOrdinal: newDefinitionWeekOrdinal.value || null,
    })

    definitions.value = [createdDefinition, ...definitions.value]
    resetDefinitionForm()
  } catch (err) {
    createDefinitionError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isCreatingDefinition.value = false
  }
}

const saveDefinition = async (definition: DefinitionCard): Promise<void> => {
  if (definition.id === null) return
  const title = editDefinitionTitle.value.trim()
  if (!title) return

  isSavingDefinition.value = true
  definitionActionError.value = null

  try {
    const updatedDefinition = await taskDefinitionService().update(definition.id, {
      title,
      description: editDefinitionDescription.value.trim() || null,
      urgency: editDefinitionUrgency.value || null,
      recurrenceType: editDefinitionRecurrenceType.value || null,
      recurrenceInterval:
        typeof editDefinitionRecurrenceInterval.value === 'number'
          ? editDefinitionRecurrenceInterval.value
          : null,
      dayOfWeek: editDefinitionDayOfWeek.value || null,
      weekOrdinal: editDefinitionWeekOrdinal.value || null,
    })

    definitions.value = definitions.value.map((currentDefinition) =>
      numericIdFromEntity(currentDefinition) === definition.id ? updatedDefinition : currentDefinition,
    )
    cancelEditDefinition()
  } catch (err) {
    definitionActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isSavingDefinition.value = false
  }
}

const deleteDefinition = async (definition: DefinitionCard): Promise<void> => {
  if (definition.id === null) return
  if (!window.confirm(t('tasks.definitions.deleteConfirm'))) return

  definitionActionError.value = null

  try {
    await taskDefinitionService().remove(definition.id)
    definitions.value = definitions.value.filter(
      (currentDefinition) => numericIdFromEntity(currentDefinition) !== definition.id,
    )
    await loadTasks()
  } catch (err) {
    definitionActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  }
}

const openTemplateForm = (definition: DefinitionCard): void => {
  if (definition.id === null) return

  activeTemplateDefinitionId.value = definition.id
  newTemplateDescription.value = ''
  newTemplateSortOrder.value = definition.entryTemplates.length + 1
  templateActionError.value = null
}

const createTemplate = async (definition: DefinitionCard): Promise<void> => {
  const description = newTemplateDescription.value.trim()
  const definitionIri = getIri(definition.definition)

  if (!description || !definitionIri) return

  isCreatingTemplate.value = true
  templateActionError.value = null

  try {
    await taskEntryTemplateService().create({
      definition: definitionIri,
      description,
      sortOrder: typeof newTemplateSortOrder.value === 'number' ? newTemplateSortOrder.value : undefined,
    })

    await loadTasks()
    activeTemplateDefinitionId.value = null
    newTemplateDescription.value = ''
    newTemplateSortOrder.value = 1
  } catch (err) {
    templateActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isCreatingTemplate.value = false
  }
}

const startEditTemplate = (template: TaskEntryTemplate): void => {
  const templateId = numericIdFromEntity(template)
  if (templateId === null) return

  editingTemplateId.value = templateId
  editTemplateDescription.value = template.description ?? ''
  editTemplateSortOrder.value = template.sortOrder ?? 1
  templateActionError.value = null
}

const cancelEditTemplate = (): void => {
  editingTemplateId.value = null
  editTemplateDescription.value = ''
  editTemplateSortOrder.value = 1
}

const saveTemplate = async (template: TaskEntryTemplate): Promise<void> => {
  const templateId = numericIdFromEntity(template)
  const description = editTemplateDescription.value.trim()

  if (templateId === null || !description) return

  isSavingTemplate.value = true
  templateActionError.value = null

  try {
    await taskEntryTemplateService().update(templateId, {
      description,
      sortOrder: typeof editTemplateSortOrder.value === 'number' ? editTemplateSortOrder.value : null,
    })

    await loadTasks()
    cancelEditTemplate()
  } catch (err) {
    templateActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isSavingTemplate.value = false
  }
}

const deleteTemplate = async (template: TaskEntryTemplate): Promise<void> => {
  const templateId = numericIdFromEntity(template)
  if (templateId === null) return

  templateActionError.value = null

  try {
    await taskEntryTemplateService().remove(templateId)
    await loadTasks()
  } catch (err) {
    templateActionError.value = err instanceof Error ? err.message : t('errors.unknown')
  }
}

onMounted(() => {
  newTaskAssigneeIri.value = ''
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

    <div class="tabs" role="tablist" :aria-label="t('tasks.tabs.ariaLabel')">
      <button
        class="tab"
        :class="{ active: activeSection === 'tasks' }"
        type="button"
        role="tab"
        :aria-selected="activeSection === 'tasks'"
        @click="activeSection = 'tasks'"
      >
        {{ t('tasks.tabs.tasks') }}
      </button>
      <button
        class="tab"
        :class="{ active: activeSection === 'definitions' }"
        type="button"
        role="tab"
        :aria-selected="activeSection === 'definitions'"
        @click="activeSection = 'definitions'"
      >
        {{ t('tasks.tabs.definitions') }}
      </button>
    </div>

    <div v-if="errorMessage" class="stateCard">
      <div class="stateTitle">{{ t('tasks.state.errorTitle') }}</div>
      <div class="stateMsg">{{ errorMessage }}</div>
      <button class="secondaryButton" type="button" @click="loadTasks">
        {{ t('tasks.state.retry') }}
      </button>
    </div>

    <template v-else-if="isLoading">
      <div class="stateCard">
        <div class="stateTitle">{{ t('tasks.state.loadingTitle') }}</div>
        <div class="stateMsg">{{ t('tasks.state.loadingSubtitle') }}</div>
      </div>
    </template>

    <template v-else>
      <section v-if="activeSection === 'tasks'" class="sectionGrid">
        <form class="panel" @submit.prevent="createTask">
          <div class="panelTitle">{{ t('tasks.create.title') }}</div>
          <div class="formGrid">
            <label class="field">
              <span>{{ t('tasks.fields.title') }}</span>
              <input
                v-model="newTaskTitle"
                class="input"
                type="text"
                :placeholder="t('tasks.create.titlePlaceholder')"
                :disabled="isCreatingTask"
              />
            </label>

            <label class="field fieldWide">
              <span>{{ t('tasks.fields.description') }}</span>
              <textarea
                v-model="newTaskDescription"
                class="textarea"
                rows="1"
                :placeholder="t('tasks.create.descriptionPlaceholder')"
                :disabled="isCreatingTask"
              />
            </label>

            <label class="field">
              <span>{{ t('tasks.fields.assignee') }}</span>
              <select v-model="newTaskAssigneeIri" class="input" :disabled="isCreatingTask">
                <option value="">{{ t('tasks.unassigned') }}</option>
                <option v-for="user in users" :key="getIri(user)" :value="getIri(user)">
                  {{ taskUserLabel(user) }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ t('tasks.fields.urgency') }}</span>
              <select v-model="newTaskUrgency" class="input" :disabled="isCreatingTask">
                <option v-for="option in taskUrgencyOptions" :key="option" :value="option">
                  {{ urgencyLabel(option) }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ t('tasks.fields.dueDate') }}</span>
              <input
                v-model="newTaskDueDate"
                class="input"
                type="date"
                :disabled="isCreatingTask"
              />
            </label>

            <label class="field">
              <span>{{ t('tasks.fields.time') }}</span>
              <input
                v-model="newTaskDueTime"
                class="input"
                type="time"
                :disabled="isCreatingTask"
              />
            </label>

          </div>
          <div class="formFooter">
            <button class="primaryButton" type="submit" :disabled="isCreatingTask || !newTaskTitle.trim()">
              {{ isCreatingTask ? t('tasks.create.creatingButton') : t('tasks.create.submitButton') }}
            </button>
          </div>
          <div v-if="createTaskError" class="formError">{{ createTaskError }}</div>
        </form>

        <div v-if="taskCards.length === 0" class="stateCard">
          <div class="stateTitle">{{ t('tasks.state.emptyTitle') }}</div>
          <div class="stateMsg">{{ t('tasks.state.emptySubtitle') }}</div>
        </div>

        <article v-for="task in taskCards" :key="task.key" class="card">
          <template v-if="editingTaskId === task.id">
            <div class="editGrid">
              <label class="field fieldWide">
                <span>{{ t('tasks.fields.title') }}</span>
                <input v-model="editTaskTitle" class="input" type="text" />
              </label>

              <label class="field fieldWide">
                <span>{{ t('tasks.fields.description') }}</span>
              <textarea v-model="editTaskDescription" class="textarea" rows="3" />
              </label>

              <label class="field">
                <span>{{ t('tasks.fields.assignee') }}</span>
                <select v-model="editTaskAssigneeIri" class="input">
                  <option value="">{{ t('tasks.unassigned') }}</option>
                  <option v-for="user in users" :key="getIri(user)" :value="getIri(user)">
                    {{ taskUserLabel(user) }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>{{ t('tasks.fields.urgency') }}</span>
                <select v-model="editTaskUrgency" class="input">
                  <option v-for="option in taskUrgencyOptions" :key="option" :value="option">
                    {{ urgencyLabel(option) }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>{{ t('tasks.fields.dueDate') }}</span>
                <input v-model="editTaskDueDate" class="input" type="date" />
              </label>

              <label class="field">
                <span>{{ t('tasks.fields.time') }}</span>
                <input v-model="editTaskDueTime" class="input" type="time" />
              </label>
            </div>

            <div v-if="taskActionError" class="formError">{{ taskActionError }}</div>

            <div class="buttonRow">
              <button class="secondaryButton" type="button" :disabled="isSavingTask" @click="cancelEditTask">
                {{ t('tasks.actions.cancel') }}
              </button>
              <button
                class="primaryButton"
                type="button"
                :disabled="isSavingTask || !editTaskTitle.trim()"
                @click="saveTask(task)"
              >
                {{ t('tasks.actions.save') }}
              </button>
            </div>
          </template>

          <template v-else>
            <div class="cardHeader">
              <div class="cardMain">
                <div class="cardTitle">{{ task.title }}</div>
                <div class="cardSub">{{ task.description }}</div>
                <div class="metaRow">
                  <span class="metaItem">{{ task.assigneeLabel }}</span>
                  <span class="metaItem">{{ task.definitionLabel }}</span>
                  <span class="metaItem" :class="task.dueDateState">{{ task.dueDateDisplay }}</span>
                </div>
              </div>

              <div class="cardStatus">
                <div class="badge">{{ task.statusLabel }}</div>
                <div class="badge" :class="urgencyBadgeClass(task.urgency)">{{ task.urgencyLabel }}</div>
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
      </section>

      <section v-else class="sectionGrid">
        <form class="panel" @submit.prevent="createDefinition">
          <div class="panelTitle">{{ t('tasks.definitions.create.title') }}</div>
          <div class="formGrid">
            <label class="field">
              <span>{{ t('tasks.definitions.fields.title') }}</span>
              <input
                v-model="newDefinitionTitle"
                class="input"
                type="text"
                :placeholder="t('tasks.definitions.create.titlePlaceholder')"
                :disabled="isCreatingDefinition"
              />
            </label>

            <label class="field fieldWide">
              <span>{{ t('tasks.definitions.fields.description') }}</span>
              <textarea
                v-model="newDefinitionDescription"
                class="textarea"
                rows="1"
                :placeholder="t('tasks.definitions.create.descriptionPlaceholder')"
                :disabled="isCreatingDefinition"
              />
            </label>

            <label class="field">
              <span>{{ t('tasks.definitions.fields.urgency') }}</span>
              <select v-model="newDefinitionUrgency" class="input" :disabled="isCreatingDefinition">
                <option v-for="option in taskUrgencyOptions" :key="option" :value="option">
                  {{ urgencyLabel(option) }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ t('tasks.definitions.fields.recurrenceType') }}</span>
              <select v-model="newDefinitionRecurrenceType" class="input" :disabled="isCreatingDefinition">
                <option v-for="option in taskRecurrenceTypeOptions" :key="option" :value="option">
                  {{ t(`tasks.definitions.recurrenceTypes.${option}`) }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ t('tasks.definitions.fields.recurrenceInterval') }}</span>
              <input
                v-model.number="newDefinitionRecurrenceInterval"
                class="numberInput"
                type="number"
                min="1"
                :disabled="isCreatingDefinition"
              />
            </label>

            <label class="field">
              <span>{{ t('tasks.definitions.fields.dayOfWeek') }}</span>
              <select v-model="newDefinitionDayOfWeek" class="input" :disabled="isCreatingDefinition">
                <option v-for="option in taskDayOfWeekOptions" :key="option" :value="option">
                  {{ t(`tasks.definitions.days.${option}`) }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>{{ t('tasks.definitions.fields.weekOrdinal') }}</span>
              <select v-model="newDefinitionWeekOrdinal" class="input" :disabled="isCreatingDefinition">
                <option v-for="option in taskWeekOrdinalOptions" :key="option" :value="option">
                  {{ t(`tasks.definitions.weekOrdinals.${option}`) }}
                </option>
              </select>
            </label>

          </div>
          <div class="formFooter">
            <button
              class="primaryButton"
              type="submit"
              :disabled="isCreatingDefinition || !newDefinitionTitle.trim()"
            >
              {{
                isCreatingDefinition
                  ? t('tasks.definitions.create.creatingButton')
                  : t('tasks.definitions.create.submitButton')
              }}
            </button>
          </div>
          <div v-if="createDefinitionError" class="formError">{{ createDefinitionError }}</div>
        </form>

        <div v-if="definitionCards.length === 0" class="stateCard">
          <div class="stateTitle">{{ t('tasks.definitions.empty.title') }}</div>
          <div class="stateMsg">{{ t('tasks.definitions.empty.subtitle') }}</div>
        </div>

        <article v-for="definition in definitionCards" :key="definition.key" class="card">
          <template v-if="editingDefinitionId === definition.id">
            <div class="editGrid">
              <label class="field fieldWide">
                <span>{{ t('tasks.definitions.fields.title') }}</span>
                <input v-model="editDefinitionTitle" class="input" type="text" />
              </label>

              <label class="field fieldWide">
                <span>{{ t('tasks.definitions.fields.description') }}</span>
              <textarea v-model="editDefinitionDescription" class="textarea" rows="1" />
              </label>

              <label class="field">
                <span>{{ t('tasks.definitions.fields.urgency') }}</span>
                <select v-model="editDefinitionUrgency" class="input">
                  <option v-for="option in taskUrgencyOptions" :key="option" :value="option">
                    {{ urgencyLabel(option) }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>{{ t('tasks.definitions.fields.recurrenceType') }}</span>
                <select v-model="editDefinitionRecurrenceType" class="input">
                  <option v-for="option in taskRecurrenceTypeOptions" :key="option" :value="option">
                    {{ t(`tasks.definitions.recurrenceTypes.${option}`) }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>{{ t('tasks.definitions.fields.recurrenceInterval') }}</span>
                <input
                  v-model.number="editDefinitionRecurrenceInterval"
                  class="numberInput"
                  type="number"
                  min="1"
                />
              </label>

              <label class="field">
                <span>{{ t('tasks.definitions.fields.dayOfWeek') }}</span>
                <select v-model="editDefinitionDayOfWeek" class="input">
                  <option v-for="option in taskDayOfWeekOptions" :key="option" :value="option">
                    {{ t(`tasks.definitions.days.${option}`) }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>{{ t('tasks.definitions.fields.weekOrdinal') }}</span>
                <select v-model="editDefinitionWeekOrdinal" class="input">
                  <option v-for="option in taskWeekOrdinalOptions" :key="option" :value="option">
                    {{ t(`tasks.definitions.weekOrdinals.${option}`) }}
                  </option>
                </select>
              </label>
            </div>

            <div v-if="definitionActionError" class="formError">{{ definitionActionError }}</div>

            <div class="buttonRow">
              <button
                class="secondaryButton"
                type="button"
                :disabled="isSavingDefinition"
                @click="cancelEditDefinition"
              >
                {{ t('tasks.actions.cancel') }}
              </button>
              <button
                class="primaryButton"
                type="button"
                :disabled="isSavingDefinition || !editDefinitionTitle.trim()"
                @click="saveDefinition(definition)"
              >
                {{ t('tasks.actions.save') }}
              </button>
            </div>
          </template>

          <template v-else>
            <div class="cardHeader">
              <div class="cardMain">
                <div class="cardTitle">{{ definition.title }}</div>
                <div class="cardSub">{{ definition.description }}</div>
                <div class="metaRow">
                  <span class="metaItem">{{ definition.recurrenceLabel }}</span>
                </div>
              </div>

              <div class="cardStatus">
                <div class="badge" :class="{ soft: !definition.isActive }">
                  {{ definition.isActive ? t('tasks.definitions.active') : t('tasks.definitions.inactive') }}
                </div>
                <div class="badge" :class="urgencyBadgeClass(definition.urgency)">
                  {{ definition.urgencyLabel }}
                </div>
              </div>
            </div>

            <div class="entryList">
              <div v-if="definition.entryTemplates.length === 0" class="emptyText">
                {{ t('tasks.definitions.templates.empty') }}
              </div>

              <div
                v-for="template in definition.entryTemplates"
                :key="getIri(template) || String(template.id)"
                class="entryRow"
              >
                <template v-if="editingTemplateId === numericIdFromEntity(template)">
                  <input v-model="editTemplateDescription" class="input" type="text" />
                  <input v-model.number="editTemplateSortOrder" class="numberInput" type="number" min="1" />
                  <button class="iconButton" type="button" :disabled="isSavingTemplate" @click="saveTemplate(template)">
                    <Icon name="lucide:check" size="18" />
                  </button>
                  <button class="iconButton" type="button" :disabled="isSavingTemplate" @click="cancelEditTemplate">
                    <Icon name="lucide:undo-2" size="18" />
                  </button>
                </template>

                <template v-else>
                  <div class="entryText">
                    <span class="sortOrder">{{ template.sortOrder }}</span>
                    <span>{{ template.description }}</span>
                  </div>
                  <button class="iconButton" type="button" @click="startEditTemplate(template)">
                    <Icon name="lucide:pencil" size="18" />
                  </button>
                  <button class="iconButton" type="button" @click="deleteTemplate(template)">
                    <Icon name="lucide:x" size="18" />
                  </button>
                </template>
              </div>
            </div>

            <form
              v-if="activeTemplateDefinitionId === definition.id"
              class="entryForm"
              @submit.prevent="createTemplate(definition)"
            >
              <input
                v-model="newTemplateDescription"
                class="input"
                type="text"
                :placeholder="t('tasks.definitions.templates.descriptionPlaceholder')"
                :disabled="isCreatingTemplate"
              />
              <input
                v-model.number="newTemplateSortOrder"
                class="numberInput"
                type="number"
                min="1"
                :disabled="isCreatingTemplate"
              />
              <button
                class="primaryButton"
                type="submit"
                :disabled="isCreatingTemplate || !newTemplateDescription.trim()"
              >
                {{ t('tasks.definitions.templates.addButton') }}
              </button>
            </form>

            <div v-if="templateActionError && activeTemplateDefinitionId === definition.id" class="formError">
              {{ templateActionError }}
            </div>
            <div v-if="definitionActionError" class="formError">{{ definitionActionError }}</div>

            <div class="buttonRow">
              <button
                class="secondaryButton"
                type="button"
                :disabled="definition.id === null"
                @click="openTemplateForm(definition)"
              >
                {{ t('tasks.definitions.templates.openCreate') }}
              </button>
              <button
                class="secondaryButton"
                type="button"
                :disabled="definition.id === null"
                @click="startEditDefinition(definition)"
              >
                {{ t('tasks.actions.edit') }}
              </button>
              <button
                class="dangerButton"
                type="button"
                :disabled="definition.id === null"
                @click="deleteDefinition(definition)"
              >
                {{ t('tasks.actions.delete') }}
              </button>
            </div>
          </template>
        </article>
      </section>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.header,
.cardHeader,
.buttonRow,
.formGrid,
.entryRow,
.entryForm,
.metaRow {
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
.stateCard,
.card,
.entryList,
.editGrid,
.sectionGrid {
  display: grid;
  gap: 12px;
}

.sectionGrid {
  gap: 16px;
}

.h1 {
  margin: 0;
  font-size: 22px;
  color: var(--color-text-primary);
}

.subtitle,
.cardSub,
.stateMsg,
.emptyText,
.metaItem {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.metaRow {
  flex-wrap: wrap;
}

.metaItem {
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-light);
}

.dueDateSoon {
  border-color: #fdb022;
  color: #b54708;
  background: #fffaeb;
}

.dueDateUrgent {
  border-color: #f04438;
  color: #b42318;
  background: #fef3f2;
}

.dueDateOverdue {
  border-color: #9f1239;
  color: #9f1239;
  background: #fff1f2;
}

.dueDateNeutral {
  background: var(--color-bg-light);
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

.tabs {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-bg-white);
  width: fit-content;
}

.tab {
  border: 0;
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: 900;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
}

.tab.active {
  background: var(--color-primary-soft);
  color: var(--color-text-primary);
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

.formFooter {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.field {
  display: grid;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
  min-width: min(220px, 100%);
}

.fieldWide {
  min-width: min(320px, 100%);
  flex: 1 1 320px;
}

.input,
.numberInput,
.textarea {
  min-height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg-light);
  color: var(--color-text-primary);
  padding: 8px 10px;
  font: inherit;
  min-width: 0;
}

.textarea {
  width: 100%;
  resize: vertical;
  min-height: 40px;
  height: 40px;
  line-height: 1.2;
}

.input {
  width: 100%;
}

.numberInput {
  width: 110px;
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

.badge.soft {
  background: var(--color-bg-light);
}

.urgencyEmergency {
  background: #fee4e2;
  border-color: #fda29b;
  color: #b42318;
}

.urgencyCritical {
  background: #fef0c7;
  border-color: #fecd6d;
  color: #b54708;
}

.urgencyImportant {
  background: #ecfdf3;
  border-color: #abefc6;
  color: #067647;
}

.urgencyNormal {
  background: #eff8ff;
  border-color: #b2ddff;
  color: #175cd3;
}

.urgencyWhenever {
  background: #f2f4f7;
  border-color: #d0d5dd;
  color: #475467;
}

.urgencyDefault {
  background: var(--color-primary-soft);
  color: var(--color-text-primary);
}

.cardMain {
  display: grid;
  gap: 6px;
  min-width: 0;
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
