import type { ProductInformation } from '~/types/api/products/productInformation'
import type { ShoppingList } from '~/types/api/shoppingList/shoppingList'
import type { ShoppingListEntry } from '~/types/api/shoppingList/shoppingListEntry'

export type ShoppingListEntryDisplay = {
  entry: ShoppingListEntry
  product: ProductInformation
}

export type ShoppingListDetailVM = {
  list: ShoppingList
  entries: ShoppingListEntryDisplay[]
}
