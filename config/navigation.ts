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
  { id: 'general', label: 'Allgemein' },
  { id: 'shopping', label: 'Shopping' },
]

export const navItems: NavItem[] = [
  { label: 'Home', to: '/', category: 'general' },
  { label: 'Shopping Lists', to: '/shopping-lists', category: 'shopping' },
]
