export type NavCategoryId = 'general' | 'shopping'

export type NavItem = {
  label: string
  to: string
  category: NavCategoryId
}

export type NavCategory = {
  id: NavCategoryId
  label: string
}

export const navCategories: NavCategory[] = [
  { id: 'general', label: 'nav.categories.general' },
  { id: 'shopping', label: 'nav.categories.shopping' },
]

export const navItems: NavItem[] = [
  { label: 'nav.items.home', to: '/', category: 'general' },
  { label: 'nav.items.shoppingLists', to: '/shopping-lists', category: 'shopping' },
]
