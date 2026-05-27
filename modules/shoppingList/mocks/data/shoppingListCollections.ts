import type { ShoppingListCollection } from '@/types/api/shoppingList/shoppingListCollection'

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
        addedBy: '/api/users/1',
        shoppingListEntries: [],
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
