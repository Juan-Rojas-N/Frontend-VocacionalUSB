import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'
import { clearAccessToken } from '../services/tokenStore'
import type { LoginPayload, RegisterPayload, UserProfile } from '../types'

interface AuthState {
  sessionUser: UserProfile | null
  accessToken: string | null
  signIn: (payload: LoginPayload) => Promise<UserProfile>
  register: (payload: RegisterPayload) => Promise<UserProfile>
  updateSessionUser: (profile: UserProfile) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sessionUser: null,
      accessToken: null,
      async signIn(payload) {
        const response = await authService.login(payload)
        set({
          sessionUser: response.data.user,
          accessToken: response.data.accessToken,
        })
        return response.data.user
      },
      async register(payload) {
        const response = await authService.register(payload)
        set({
          sessionUser: response.data.user,
          accessToken: response.data.accessToken,
        })
        return response.data.user
      },
      updateSessionUser(profile) {
        set({ sessionUser: profile })
      },
      signOut() {
        clearAccessToken()
        set({ sessionUser: null, accessToken: null })
      },
    }),
    {
      name: 'usb-vocacional-auth',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as
          | { sessionUser?: UserProfile | null; accessToken?: string | null }
          | undefined
        const role = state?.sessionUser?.role as string | undefined

        if (state?.sessionUser && role === 'admin') {
          return {
            sessionUser: {
              ...state.sessionUser,
              role: 'administrator' as const,
            },
            accessToken: state.accessToken ?? null,
          }
        }

        return {
          sessionUser: state?.sessionUser ?? null,
          accessToken: state?.accessToken ?? null,
        }
      },
      partialize: (state) => ({
        sessionUser: state.sessionUser,
        accessToken: state.accessToken,
      }),
    },
  ),
)
