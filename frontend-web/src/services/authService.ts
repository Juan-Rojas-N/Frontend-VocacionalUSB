import { LEGAL_DOCUMENT_VERSIONS } from '../constants'
import type {
  AuthSession,
  LoginPayload,
  RecoverPasswordPayload,
  RegisterPayload,
  RegisteredUserRecord,
  UserProfile,
} from '../types'
import {
  findAcademicProgramById,
  findDepartmentById,
  findMunicipalityById,
} from '../utils/catalogs'
import {
  calculateAgeFromBirthDate,
  getBirthDateValidationError,
  getPasswordValidationError,
  normalizeEmail,
  normalizeOptionalText,
  normalizeTrimmedValue,
  normalizeUsernameForComparison,
} from '../utils/authValidation'
import { simulateRequest } from './apiClient'
import { getUsers, saveUsers, toUserProfile } from './authStorage'
import { MockValidationError } from './errors'

function validateRegisterPayload(payload: RegisterPayload, users: RegisteredUserRecord[]) {
  const fieldErrors: Record<string, string> = {}

  if (users.some((item) => item.normalizedEmail === normalizeEmail(payload.email))) {
    fieldErrors.email = 'El correo ya está registrado.'
  }

  const normalizedUsername = normalizeUsernameForComparison(payload.username)
  if (users.some((item) => item.normalizedUsername === normalizedUsername)) {
    fieldErrors.username = 'El nombre de usuario ya está registrado.'
  }

  if (users.some((item) => item.document === normalizeTrimmedValue(payload.document))) {
    fieldErrors.document = 'El documento ya está registrado.'
  }

  const passwordError = getPasswordValidationError(payload.password)
  if (passwordError) {
    fieldErrors.password = passwordError
  }

  const birthDateError = getBirthDateValidationError(payload.birthDate)
  if (birthDateError) {
    fieldErrors.birthDate = birthDateError
  }

  if (payload.gender === 'Otro' && !normalizeOptionalText(payload.genderOther)) {
    fieldErrors.genderOther = 'Indica otra identidad de género.'
  }

  if (!payload.personalDataConsentAccepted) {
    fieldErrors.personalDataConsentAccepted =
      'Debes autorizar el tratamiento de datos personales.'
  }

  if (!payload.privacyPolicyAccepted) {
    fieldErrors.privacyPolicyAccepted = 'Debes aceptar las políticas de uso y privacidad.'
  }

  if (!payload.termsAccepted) {
    fieldErrors.termsAccepted = 'Debes aceptar los términos y condiciones.'
  }

  const department = findDepartmentById(payload.departmentId)
  const municipality = findMunicipalityById(payload.departmentId, payload.municipalityId)

  if (!department) {
    fieldErrors.departmentId = 'Selecciona un departamento válido.'
  }

  if (!municipality) {
    fieldErrors.municipalityId = 'Selecciona una ciudad válida para el departamento.'
  }

  if (!payload.institutionLinked) {
    if (payload.institutionRelationship || payload.academicProgramId || payload.semester) {
      fieldErrors.institutionLinkedChoice =
        'No se deben enviar datos académicos si el usuario no está vinculado a la universidad.'
    }
  }

  if (payload.institutionLinked && !payload.institutionRelationship) {
    fieldErrors.institutionRelationship = 'Selecciona el tipo de vinculación.'
  }

  if (payload.institutionRelationship === 'Estudiante') {
    if (!payload.academicProgramId || !findAcademicProgramById(payload.academicProgramId)) {
      fieldErrors.academicProgramId = 'Selecciona un programa académico válido.'
    }

    if (!payload.semester) {
      fieldErrors.semester = 'Selecciona el semestre actual.'
    }
  }

  if (
    payload.institutionRelationship !== 'Estudiante' &&
    (payload.academicProgramId || payload.semester)
  ) {
    fieldErrors.institutionRelationship =
      'Programa y semestre solo se aceptan para estudiantes activos.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new MockValidationError('El formulario contiene errores.', fieldErrors)
  }
}

