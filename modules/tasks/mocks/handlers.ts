import { http, HttpResponse } from 'msw'

import {
  mockTaskDefinitions,
  mockTaskEntries,
  mockTaskEntryTemplates,
  mockTasks,
} from '@/modules/tasks/mocks/data/tasks'
import {
  TASK_DEFINITIONS_ENDPOINT,
  TASK_ENTRIES_ENDPOINT,
  TASK_ENTRY_TEMPLATES_ENDPOINT,
  TASKS_ENDPOINT,
} from '@/modules/tasks/services/endpoints'
import { mockUsers } from '@/modules/user/mocks/data/users'
import { jsonCollection, jsonNotFound, matchApiPath, nextNumericId } from '@/shared/mocks/utils'

type CreateTaskBody = {
  title?: string
  description?: string | null
  assignee?: string | null
  urgency?: string | null
  dueDate?: string | null
}

type UpdateTaskBody = CreateTaskBody

type CreateTaskDefinitionBody = {
  title?: string
  description?: string | null
  urgency?: string | null
  recurrenceType?: string | null
  recurrenceInterval?: number | null
  dayOfWeek?: string | null
  weekOrdinal?: string | null
}

type UpdateTaskDefinitionBody = CreateTaskDefinitionBody

type CreateTaskEntryBody = {
  task: string
  description: string
  sortOrder?: number
}

type UpdateTaskEntryBody = {
  description?: string
  sortOrder?: number
}

type CreateTaskEntryTemplateBody = {
  definition: string
  description: string
  sortOrder?: number
}

type UpdateTaskEntryTemplateBody = {
  description?: string | null
  sortOrder?: number | null
}

const findUser = (userIri: string | null | undefined) =>
  userIri ? mockUsers.find((user) => user['@id'] === userIri) ?? userIri : null

const refreshTaskEntries = () => {
  for (const task of mockTasks) {
    const taskIri = task['@id']
    task.entries = mockTaskEntries
      .filter((entry) => entry.task === taskIri)
      .sort((firstEntry, secondEntry) => (firstEntry.sortOrder ?? 0) - (secondEntry.sortOrder ?? 0))
  }
}

const refreshTaskDefinitions = () => {
  for (const definition of mockTaskDefinitions) {
    const definitionIri = definition['@id']
    definition.entryTemplates = mockTaskEntryTemplates
      .filter((template) => template.definition === definitionIri)
      .sort((firstTemplate, secondTemplate) => (firstTemplate.sortOrder ?? 0) - (secondTemplate.sortOrder ?? 0))
  }
}

const refreshRelations = () => {
  refreshTaskDefinitions()
  refreshTaskEntries()
}

