import type { SelectOption, UserRole } from '../types'

export const USER_ROLE_OPTIONS: Array<SelectOption<UserRole>> = [
  { value: 'student', label: 'Usuario' },
  { value: 'administrator', label: 'Administrador' },
  { value: 'root', label: 'ROOT' },
]

export function getUserRoleLabel(role: UserRole) {
  return USER_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role
}

export function hasAdministrativeAccess(role?: UserRole) {
  return role === 'administrator' || role === 'root'
}
