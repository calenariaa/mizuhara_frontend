import type { ProductInformation } from '@/types/api/products/productInformation'

import { useApiClient } from '@/composables/api/useApiClient'
import { PRODUCT_INFORMATIONS_ENDPOINT } from '@/modules/catalog/services/endpoints'

export function productInformationService() {
  const { getCollection } = useApiClient()

  return {
    async getAll(): Promise<ProductInformation[]> {
      const collection = await getCollection<ProductInformation>(PRODUCT_INFORMATIONS_ENDPOINT)
      return collection.items
    },
  }
}