export const taskHandlers = [
  http.get(matchApiPath(TASKS_ENDPOINT), () => {
    refreshRelations()
    return jsonCollection(mockTasks)
  }),

  http.get(matchApiPath(`${TASKS_ENDPOINT}/:id`), ({ params }) => {
    refreshRelations()
    const taskId = Number(params.id)
    const task = mockTasks.find((currentTask) => currentTask.id === taskId)

    if (!task) {
      return jsonNotFound('Task')
    }

    return HttpResponse.json(task)
  }),

  http.post(matchApiPath(TASKS_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as CreateTaskBody
    const taskId = nextNumericId(mockTasks)
    const createdTask = {
      '@id': `${TASKS_ENDPOINT}/${taskId}`,
      id: taskId,
      title: body.title ?? null,
      description: body.description ?? null,
      assignee: findUser(body.assignee),
      status: 'open',
      urgency: body.urgency ?? null,
      dueDate: body.dueDate ?? null,
      startedAt: null,
      completedAt: null,
      definition: null,
      entries: [],
    }

    mockTasks.unshift(createdTask)
    refreshRelations()

    return HttpResponse.json(createdTask, { status: 201 })
  }),

  http.patch(matchApiPath(`${TASKS_ENDPOINT}/:id`), async ({ params, request }) => {
    const body = (await request.json()) as UpdateTaskBody
    const taskId = Number(params.id)
    const task = mockTasks.find((currentTask) => currentTask.id === taskId)

    if (!task) {
      return jsonNotFound('Task')
    }

    if (body.title !== undefined) task.title = body.title
    if (body.description !== undefined) task.description = body.description
    if (body.assignee !== undefined) task.assignee = findUser(body.assignee)
    if (body.urgency !== undefined) task.urgency = body.urgency
    if (body.dueDate !== undefined) task.dueDate = body.dueDate

    return HttpResponse.json(task)
  }),

  http.delete(matchApiPath(`${TASKS_ENDPOINT}/:id`), ({ params }) => {
    const taskId = Number(params.id)
    const taskIndex = mockTasks.findIndex((currentTask) => currentTask.id === taskId)

    if (taskIndex === -1) {
      return jsonNotFound('Task')
    }

    const taskIri = mockTasks[taskIndex]?.['@id']
    mockTasks.splice(taskIndex, 1)

    for (let entryIndex = mockTaskEntries.length - 1; entryIndex >= 0; entryIndex -= 1) {
      if (mockTaskEntries[entryIndex]?.task === taskIri) {
        mockTaskEntries.splice(entryIndex, 1)
      }
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.get(matchApiPath(TASK_DEFINITIONS_ENDPOINT), () => {
    refreshRelations()
    return jsonCollection(mockTaskDefinitions)
  }),

  http.get(matchApiPath(`${TASK_DEFINITIONS_ENDPOINT}/:id`), ({ params }) => {
    refreshRelations()
    const definitionId = Number(params.id)
    const definition = mockTaskDefinitions.find((currentDefinition) => currentDefinition.id === definitionId)

    if (!definition) {
      return jsonNotFound('TaskDefinition')
    }

    return HttpResponse.json(definition)
  }),

  http.post(matchApiPath(TASK_DEFINITIONS_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as CreateTaskDefinitionBody
    const definitionId = nextNumericId(mockTaskDefinitions)
    const createdDefinition = {
      '@id': `${TASK_DEFINITIONS_ENDPOINT}/${definitionId}`,
      id: definitionId,
      title: body.title ?? null,
      description: body.description ?? null,
      urgency: body.urgency ?? null,
      recurrenceType: body.recurrenceType ?? null,
      recurrenceInterval: body.recurrenceInterval ?? null,
      dayOfWeek: body.dayOfWeek ?? null,
      weekOrdinal: body.weekOrdinal ?? null,
      active: true,
      entryTemplates: [],
    }

    mockTaskDefinitions.unshift(createdDefinition)
    refreshRelations()

    return HttpResponse.json(createdDefinition, { status: 201 })
  }),

  http.patch(matchApiPath(`${TASK_DEFINITIONS_ENDPOINT}/:id`), async ({ params, request }) => {
    const body = (await request.json()) as UpdateTaskDefinitionBody
    const definitionId = Number(params.id)
    const definition = mockTaskDefinitions.find((currentDefinition) => currentDefinition.id === definitionId)

    if (!definition) {
      return jsonNotFound('TaskDefinition')
    }

    if (body.title !== undefined) definition.title = body.title
    if (body.description !== undefined) definition.description = body.description
    if (body.urgency !== undefined) definition.urgency = body.urgency
    if (body.recurrenceType !== undefined) definition.recurrenceType = body.recurrenceType
    if (body.recurrenceInterval !== undefined) definition.recurrenceInterval = body.recurrenceInterval
    if (body.dayOfWeek !== undefined) definition.dayOfWeek = body.dayOfWeek
    if (body.weekOrdinal !== undefined) definition.weekOrdinal = body.weekOrdinal

    refreshRelations()
    return HttpResponse.json(definition)
  }),

  http.delete(matchApiPath(`${TASK_DEFINITIONS_ENDPOINT}/:id`), ({ params }) => {
    const definitionId = Number(params.id)
    const definitionIndex = mockTaskDefinitions.findIndex(
      (currentDefinition) => currentDefinition.id === definitionId,
    )

    if (definitionIndex === -1) {
      return jsonNotFound('TaskDefinition')
    }

    const definitionIri = mockTaskDefinitions[definitionIndex]?.['@id']
    mockTaskDefinitions.splice(definitionIndex, 1)

    for (let templateIndex = mockTaskEntryTemplates.length - 1; templateIndex >= 0; templateIndex -= 1) {
      if (mockTaskEntryTemplates[templateIndex]?.definition === definitionIri) {
        mockTaskEntryTemplates.splice(templateIndex, 1)
      }
    }

    for (const task of mockTasks) {
      if (task.definition === definitionIri) {
        task.definition = null
      }
    }

    refreshRelations()
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(matchApiPath(TASK_ENTRY_TEMPLATES_ENDPOINT), () => {
    refreshRelations()
    return jsonCollection(mockTaskEntryTemplates)
  }),

  http.get(matchApiPath(`${TASK_ENTRY_TEMPLATES_ENDPOINT}/:id`), ({ params }) => {
    refreshRelations()
    const templateId = Number(params.id)
    const template = mockTaskEntryTemplates.find((currentTemplate) => currentTemplate.id === templateId)

    if (!template) {
      return jsonNotFound('TaskEntryTemplate')
    }

    return HttpResponse.json(template)
  }),

  http.post(matchApiPath(TASK_ENTRY_TEMPLATES_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as CreateTaskEntryTemplateBody
    const templateId = nextNumericId(mockTaskEntryTemplates)
    const createdTemplate = {
      '@id': `${TASK_ENTRY_TEMPLATES_ENDPOINT}/${templateId}`,
      id: templateId,
      definition: body.definition,
      description: body.description,
      sortOrder: body.sortOrder ?? mockTaskEntryTemplates.length + 1,
    }

    mockTaskEntryTemplates.push(createdTemplate)
    refreshRelations()

    return HttpResponse.json(createdTemplate, { status: 201 })
  }),

  http.put(matchApiPath(`${TASK_ENTRY_TEMPLATES_ENDPOINT}/:id`), async ({ params, request }) => {
    const body = (await request.json()) as CreateTaskEntryTemplateBody
    const templateId = Number(params.id)
    const template = mockTaskEntryTemplates.find((currentTemplate) => currentTemplate.id === templateId)

    if (!template) {
      return jsonNotFound('TaskEntryTemplate')
    }

    template.definition = body.definition
    template.description = body.description
    template.sortOrder = body.sortOrder ?? template.sortOrder
    refreshRelations()

    return HttpResponse.json(template)
  }),

  http.patch(matchApiPath(`${TASK_ENTRY_TEMPLATES_ENDPOINT}/:id`), async ({ params, request }) => {
    const body = (await request.json()) as UpdateTaskEntryTemplateBody
    const templateId = Number(params.id)
    const template = mockTaskEntryTemplates.find((currentTemplate) => currentTemplate.id === templateId)

    if (!template) {
      return jsonNotFound('TaskEntryTemplate')
    }

    if (body.description !== undefined) template.description = body.description
    if (body.sortOrder !== undefined) template.sortOrder = body.sortOrder
    refreshRelations()

    return HttpResponse.json(template)
  }),

  http.delete(matchApiPath(`${TASK_ENTRY_TEMPLATES_ENDPOINT}/:id`), ({ params }) => {
    const templateId = Number(params.id)
    const templateIndex = mockTaskEntryTemplates.findIndex(
      (currentTemplate) => currentTemplate.id === templateId,
    )

    if (templateIndex === -1) {
      return jsonNotFound('TaskEntryTemplate')
    }

    mockTaskEntryTemplates.splice(templateIndex, 1)
    refreshRelations()

    return new HttpResponse(null, { status: 204 })
  }),

  http.get(matchApiPath(TASK_ENTRIES_ENDPOINT), () => {
    refreshRelations()
    return jsonCollection(mockTaskEntries)
  }),

  http.get(matchApiPath(`${TASK_ENTRIES_ENDPOINT}/:id`), ({ params }) => {
    refreshRelations()
    const entryId = Number(params.id)
    const entry = mockTaskEntries.find((taskEntry) => taskEntry.id === entryId)

    if (!entry) {
      return jsonNotFound('TaskEntry')
    }

    return HttpResponse.json(entry)
  }),

  http.post(matchApiPath(TASK_ENTRIES_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as CreateTaskEntryBody
    const entryId = nextNumericId(mockTaskEntries)
    const createdEntry = {
      '@id': `${TASK_ENTRIES_ENDPOINT}/${entryId}`,
      id: entryId,
      task: body.task,
      description: body.description,
      sortOrder: body.sortOrder ?? mockTaskEntries.length + 1,
      completedAt: null,
      completedBy: null,
    }

    mockTaskEntries.push(createdEntry)
    refreshRelations()

    return HttpResponse.json(createdEntry, { status: 201 })
  }),

  http.put(matchApiPath(`${TASK_ENTRIES_ENDPOINT}/:id`), async ({ params, request }) => {
    const body = (await request.json()) as CreateTaskEntryBody
    const entryId = Number(params.id)
    const entry = mockTaskEntries.find((taskEntry) => taskEntry.id === entryId)

    if (!entry) {
      return jsonNotFound('TaskEntry')
    }

    entry.task = body.task
    entry.description = body.description
    entry.sortOrder = body.sortOrder ?? entry.sortOrder
    refreshRelations()

    return HttpResponse.json(entry)
  }),

  http.patch(matchApiPath(`${TASK_ENTRIES_ENDPOINT}/:id`), async ({ params, request }) => {
    const body = (await request.json()) as UpdateTaskEntryBody
    const entryId = Number(params.id)
    const entry = mockTaskEntries.find((taskEntry) => taskEntry.id === entryId)

    if (!entry) {
      return jsonNotFound('TaskEntry')
    }

    if (body.description !== undefined) entry.description = body.description
    if (body.sortOrder !== undefined) entry.sortOrder = body.sortOrder
    refreshRelations()

    return HttpResponse.json(entry)
  }),

  http.delete(matchApiPath(`${TASK_ENTRIES_ENDPOINT}/:id`), ({ params }) => {
    const entryId = Number(params.id)
    const entryIndex = mockTaskEntries.findIndex((taskEntry) => taskEntry.id === entryId)

    if (entryIndex === -1) {
      return jsonNotFound('TaskEntry')
    }

    mockTaskEntries.splice(entryIndex, 1)
    refreshRelations()

    return new HttpResponse(null, { status: 204 })
  }),
]
