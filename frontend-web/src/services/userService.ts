import type { UpdateUserProfilePayload, UserProfile } from '../types'
import { findDepartmentById, findMunicipalityById } from '../utils/catalogs'
import {
  normalizeEmail,
  normalizeTrimmedValue,
  normalizeUsernameForComparison,
} from '../utils/authValidation'
import { simulateRequest } from './apiClient'
import { getUsers, saveUsers, toUserProfile } from './authStorage'
import { MockValidationError } from './errors'

export const userService = {
  async getProfile(userId: string) {
    return simulateRequest<UserProfile | null>(
      '/api/users/me',
      () => {
        const user = getUsers().find((item) => item.id === userId)
        if (!user) {
          return null
        }

        return toUserProfile(user)
      },
      'Perfil mock consultado.',
    )
  },

  async updateProfile(userId: string, payload: UpdateUserProfilePayload) {
    return simulateRequest<UserProfile>(
      '/api/v1/usuarios/me/perfil',
      () => {
        const users = getUsers()
        const userIndex = users.findIndex((item) => item.id === userId)
        if (userIndex < 0) {
          throw new Error('No fue posible encontrar el perfil que deseas actualizar.')
        }

        const fieldErrors: Record<string, string> = {}
        const normalizedEmail = normalizeEmail(payload.email)
        const normalizedUsername = normalizeUsernameForComparison(payload.username)
        const department = findDepartmentById(payload.departmentId)
        const municipality = findMunicipalityById(payload.departmentId, payload.municipalityId)

        if (
          users.some((item) => item.id !== userId && item.normalizedEmail === normalizedEmail)
        ) {
          fieldErrors.email = 'El correo ya está registrado por otro usuario.'
        }

        if (
          users.some(
            (item) => item.id !== userId && item.normalizedUsername === normalizedUsername,
          )
        ) {
          fieldErrors.username = 'El nombre de usuario ya está en uso.'
        }

        if (!department) {
          fieldErrors.departmentId = 'Selecciona un departamento válido.'
        }

        if (!municipality) {
          fieldErrors.municipalityId = 'Selecciona una ciudad válida para el departamento.'
        }

        if (Object.keys(fieldErrors).length > 0) {
          throw new MockValidationError('Revisa los datos del perfil.', fieldErrors)
        }

        const currentUser = users[userIndex]
        const firstName = normalizeTrimmedValue(payload.firstName)
        const lastName = normalizeTrimmedValue(payload.lastName)
        const updatedUser = {
          ...currentUser,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          username: normalizeTrimmedValue(payload.username),
          normalizedUsername,
          email: normalizeTrimmedValue(payload.email),
          normalizedEmail,
          phone: normalizeTrimmedValue(payload.phone),
          departmentId: payload.departmentId,
          departmentName: department?.name ?? '',
          municipalityId: payload.municipalityId,
          municipalityName: municipality?.name ?? '',
        }

        const updatedUsers = [...users]
        updatedUsers[userIndex] = updatedUser
        saveUsers(updatedUsers)

        return toUserProfile(updatedUser)
      },
      'Perfil guardado en el almacenamiento mock de este dispositivo.',
    )
  },
}
