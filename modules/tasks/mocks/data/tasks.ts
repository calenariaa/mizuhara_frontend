import type { Task } from '@/types/api/tasks/task'
import type { TaskDefinition } from '@/types/api/tasks/taskDefinition'
import type { TaskEntry } from '@/types/api/tasks/taskEntry'
import type { TaskEntryTemplate } from '@/types/api/tasks/taskEntryTemplate'

import { mockUsers } from '@/modules/user/mocks/data/users'

const kira = mockUsers.find((user) => user.username === 'kira')
const misha = mockUsers.find((user) => user.username === 'misha')

export const mockTaskEntryTemplates: TaskEntryTemplate[] = [
  {
    '@id': '/api/task_entry_templates/1',
    id: 1,
    definition: '/api/task_definitions/1',
    description: 'Küche wischen',
    sortOrder: 1,
  },
  {
    '@id': '/api/task_entry_templates/2',
    id: 2,
    definition: '/api/task_definitions/1',
    description: 'Müll rausbringen',
    sortOrder: 2,
  },
  {
    '@id': '/api/task_entry_templates/3',
    id: 3,
    definition: '/api/task_definitions/2',
    description: 'Pflanzen gießen',
    sortOrder: 1,
  },
]

export const mockTaskDefinitions: TaskDefinition[] = [
  {
    '@id': '/api/task_definitions/1',
    id: 1,
    title: 'Wöchentliche Reinigung',
    description: 'Einmal pro Woche durch die Wohnung gehen und die Basics erledigen.',
    urgency: 'NORMAL',
    recurrenceType: 'WEEKLY',
    recurrenceInterval: 1,
    dayOfWeek: 'MONDAY',
    weekOrdinal: 'FIRST',
    active: true,
    entryTemplates: mockTaskEntryTemplates.filter(
      (template) => template.definition === '/api/task_definitions/1',
    ),
  },
  {
    '@id': '/api/task_definitions/2',
    id: 2,
    title: 'Pflanzenpflege',
    description: 'Regelmäßig gießen, prüfen und pflegen.',
    urgency: 'IMPORTANT',
    recurrenceType: 'WEEKLY',
    recurrenceInterval: 2,
    dayOfWeek: 'SUNDAY',
    weekOrdinal: 'SECOND',
    active: true,
    entryTemplates: mockTaskEntryTemplates.filter(
      (template) => template.definition === '/api/task_definitions/2',
    ),
  },
]

export const mockTaskEntries: TaskEntry[] = [
  {
    '@id': '/api/task_entries/1',
    id: 1,
    task: '/api/tasks/1',
    description: 'Küche aufräumen',
    sortOrder: 1,
    completedAt: null,
    completedBy: null,
  },
  {
    '@id': '/api/task_entries/2',
    id: 2,
    task: '/api/tasks/1',
    description: 'Müllsack wechseln',
    sortOrder: 2,
    completedAt: '2026-05-26T18:00:00+00:00',
    completedBy: misha ?? '/api/users/2',
  },
  {
    '@id': '/api/task_entries/3',
    id: 3,
    task: '/api/tasks/2',
    description: 'Pflanzen gießen',
    sortOrder: 1,
    completedAt: null,
    completedBy: null,
  },
]

export const mockTasks: Task[] = [
  {
    '@id': '/api/tasks/1',
    id: 1,
    title: 'Wohnung aufräumen',
    description: 'Samstagsrunde für die Wohnung.',
    assignee: kira ?? '/api/users/1',
    status: 'in_progress',
    urgency: 'CRITICAL',
    dueDate: '2026-05-29T18:00:00+00:00',
    startedAt: '2026-05-26T17:00:00+00:00',
    completedAt: null,
    definition: '/api/task_definitions/1',
    entries: mockTaskEntries.filter((entry) => entry.task === '/api/tasks/1'),
  },
  {
    '@id': '/api/tasks/2',
    id: 2,
    title: 'Pflanzenpflege',
    description: 'Gießen und den Zustand prüfen.',
    assignee: misha ?? '/api/users/2',
    status: 'open',
    urgency: 'WHENEVER',
    dueDate: null,
    startedAt: null,
    completedAt: null,
    definition: '/api/task_definitions/2',
    entries: mockTaskEntries.filter((entry) => entry.task === '/api/tasks/2'),
  },
]
