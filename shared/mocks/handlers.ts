import { http, HttpResponse } from 'msw'

import { productInformationHandlers } from '@/modules/catalog/mocks/handlers'
import { PRODUCT_INFORMATIONS_ENDPOINT } from '@/modules/catalog/services/endpoints'
import { shoppingListHandlers } from '@/modules/shoppingList/mocks/handlers'
import {
  SHOPPING_LIST_COLLECTIONS_ENDPOINT,
  SHOPPING_LIST_ENTRIES_ENDPOINT,
  SHOPPING_LISTS_ENDPOINT,
} from '@/modules/shoppingList/services/endpoints'
import { taskHandlers } from '@/modules/tasks/mocks/handlers'
import { GENERIC_TASKS_ENDPOINT, TASK_ENTRIES_ENDPOINT } from '@/modules/tasks/services/endpoints'
import { userHandlers } from '@/modules/user/mocks/handlers'
import { USERS_ENDPOINT } from '@/modules/user/services/endpoints'
import { matchApiPath } from '@/shared/mocks/utils'

const apiEntrypointHandler = http.get(matchApiPath('/api'), () => {
  return HttpResponse.json({
    productInformation: PRODUCT_INFORMATIONS_ENDPOINT,
    shoppingListCollection: SHOPPING_LIST_COLLECTIONS_ENDPOINT,
    shoppingList: SHOPPING_LISTS_ENDPOINT,
    shoppingListEntry: SHOPPING_LIST_ENTRIES_ENDPOINT,
    genericTask: GENERIC_TASKS_ENDPOINT,
    taskEntry: TASK_ENTRIES_ENDPOINT,
    user: USERS_ENDPOINT,
  })
})

export const handlers = [
  apiEntrypointHandler,
  ...productInformationHandlers,
  ...shoppingListHandlers,
  ...taskHandlers,
  ...userHandlers,
]
