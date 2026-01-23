import type { BaseEntity } from '../_shared/common'

export interface User extends BaseEntity {
  email: string
  username: string
  isActive?: boolean
  active?: boolean
}
