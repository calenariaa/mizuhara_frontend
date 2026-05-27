import type { ProductInformation } from '@/types/api/products/productInformation'
import type { ShoppingListCollection } from '@/types/api/shoppingList/shoppingListCollection'
import type { User } from '@/types/api/users/user'

import { mockProductInformation } from '@/modules/catalog/mocks/data/productInformation'
import { mockUsers } from '@/modules/user/mocks/data/users'

const requireMockProductInformation = (code: string): ProductInformation => {
  const productInformation = mockProductInformation.find((product) => product.code === code)

  if (!productInformation) {
    throw new Error(`Mock ProductInformation not found: ${code}`)
  }

  return productInformation
}

const requireMockUser = (username: string): User => {
  const user = mockUsers.find((mockUser) => mockUser.username === username)

  if (!user) {
    throw new Error(`Mock User not found: ${username}`)
  }

  return user
}

const milk = requireMockProductInformation('MILK')
const bread = requireMockProductInformation('BREAD')
const eggs = requireMockProductInformation('EGGS')
const butter = requireMockProductInformation('BUTTER')
const kira = requireMockUser('kira')
const misha = requireMockUser('misha')

export const shoppingListCollections: ShoppingListCollection[] = [
  {
    '@id': '/api/shopping_list_collections/1',
    id: 1,
    name: 'Haushalt',
    description: 'Regelmaessige Einkaeufe fuer zuhause',
    shoppingLists: [
      {
        '@id': '/api/shopping_lists/1',
        id: 1,
        name: 'Wocheneinkauf',
        addedBy: kira,
        shoppingListEntries: [
          {
            '@id': '/api/shopping_list_entries/1',
            id: 1,
            productInformation: milk,
            addedBy: kira,
            acquired: false,
            quantity: 2,
          },
          {
            '@id': '/api/shopping_list_entries/2',
            id: 2,
            productInformation: bread,
            addedBy: misha,
            acquired: false,
            quantity: 1,
          },
          {
            '@id': '/api/shopping_list_entries/3',
            id: 3,
            productInformation: eggs,
            addedBy: kira,
            acquired: true,
            quantity: 6,
          },
          {
            '@id': '/api/shopping_list_entries/4',
            id: 4,
            productInformation: butter,
            addedBy: misha,
            acquired: false,
            quantity: 1,
          },
        ],
      },
    ],
  },
  {
    '@id': '/api/shopping_list_collections/2',
    id: 2,
    name: 'Buero',
    description: 'Vorrat und Material fuer das Buero',
    shoppingLists: [],
  },
]
