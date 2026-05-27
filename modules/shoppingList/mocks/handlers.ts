import { http, HttpResponse } from 'msw'

import { mockProductInformation } from '@/modules/catalog/mocks/data/productInformation'
import { shoppingListCollections } from '@/modules/shoppingList/mocks/data/shoppingListCollections'
import {
  SHOPPING_LIST_COLLECTIONS_ENDPOINT,
  SHOPPING_LIST_ENTRIES_ENDPOINT,
  SHOPPING_LISTS_ENDPOINT,
} from '@/modules/shoppingList/services/endpoints'
import { mockUsers } from '@/modules/user/mocks/data/users'
import { jsonCollection, jsonNotFound, matchApiPath, nextNumericId } from '@/shared/mocks/utils'

type CreateShoppingListCollectionBody = {
  name: string
  description?: string | null
  owner: string
}

type CreateShoppingListBody = {
  name: string
  shoppingListCollection?: string
}

type CreateShoppingListEntryBody = {
  shoppingList: string
  productInformation: string
  quantity: number
  addedBy?: string
  acquired?: boolean
}

type UpdateShoppingListEntryBody = {
  productInformation?: string
  quantity?: number
  addedBy?: string
  acquired?: boolean
}

const getMockShoppingLists = () =>
  shoppingListCollections.flatMap((collection) =>
    (collection.shoppingLists ?? []).filter((shoppingList) => typeof shoppingList === 'object'),
  )

const getMockShoppingListEntries = () =>
  getMockShoppingLists().flatMap((shoppingList) =>
    (shoppingList.shoppingListEntries ?? []).filter(
      (shoppingListEntry) => typeof shoppingListEntry === 'object',
    ),
  )

export const shoppingListHandlers = [
  http.get(matchApiPath(SHOPPING_LIST_COLLECTIONS_ENDPOINT), () =>
    jsonCollection(shoppingListCollections),
  ),

  http.get(matchApiPath(`${SHOPPING_LIST_COLLECTIONS_ENDPOINT}/:id`), ({ params }) => {
    const collectionId = Number(params.id)
    const collection = shoppingListCollections.find(
      (shoppingListCollection) => shoppingListCollection.id === collectionId,
    )

    if (!collection) {
      return jsonNotFound('ShoppingListCollection')
    }

    return HttpResponse.json(collection)
  }),

  http.post(matchApiPath(SHOPPING_LIST_COLLECTIONS_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as CreateShoppingListCollectionBody
    const collectionId = nextNumericId(shoppingListCollections)

    const createdCollection = {
      '@id': `${SHOPPING_LIST_COLLECTIONS_ENDPOINT}/${collectionId}`,
      id: collectionId,
      name: body.name,
      description: body.description ?? null,
      owner: body.owner,
      shoppingLists: [],
    }

    shoppingListCollections.push(createdCollection)

    return HttpResponse.json(createdCollection, { status: 201 })
  }),

  http.get(matchApiPath(SHOPPING_LISTS_ENDPOINT), () => jsonCollection(getMockShoppingLists())),

  http.get(matchApiPath(`${SHOPPING_LISTS_ENDPOINT}/:id`), ({ params }) => {
    const shoppingListId = Number(params.id)
    const shoppingList = getMockShoppingLists().find((list) => list.id === shoppingListId)

    if (!shoppingList) {
      return jsonNotFound('ShoppingList')
    }

    return HttpResponse.json(shoppingList)
  }),

  http.post(matchApiPath(SHOPPING_LISTS_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as CreateShoppingListBody
    const shoppingListId = nextNumericId(getMockShoppingLists())
    const collection = shoppingListCollections.find(
      (shoppingListCollection) =>
        shoppingListCollection['@id'] === body.shoppingListCollection,
    )

    const createdShoppingList = {
      '@id': `${SHOPPING_LISTS_ENDPOINT}/${shoppingListId}`,
      id: shoppingListId,
      name: body.name,
      shoppingListEntries: [],
    }

    if (collection) {
      collection.shoppingLists = [createdShoppingList, ...(collection.shoppingLists ?? [])]
    }

    return HttpResponse.json(createdShoppingList, { status: 201 })
  }),

  http.post(matchApiPath(SHOPPING_LIST_ENTRIES_ENDPOINT), async ({ request }) => {
    const body = (await request.json()) as CreateShoppingListEntryBody
    const shoppingListEntryId = nextNumericId(getMockShoppingListEntries())
    const shoppingList = getMockShoppingLists().find((list) => list['@id'] === body.shoppingList)
    const product = mockProductInformation.find(
      (productInformation) => productInformation['@id'] === body.productInformation,
    )
    const user = mockUsers.find((mockUser) => mockUser['@id'] === body.addedBy)

    const createdShoppingListEntry = {
      '@id': `${SHOPPING_LIST_ENTRIES_ENDPOINT}/${shoppingListEntryId}`,
      id: shoppingListEntryId,
      productInformation: product ?? body.productInformation,
      addedBy: user ?? body.addedBy ?? null,
      acquired: body.acquired ?? false,
      quantity: body.quantity,
    }

    if (shoppingList) {
      shoppingList.shoppingListEntries = [
        createdShoppingListEntry,
        ...(shoppingList.shoppingListEntries ?? []),
      ]
    }

    return HttpResponse.json(createdShoppingListEntry, { status: 201 })
  }),

  http.patch(
    matchApiPath(`${SHOPPING_LIST_ENTRIES_ENDPOINT}/:id`),
    async ({ params, request }) => {
      const body = (await request.json()) as UpdateShoppingListEntryBody
      const shoppingListEntryId = Number(params.id)
      const shoppingListEntry = getMockShoppingListEntries().find(
        (entry) => entry.id === shoppingListEntryId,
      )

      if (!shoppingListEntry) {
        return jsonNotFound('ShoppingListEntry')
      }

      if (typeof body.acquired === 'boolean') shoppingListEntry.acquired = body.acquired
      if (typeof body.quantity === 'number') shoppingListEntry.quantity = body.quantity
      if (body.productInformation) {
        shoppingListEntry.productInformation =
          mockProductInformation.find(
            (productInformation) => productInformation['@id'] === body.productInformation,
          ) ?? body.productInformation
      }
      if (body.addedBy) {
        shoppingListEntry.addedBy =
          mockUsers.find((mockUser) => mockUser['@id'] === body.addedBy) ?? body.addedBy
      }

      return HttpResponse.json(shoppingListEntry)
    },
  ),

  http.delete(matchApiPath(`${SHOPPING_LIST_ENTRIES_ENDPOINT}/:id`), ({ params }) => {
    const shoppingListEntryId = Number(params.id)

    for (const shoppingList of getMockShoppingLists()) {
      const entries = shoppingList.shoppingListEntries ?? []
      const nextEntries = entries.filter(
        (entry) => typeof entry !== 'object' || entry.id !== shoppingListEntryId,
      )

      if (nextEntries.length !== entries.length) {
        shoppingList.shoppingListEntries = nextEntries
        return new HttpResponse(null, { status: 204 })
      }
    }

    return jsonNotFound('ShoppingListEntry')
  }),
]
