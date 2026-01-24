import type { ShoppingListDetailVM, ShoppingListEntryDisplay } from '../types/viewModels'
import type { ProductInformation } from '~/types/api/products/productInformation'
import type { ShoppingList } from '~/types/api/shoppingList/shoppingList'
import type { ShoppingListEntry } from '~/types/api/shoppingList/shoppingListEntry'

import { useResourceLoader } from '~/services/resource/useResourceLoader'

export async function loadShoppingListDetail(listIri: string): Promise<ShoppingListDetailVM> {
  const loader = useResourceLoader()

  const list = await loader.getByIri<ShoppingList>(listIri)

  const entryIris = list.shoppingListEntries ?? []
  const entries = await loader.getManyByIri<ShoppingListEntry>(entryIris)

  const productIris = entries
    .map((e) => e.productInformation)
    .filter((x): x is string => Boolean(x))
  const products = await loader.getManyByIri<ProductInformation>(productIris)

  const productByIri = new Map(products.map((p) => [p['@id'], p]))

  const displays: ShoppingListEntryDisplay[] = entries
    .map((entry) => {
      const product = productByIri.get(entry.productInformation)
      if (!product) return null
      return { entry, product }
    })
    .filter((x): x is ShoppingListEntryDisplay => x !== null)

  return { list, entries: displays }
}
