import { http, HttpResponse } from 'msw'

import type { ProductInformation } from '@/types/api/products/productInformation'
import type { User } from '@/types/api/users/user'

import { shoppingListCollections } from '@/modules/shoppingList/mocks/data/shoppingListCollections'
import {
  SHOPPING_LIST_COLLECTIONS_ENDPOINT,
  SHOPPING_LIST_ENTRIES_ENDPOINT,
  SHOPPING_LISTS_ENDPOINT,
} from '@/modules/shoppingList/services/endpoints'

const apiPath = (path: string) => `*${path}`

const users: User[] = [
  {
    '@id': '/api/users/1',
    id: 1,
    email: 'kira@example.test',
    username: 'kira',
    active: true,
  },
]

const products: ProductInformation[] = [
  {
    '@id': '/api/product_informations/1',
    id: 1,
    code: 'MILK',
    productName: 'Milch',
  },
  {
    '@id': '/api/product_informations/2',
    id: 2,
    code: 'BREAD',
    productName: 'Brot',
  },
]

const shoppingLists = () =>
  shoppingListCollections.flatMap((collection) =>
    (collection.shoppingLists ?? []).filter((item) => typeof item === 'object'),
  )

const shoppingListEntries = () =>
  shoppingLists().flatMap((list) =>
    (list.shoppingListEntries ?? []).filter((item) => typeof item === 'object'),
  )

export const shoppingListHandlers = [
  http.get(apiPath('/api'), () => {
    return HttpResponse.json({
      shoppingListCollection: SHOPPING_LIST_COLLECTIONS_ENDPOINT,
      shoppingList: SHOPPING_LISTS_ENDPOINT,
      shoppingListEntry: '/api/shopping_list_entries',
      user: '/api/users',
      productInformation: '/api/product_informations',
    })
  }),

  http.get(apiPath('/api/users'), () => {
    return HttpResponse.json({
      member: users,
      totalItems: users.length,
    })
  }),

  http.get(apiPath('/api/product_informations'), () => {
    return HttpResponse.json({
      member: products,
      totalItems: products.length,
    })
  }),

  http.get(apiPath(SHOPPING_LIST_COLLECTIONS_ENDPOINT), () => {
    return HttpResponse.json({
      member: shoppingListCollections,
      totalItems: shoppingListCollections.length,
    })
  }),

  http.get(apiPath(`${SHOPPING_LIST_COLLECTIONS_ENDPOINT}/:id`), ({ params }) => {
    const item = shoppingListCollections.find((entry) => entry.id === Number(params.id))

    if (!item) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  }),

  http.post(apiPath(SHOPPING_LIST_COLLECTIONS_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      description?: string | null
      owner: string
    }
    const id = Math.max(0, ...shoppingListCollections.map((collection) => collection.id ?? 0)) + 1

    const created = {
      '@id': `${SHOPPING_LIST_COLLECTIONS_ENDPOINT}/${id}`,
      id,
      name: body.name,
      description: body.description ?? null,
      owner: body.owner,
      shoppingLists: [],
    }

    shoppingListCollections.push(created)

    return HttpResponse.json(created, { status: 201 })
  }),

  http.get(apiPath(SHOPPING_LISTS_ENDPOINT), () => {
    const items = shoppingLists()

    return HttpResponse.json({
      member: items,
      totalItems: items.length,
    })
  }),

  http.get(apiPath(`${SHOPPING_LISTS_ENDPOINT}/:id`), ({ params }) => {
    const item = shoppingLists().find((entry) => entry.id === Number(params.id))

    if (!item) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  }),

  http.post(apiPath(SHOPPING_LISTS_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      shoppingListCollection?: string
    }
    const id = Math.max(0, ...shoppingLists().map((list) => list.id ?? 0)) + 1
    const collection = shoppingListCollections.find(
      (item) => item['@id'] === body.shoppingListCollection,
    )

    const created = {
      '@id': `${SHOPPING_LISTS_ENDPOINT}/${id}`,
      id,
      name: body.name,
      shoppingListEntries: [],
    }

    if (collection) {
      collection.shoppingLists = [created, ...(collection.shoppingLists ?? [])]
    }

    return HttpResponse.json(created, { status: 201 })
  }),

  http.post(apiPath(SHOPPING_LIST_ENTRIES_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as {
      shoppingList: string
      productInformation: string
      quantity: number
      addedBy?: string
      acquired?: boolean
    }
    const id = Math.max(0, ...shoppingListEntries().map((entry) => entry.id ?? 0)) + 1
    const list = shoppingLists().find((item) => item['@id'] === body.shoppingList)
    const product = products.find((item) => item['@id'] === body.productInformation)
    const user = users.find((item) => item['@id'] === body.addedBy)

    const created = {
      '@id': `${SHOPPING_LIST_ENTRIES_ENDPOINT}/${id}`,
      id,
      productInformation: product ?? body.productInformation,
      addedBy: user ?? body.addedBy ?? null,
      acquired: body.acquired ?? false,
      quantity: body.quantity,
    }

    if (list) {
      list.shoppingListEntries = [created, ...(list.shoppingListEntries ?? [])]
    }

    return HttpResponse.json(created, { status: 201 })
  }),

  http.patch(apiPath(`${SHOPPING_LIST_ENTRIES_ENDPOINT}/:id`), async ({ params, request }) => {
    const body = (await request.json()) as {
      productInformation?: string
      quantity?: number
      addedBy?: string
      acquired?: boolean
    }
    const entry = shoppingListEntries().find((item) => item.id === Number(params.id))

    if (!entry) {
      return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    }

    if (typeof body.acquired === 'boolean') entry.acquired = body.acquired
    if (typeof body.quantity === 'number') entry.quantity = body.quantity
    if (body.productInformation) {
      entry.productInformation =
        products.find((item) => item['@id'] === body.productInformation) ?? body.productInformation
    }
    if (body.addedBy) {
      entry.addedBy = users.find((item) => item['@id'] === body.addedBy) ?? body.addedBy
    }

    return HttpResponse.json(entry)
  }),

  http.delete(apiPath(`${SHOPPING_LIST_ENTRIES_ENDPOINT}/:id`), ({ params }) => {
    for (const list of shoppingLists()) {
      const entries = list.shoppingListEntries ?? []
      const nextEntries = entries.filter(
        (entry) => typeof entry !== 'object' || entry.id !== Number(params.id),
      )

      if (nextEntries.length !== entries.length) {
        list.shoppingListEntries = nextEntries
        return new HttpResponse(null, { status: 204 })
      }
    }

    return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
  }),
]
