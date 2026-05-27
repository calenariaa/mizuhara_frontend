import type { User } from '@/types/api/users/user'

export const mockUsers: User[] = [
  {
    '@id': '/api/users/1',
    id: 1,
    email: 'kira@mizuhara.local',
    username: 'kira',
    active: true,
    createdAt: '2026-01-01T00:00:00+00:00',
    updatedAt: '2026-01-01T00:00:00+00:00',
  },
  {
    '@id': '/api/users/2',
    id: 2,
    email: 'misha@mizuhara.local',
    username: 'misha',
    active: true,
    createdAt: '2026-01-01T00:00:00+00:00',
    updatedAt: '2026-01-01T00:00:00+00:00',
  },
]
