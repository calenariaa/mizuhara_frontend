import { http } from 'msw'

import { mockProductInformation } from '@/modules/catalog/mocks/data/productInformation'
import { PRODUCT_INFORMATIONS_ENDPOINT } from '@/modules/catalog/services/endpoints'
import { jsonCollection, matchApiPath } from '@/shared/mocks/utils'

export const productInformationHandlers = [
  http.get(matchApiPath(PRODUCT_INFORMATIONS_ENDPOINT), () =>
    jsonCollection(mockProductInformation),
  ),
]
