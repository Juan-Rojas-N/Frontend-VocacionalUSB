import type { GenderOption, UserProfile } from '../types'
import { calculateAgeFromBirthDate } from '../utils/authValidation'
import { api } from './apiClient'

export interface BackendUsuarioResponse {
  id: number | null
  idRol: number
  idPrograma: number | null
  nombre: string
  apellidos: string
  documento: string
  correo: string
  nombreUsuario: string | null
  telefono: string | null
  fechaNacimiento: string | null
  genero: string | null
  generoOtro: string | null
  departamento: string | null
  municipio: string | null
  semestre: number | null
  estado: boolean
  fechaCreacion: string | null
}

export interface UpdateProfilePayload {
  idPrograma?: number | null
  nombre: string
  apellidos: string
  telefono?: string | null
  genero?: string | null
  generoOtro?: string | null
  departamento?: string | null
  municipio?: string | null
  semestre?: number | null
}

const VALID_GENDERS: GenderOption[] = ['Masculino', 'Femenino', 'Prefiero no decirlo', 'Otro']

function mapGender(value: string | null): GenderOption {
  if (value && VALID_GENDERS.includes(value as GenderOption)) {
    return value as GenderOption
  }
  return 'Prefiero no decirlo'
}

export function mapBackendUser(raw: BackendUsuarioResponse): UserProfile {
  const firstName = raw.nombre ?? ''
  const lastName = raw.apellidos ?? ''
  const birthDate = raw.fechaNacimiento ?? undefined
  const academicProgramId = raw.idPrograma != null ? String(raw.idPrograma) : undefined

  return {
    id: raw.id != null ? String(raw.id) : `usr-${crypto.randomUUID()}`,
    role: raw.idRol <= 2 ? 'admin' : 'student',
    fullName: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    username: raw.nombreUsuario ?? undefined,
    document: raw.documento,
    birthDate,
    age: birthDate ? calculateAgeFromBirthDate(birthDate) ?? 18 : 18,
    email: raw.correo,
    phone: raw.telefono ?? '',
    departmentId: raw.departamento ?? '',
    departmentName: raw.departamento ?? '',
    municipalityId: raw.municipio ?? '',
    municipalityName: raw.municipio ?? '',
    gender: mapGender(raw.genero),
    genderOther: raw.generoOtro ?? undefined,
    institutionLinked: raw.idPrograma != null,
    institutionRelationship: raw.idPrograma != null ? 'Estudiante' : undefined,
    academicProgramId,
    academicProgramName: undefined,
    semester: raw.semestre != null ? String(raw.semestre) : undefined,
    personalDataConsentAccepted: false,
    privacyPolicyAccepted: false,
    termsAccepted: false,
    createdAt: raw.fechaCreacion ?? new Date().toISOString(),
  }
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<BackendUsuarioResponse>('/usuarios/me')
    return mapBackendUser(response.data)
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const response = await api.put<BackendUsuarioResponse>('/usuarios/me/perfil', payload)
    return mapBackendUser(response.data)
  },

  async deleteAccount(): Promise<void> {
    await api.delete<void>('/usuarios/me')
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
