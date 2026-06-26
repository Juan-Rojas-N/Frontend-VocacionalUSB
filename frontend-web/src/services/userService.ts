import { storageKeys } from '../mocks/data'
import type { RegisteredUserRecord, UserProfile } from '../types'
import { readStorage } from '../utils/storage'
import { simulateRequest } from './apiClient'

export const userService = {
  async getProfile(userId: string) {
    return simulateRequest<UserProfile | null>(
      '/api/users/me',
      () => {
        const users = readStorage<RegisteredUserRecord[]>(storageKeys.users, [])
        const user = users.find((item) => item.id === userId)
        if (!user) {
          return null
        }

        const { passwordMock, ...profile } = user
        void passwordMock
        return profile
      },
      'Perfil mock consultado.',
    )
  },
}
