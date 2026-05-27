import type { GenericTask } from '@/types/api/tasks/genericTask'
import type { TaskEntry } from '@/types/api/tasks/taskEntry'

import { mockUsers } from '@/modules/user/mocks/data/users'

const kira = mockUsers.find((user) => user.username === 'kira')
const misha = mockUsers.find((user) => user.username === 'misha')

export const mockTaskEntries: TaskEntry[] = [
  {
    '@id': '/api/task_entries/1',
    id: 1,
    task: '/api/generic_tasks/1',
    description: 'Kueche aufraeumen',
    sortOrder: 1,
    completedAt: null,
    completedBy: null,
  },
  {
    '@id': '/api/task_entries/2',
    id: 2,
    task: '/api/generic_tasks/1',
    description: 'Muellsack wechseln',
    sortOrder: 2,
    completedAt: '2026-05-26T18:00:00+00:00',
    completedBy: misha ?? '/api/users/2',
  },
  {
    '@id': '/api/task_entries/3',
    id: 3,
    task: '/api/generic_tasks/2',
    description: 'Pflanzen giessen',
    sortOrder: 1,
    completedAt: null,
    completedBy: null,
  },
]

export const mockGenericTasks: GenericTask[] = [
  {
    '@id': '/api/generic_tasks/1',
    id: 1,
    assignee: kira ?? '/api/users/1',
    status: 'in_progress',
    startedAt: '2026-05-26T17:00:00+00:00',
    completedAt: null,
    entries: mockTaskEntries.filter((entry) => entry.task === '/api/generic_tasks/1'),
  },
  {
    '@id': '/api/generic_tasks/2',
    id: 2,
    assignee: misha ?? '/api/users/2',
    status: 'open',
    startedAt: null,
    completedAt: null,
    entries: mockTaskEntries.filter((entry) => entry.task === '/api/generic_tasks/2'),
  },
]
