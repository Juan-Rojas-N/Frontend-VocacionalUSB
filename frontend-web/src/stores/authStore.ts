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
      signOut() {
        clearAccessToken()
        set({ sessionUser: null, accessToken: null })
      },
    }),
    {
      name: 'usb-vocacional-auth',
      partialize: (state) => ({
        sessionUser: state.sessionUser,
        accessToken: state.accessToken,
      }),
    },
  ),
)