function createUserProfile(payload: RegisterPayload): UserProfile {
  const now = new Date().toISOString()
  const age = calculateAgeFromBirthDate(payload.birthDate) ?? 18
  const department = findDepartmentById(payload.departmentId)
  const municipality = findMunicipalityById(payload.departmentId, payload.municipalityId)
  const academicProgram = payload.academicProgramId
    ? findAcademicProgramById(payload.academicProgramId)
    : undefined

  return {
    id: `usr-${crypto.randomUUID()}`,
    role: 'student',
    fullName: `${normalizeTrimmedValue(payload.firstName)} ${normalizeTrimmedValue(payload.lastName)}`,
    firstName: normalizeTrimmedValue(payload.firstName),
    lastName: normalizeTrimmedValue(payload.lastName),
    username: normalizeTrimmedValue(payload.username),
    document: normalizeTrimmedValue(payload.document),
    birthDate: payload.birthDate,
    age,
    email: normalizeTrimmedValue(payload.email),
    phone: normalizeTrimmedValue(payload.phone),
    departmentId: payload.departmentId,
    departmentName: department?.name ?? '',
    municipalityId: payload.municipalityId,
    municipalityName: municipality?.name ?? '',
    gender: payload.gender,
    genderOther: payload.gender === 'Otro' ? normalizeOptionalText(payload.genderOther) : undefined,
    institutionLinked: payload.institutionLinked,
    institutionRelationship: payload.institutionLinked ? payload.institutionRelationship : undefined,
    academicProgramId:
      payload.institutionRelationship === 'Estudiante' ? payload.academicProgramId : undefined,
    academicProgramName:
      payload.institutionRelationship === 'Estudiante' ? academicProgram?.name : undefined,
    semester: payload.institutionRelationship === 'Estudiante' ? payload.semester : undefined,
    personalDataConsentAccepted: payload.personalDataConsentAccepted,
    personalDataConsentAcceptedAt: now,
    personalDataConsentVersion:
      payload.personalDataConsentVersion || LEGAL_DOCUMENT_VERSIONS.personalDataConsent,
    privacyPolicyAccepted: payload.privacyPolicyAccepted,
    privacyPolicyAcceptedAt: now,
    privacyPolicyVersion: payload.privacyPolicyVersion || LEGAL_DOCUMENT_VERSIONS.privacyPolicy,
    termsAccepted: payload.termsAccepted,
    termsAcceptedAt: now,
    termsVersion: payload.termsVersion || LEGAL_DOCUMENT_VERSIONS.terms,
    createdAt: now,
  }
}

export const authService = {
  async login(payload: LoginPayload) {
    return simulateRequest<AuthSession>(
      '/api/auth/login',
      () => {
        const users = getUsers()
        const normalizedIdentifier = normalizeTrimmedValue(payload.identifier).toLowerCase()
        const user = users.find(
          (item) =>
            item.normalizedEmail === normalizedIdentifier ||
            item.normalizedUsername === normalizedIdentifier,
        )

        if (!user || user.passwordMock !== payload.password) {
          throw new Error('Credenciales inválidas.')
        }

        return {
          accessToken: `mock-token-${user.id}`,
          refreshToken: `mock-refresh-${user.id}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          user: toUserProfile(user),
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
        validateRegisterPayload(payload, users)

        const profile = createUserProfile(payload)
        const userRecord: RegisteredUserRecord = {
          ...profile,
          normalizedEmail: normalizeEmail(profile.email),
          normalizedUsername: profile.username
            ? normalizeUsernameForComparison(profile.username)
            : undefined,
          passwordMock: payload.password,
        }

        saveUsers([...users, userRecord])
        return toUserProfile(userRecord)
      },
      'Usuario mock registrado exitosamente.',
    )
  },

  async recoverPassword(payload: RecoverPasswordPayload) {
    return simulateRequest<{ status: string }>(
      '/api/auth/recover-password',
      () => {
        const user = getUsers().find(
          (item) => item.normalizedEmail === normalizeEmail(payload.email),
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
