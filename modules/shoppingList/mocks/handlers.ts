import { http, HttpResponse } from 'msw'


import { shoppingListCollections } from '@/modules/shoppingList/mocks/data/shoppingListCollections'
import {
  SHOPPING_LIST_COLLECTIONS_ENDPOINT,
} from '@/modules/shoppingList/services/endpoints'

export const shoppingListHandlers = [
  http.get(SHOPPING_LIST_COLLECTIONS_ENDPOINT, () => {
    return HttpResponse.json({
      member: shoppingListCollections,
      totalItems: shoppingListCollections.length,
    })
  }),

  http.get(`${SHOPPING_LIST_COLLECTIONS_ENDPOINT}/:id`, ({ params }) => {
    const item = shoppingListCollections.find((entry) => entry.id === Number(params.id))

    if (!item) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  }),

  http.post(SHOPPING_LIST_COLLECTIONS_ENDPOINT, async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string | null }

    const created = {
      '@id': `${SHOPPING_LIST_COLLECTIONS_ENDPOINT}/99`,
      '@type': 'ShoppingListCollection',
      id: 99,
      name: body.name,
      description: body.description ?? null,
      owner: '/api/users/1',
      shoppingLists: [],
    }

    shoppingListCollections.push(created)

    return HttpResponse.json(created, { status: 201 })
  }),
]
