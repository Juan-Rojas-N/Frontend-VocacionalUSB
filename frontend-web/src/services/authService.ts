import type {
  ApiEnvelope,
  AuthSession,
  LoginPayload,
  RecoverPasswordPayload,
  RegisterPayload,
  UserProfile,
} from '../types'
import { api } from './apiClient'
import { setAccessToken } from './tokenStore'
import type { BackendUsuarioResponse } from './userService'
import { mapBackendUser } from './userService'

interface LoginResponse {
  token: string
  type: string
  expiresIn: number
  username: string | null
  rol: string
}

interface MensajeResponse {
  message: string
}

async function fetchCurrentProfile(): Promise<UserProfile> {
  const response = await api.get<BackendUsuarioResponse>('/usuarios/me')
  return mapBackendUser(response.data)
}

function toAcademicProgramId(value: string | undefined): number | null {
  if (value && /^\d+$/.test(value)) {
    return Number(value)
  }
  return null
}

export const authService = {
  async login(payload: LoginPayload): Promise<ApiEnvelope<AuthSession>> {
    const response = await api.post<LoginResponse>('/auth/login', {
      username: payload.identifier,
      password: payload.password,
    })

    setAccessToken(response.data.token)

    const profile = await fetchCurrentProfile()

    return {
      data: {
        accessToken: response.data.token,
        refreshToken: '',
        expiresAt: new Date(Date.now() + response.data.expiresIn * 1000).toISOString(),
        user: profile,
      },
      endpoint: '/auth/login',
      mocked: false,
      requestedAt: response.requestedAt,
    }
  },

  async register(payload: RegisterPayload) {
    await api.post<BackendUsuarioResponse>('/auth/register', {
      idPrograma: toAcademicProgramId(payload.academicProgramId),
      nombre: payload.firstName,
      apellidos: payload.lastName,
      documento: payload.document,
      correo: payload.email,
      nombreUsuario: payload.username,
      telefono: payload.phone || null,
      fechaNacimiento: payload.birthDate || null,
      genero: payload.gender,
      generoOtro: payload.genderOther || null,
      departamento: payload.departmentId,
      municipio: payload.municipalityId,
      semestre: payload.semester ? Number(payload.semester) : null,
      contrasena: payload.password,
    })

    return authService.login({
      identifier: payload.username,
      password: payload.password,
      rememberMe: false,
    })
  },

  async recoverPassword(
    payload: RecoverPasswordPayload,
  ): Promise<ApiEnvelope<{ status: string }>> {
    const response = await api.post<MensajeResponse>('/auth/forgot-password', {
      correo: payload.email,
    })

    return {
      data: { status: response.data.message },
      endpoint: '/auth/forgot-password',
      mocked: false,
      requestedAt: response.requestedAt,
    }
  },
}
