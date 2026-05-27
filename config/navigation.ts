export type NavCategoryId = 'general' | 'shopping'

export type NavItem = {
  labelKey: string
  path: string
  categoryId: NavCategoryId
}

export type NavCategory = {
  id: NavCategoryId
  labelKey: string
}

export type NavGroup = {
  category: NavCategory
  items: NavItem[]
}

export const navCategories: readonly NavCategory[] = [
  { id: 'general', labelKey: 'nav.categories.general' },
  { id: 'shopping', labelKey: 'nav.categories.shopping' },
]

export const navItems: readonly NavItem[] = [
  { labelKey: 'nav.items.home', path: '/', categoryId: 'general' },
  { labelKey: 'nav.items.tasks', path: '/tasks', categoryId: 'general' },
  { labelKey: 'nav.items.users', path: '/users', categoryId: 'general' },
  { labelKey: 'nav.items.shoppingLists', path: '/shopping-lists', categoryId: 'shopping' },
]

export const createNavGroups = (
  categories: readonly NavCategory[],
  items: readonly NavItem[],
): readonly NavGroup[] => {
  const itemsByCategoryId = new Map<NavCategoryId, NavItem[]>()

  for (const item of items) {
    const existingItems = itemsByCategoryId.get(item.categoryId)
    if (existingItems) {
      existingItems.push(item)
      continue
    }

    itemsByCategoryId.set(item.categoryId, [item])
  }

  return categories.map((category) => ({
    category,
    items: itemsByCategoryId.get(category.id) ?? [],
  }))
}

export const navGroups: readonly NavGroup[] = createNavGroups(navCategories, navItems)
