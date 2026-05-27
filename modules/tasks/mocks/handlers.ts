import { http, HttpResponse } from 'msw'

import { mockGenericTasks, mockTaskEntries } from '@/modules/tasks/mocks/data/tasks'
import { GENERIC_TASKS_ENDPOINT, TASK_ENTRIES_ENDPOINT } from '@/modules/tasks/services/endpoints'
import { mockUsers } from '@/modules/user/mocks/data/users'
import { jsonCollection, jsonNotFound, matchApiPath, nextNumericId } from '@/shared/mocks/utils'

type CreateGenericTaskBody = {
  name?: string
  assignee?: string
}

type UpdateGenericTaskBody = {
  name?: string | null
  assignee?: string | null
  status?: string | null
}

type CreateTaskEntryBody = {
  task: string
  description: string
  sortOrder?: number
}

type UpdateTaskEntryBody = {
  description?: string
  sortOrder?: number
}

const findUser = (userIri: string | null | undefined) =>
  userIri ? mockUsers.find((user) => user['@id'] === userIri) ?? userIri : null

const refreshTaskEntries = () => {
  for (const task of mockGenericTasks) {
    const taskIri = task['@id']
    task.entries = mockTaskEntries
      .filter((entry) => entry.task === taskIri)
      .sort((firstEntry, secondEntry) => firstEntry.sortOrder - secondEntry.sortOrder)
  }
}

export const taskHandlers = [
  http.get(matchApiPath(GENERIC_TASKS_ENDPOINT), () => {
    refreshTaskEntries()
    return jsonCollection(mockGenericTasks)
  }),

  http.get(matchApiPath(`${GENERIC_TASKS_ENDPOINT}/:id`), ({ params }) => {
    refreshTaskEntries()
    const taskId = Number(params.id)
    const task = mockGenericTasks.find((genericTask) => genericTask.id === taskId)

    if (!task) {
      return jsonNotFound('GenericTask')
    }

    return HttpResponse.json(task)
  }),

  http.post(matchApiPath(GENERIC_TASKS_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as CreateGenericTaskBody
    const taskId = nextNumericId(mockGenericTasks)
    const createdTask = {
      '@id': `${GENERIC_TASKS_ENDPOINT}/${taskId}`,
      id: taskId,
      name: body.name ?? null,
      assignee: findUser(body.assignee),
      status: 'open',
      startedAt: null,
      completedAt: null,
      entries: [],
    }

    mockGenericTasks.push(createdTask)

    return HttpResponse.json(createdTask, { status: 201 })
  }),

  http.patch(matchApiPath(`${GENERIC_TASKS_ENDPOINT}/:id`), async ({ params, request }) => {
    const body = (await request.json()) as UpdateGenericTaskBody
    const taskId = Number(params.id)
    const task = mockGenericTasks.find((genericTask) => genericTask.id === taskId)

    if (!task) {
      return jsonNotFound('GenericTask')
    }

    if (body.name !== undefined) task.name = body.name
    if (body.assignee !== undefined) task.assignee = findUser(body.assignee)
    if (body.status !== undefined) task.status = body.status

    return HttpResponse.json(task)
  }),

  http.delete(matchApiPath(`${GENERIC_TASKS_ENDPOINT}/:id`), ({ params }) => {
    const taskId = Number(params.id)
    const taskIndex = mockGenericTasks.findIndex((genericTask) => genericTask.id === taskId)

    if (taskIndex === -1) {
      return jsonNotFound('GenericTask')
    }

    const taskIri = mockGenericTasks[taskIndex]?.['@id']
    mockGenericTasks.splice(taskIndex, 1)

    for (let entryIndex = mockTaskEntries.length - 1; entryIndex >= 0; entryIndex -= 1) {
      if (mockTaskEntries[entryIndex]?.task === taskIri) {
        mockTaskEntries.splice(entryIndex, 1)
      }
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.get(matchApiPath(TASK_ENTRIES_ENDPOINT), () => jsonCollection(mockTaskEntries)),

  http.get(matchApiPath(`${TASK_ENTRIES_ENDPOINT}/:id`), ({ params }) => {
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
    refreshTaskEntries()

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
    refreshTaskEntries()

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
    refreshTaskEntries()

    return HttpResponse.json(entry)
  }),

  http.delete(matchApiPath(`${TASK_ENTRIES_ENDPOINT}/:id`), ({ params }) => {
    const entryId = Number(params.id)
    const entryIndex = mockTaskEntries.findIndex((taskEntry) => taskEntry.id === entryId)

    if (entryIndex === -1) {
      return jsonNotFound('TaskEntry')
    }

    mockTaskEntries.splice(entryIndex, 1)
    refreshTaskEntries()

    return new HttpResponse(null, { status: 204 })
  }),
]
