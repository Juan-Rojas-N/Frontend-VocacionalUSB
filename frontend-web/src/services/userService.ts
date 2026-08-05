import type { UserProfile } from '../types'
import { simulateRequest } from './apiClient'
import { getUsers, toUserProfile } from './authStorage'

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
}
