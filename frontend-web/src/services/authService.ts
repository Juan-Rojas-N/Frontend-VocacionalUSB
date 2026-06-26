import { defaultMockUsers, storageKeys } from '../mocks/data'
import type {
  AuthSession,
  LoginPayload,
  RecoverPasswordPayload,
  RegisterPayload,
  RegisteredUserRecord,
  UserProfile,
} from '../types'
import { readStorage, writeStorage } from '../utils/storage'
import { simulateRequest } from './apiClient'

function getUsers() {
  const users = readStorage<RegisteredUserRecord[]>(storageKeys.users, [])
  if (users.length > 0) {
    return users
  }

  writeStorage(storageKeys.users, defaultMockUsers)
  return defaultMockUsers
}

function saveUsers(users: RegisteredUserRecord[]) {
  writeStorage(storageKeys.users, users)
}

export const authService = {
  async login(payload: LoginPayload) {
    return simulateRequest<AuthSession>(
      '/api/auth/login',
      () => {
        if (!payload.isAdultConfirmed) {
          throw new Error('Debes confirmar que eres mayor de edad para ingresar.')
        }

        const user = getUsers().find(
          (item) =>
            item.email.toLowerCase() === payload.email.toLowerCase() &&
            item.passwordMock === payload.password,
        )

        if (!user) {
          throw new Error('Las credenciales mock no coinciden con un usuario registrado.')
        }

        const { passwordMock, ...profile } = user
        void passwordMock
        return {
          accessToken: `mock-token-${user.id}`,
          refreshToken: `mock-refresh-${user.id}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          user: profile,
        }
      },
      'Autenticación simulada completada.',
    )
  },

  async register(payload: RegisterPayload) {
    return simulateRequest<UserProfile>(
      '/api/auth/register',
      () => {
        const users = getUsers()
        if (users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase())) {
          throw new Error('Ya existe un usuario mock registrado con este correo.')
        }

        const profile: RegisteredUserRecord = {
          id: `usr-${crypto.randomUUID()}`,
          role: 'student',
          fullName: `${payload.firstName} ${payload.lastName}`,
          firstName: payload.firstName,
          lastName: payload.lastName,
          document: payload.document,
          age: payload.age,
          email: payload.email,
          phone: payload.phone,
          department: payload.department,
          city: payload.city,
          gender: payload.gender,
          genderOther: payload.genderOther,
          belongsToUniversity: payload.belongsToUniversity,
          currentCareer: payload.currentCareer,
          currentSemester: payload.currentSemester,
          dataConsent: payload.dataConsent,
          createdAt: new Date().toISOString(),
          passwordMock: payload.password,
        }

        saveUsers([...users, profile])
        const { passwordMock, ...user } = profile
        void passwordMock
        return user
      },
      'Usuario mock registrado exitosamente.',
    )
  },

  async recoverPassword(payload: RecoverPasswordPayload) {
    return simulateRequest<{ status: string }>(
      '/api/auth/recover-password',
      () => {
        const user = getUsers().find(
          (item) => item.email.toLowerCase() === payload.email.toLowerCase(),
        )

        return {
          status: user
            ? 'Se simuló el envío de un enlace de recuperación al correo registrado.'
            : 'No encontramos coincidencia, pero el flujo queda listo para backend.',
        }
      },
      'Flujo mock de recuperación ejecutado.',
    )
  },
}
