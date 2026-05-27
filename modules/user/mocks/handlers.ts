import { http, HttpResponse } from 'msw'

import { mockUsers } from '@/modules/user/mocks/data/users'
import { USERS_ENDPOINT } from '@/modules/user/services/endpoints'
import { jsonCollection, jsonNotFound, matchApiPath, nextNumericId } from '@/shared/mocks/utils'

type CreateUserBody = {
  email: string
  username: string
  isActive?: boolean
}

type UpdateUserBody = {
  email?: string
  username?: string
  isActive?: boolean
}

export const userHandlers = [
  http.get(matchApiPath(USERS_ENDPOINT), () => jsonCollection(mockUsers)),

  http.get(matchApiPath(`${USERS_ENDPOINT}/:id`), ({ params }) => {
    const userId = Number(params.id)
    const user = mockUsers.find((mockUser) => mockUser.id === userId)

    if (!user) {
      return jsonNotFound('User')
    }

    return HttpResponse.json(user)
  }),

  http.post(matchApiPath(USERS_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as CreateUserBody
    const userId = nextNumericId(mockUsers)
    const now = new Date().toISOString()

    const createdUser = {
      '@id': `${USERS_ENDPOINT}/${userId}`,
      id: userId,
      email: body.email,
      username: body.username,
      active: body.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    }

    mockUsers.push(createdUser)

    return HttpResponse.json(createdUser, { status: 201 })
  }),

  http.patch(matchApiPath(`${USERS_ENDPOINT}/:id`), async ({ params, request }) => {
    const userId = Number(params.id)
    const body = (await request.json()) as UpdateUserBody
    const user = mockUsers.find((mockUser) => mockUser.id === userId)

    if (!user) {
      return jsonNotFound('User')
    }

    if (body.email) user.email = body.email
    if (body.username) user.username = body.username
    if (typeof body.isActive === 'boolean') user.active = body.isActive
    user.updatedAt = new Date().toISOString()

    return HttpResponse.json(user)
  }),

  http.delete(matchApiPath(`${USERS_ENDPOINT}/:id`), ({ params }) => {
    const userId = Number(params.id)
    const userIndex = mockUsers.findIndex((mockUser) => mockUser.id === userId)

    if (userIndex === -1) {
      return jsonNotFound('User')
    }

    mockUsers.splice(userIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
