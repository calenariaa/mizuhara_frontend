import { http } from 'msw'

import { mockUsers } from '@/modules/user/mocks/data/users'
import { USERS_ENDPOINT } from '@/modules/user/services/endpoints'
import { jsonCollection, matchApiPath } from '@/shared/mocks/utils'

export const userHandlers = [
  http.get(matchApiPath(USERS_ENDPOINT), () => jsonCollection(mockUsers)),
]
