export type CreateUserRequest = {
  email: string
  username: string
  isActive?: boolean
}

export type UpdateUserRequest = {
  email?: string
  username?: string
  isActive?: boolean
  shoppingLists?: string[]
  shoppingListEntries?: string[]
  tasks?: string[]
  createdAt?: string
  updatedAt?: string
}
