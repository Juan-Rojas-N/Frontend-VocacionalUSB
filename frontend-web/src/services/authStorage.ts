import { ACADEMIC_PROGRAM_GROUPS, LEGAL_DOCUMENT_VERSIONS } from '../constants'
import { defaultMockUsers, storageKeys } from '../mocks/data'
import type { GenderOption, RegisteredUserRecord, UserProfile } from '../types'
import { readStorage, writeStorage } from '../utils/storage'
import {
  findAcademicProgramByName,
  findDepartmentById,
  findDepartmentByName,
  findMunicipalityById,
  findMunicipalityByName,
  findMunicipalityByNameAcrossCatalog,
} from '../utils/catalogs'
import {
  calculateAgeFromBirthDate,
  deriveBirthDateFromAge,
  normalizeEmail,
  normalizeOptionalText,
  normalizeTrimmedValue,
  normalizeUsernameForComparison,
} from '../utils/authValidation'

function normalizeStoredRole(value: unknown) {
  if (value === 'root') {
    return 'root' as const
  }

  if (value === 'administrator' || value === 'admin') {
    return 'administrator' as const
  }

  return 'student' as const
}

const VALID_GENDERS: GenderOption[] = [
  'Masculino',
  'Femenino',
  'Prefiero no decirlo',
  'Otro',
]

function getAcademicProgramName(academicProgramId?: string) {
  for (const group of ACADEMIC_PROGRAM_GROUPS) {
    const program = group.programs.find((item) => item.id === academicProgramId)
    if (program) {
      return program.name
    }
  }

  return undefined
}

function resolveDepartmentAndMunicipality(rawUser: Record<string, unknown>) {
  const legacyDepartmentName =
    typeof rawUser.departmentName === 'string'
      ? rawUser.departmentName
      : typeof rawUser.department === 'string'
        ? rawUser.department
        : undefined

  const legacyMunicipalityName =
    typeof rawUser.municipalityName === 'string'
      ? rawUser.municipalityName
      : typeof rawUser.city === 'string'
        ? rawUser.city
        : undefined

  const departmentId =
    typeof rawUser.departmentId === 'string'
      ? rawUser.departmentId
      : typeof rawUser.departmentCode === 'string'
        ? rawUser.departmentCode
        : findDepartmentByName(legacyDepartmentName)?.id

  const municipalityId =
    typeof rawUser.municipalityId === 'string'
      ? rawUser.municipalityId
      : typeof rawUser.municipalityCode === 'string'
        ? rawUser.municipalityCode
        : findMunicipalityByName(departmentId, legacyMunicipalityName)?.id ??
          findMunicipalityByNameAcrossCatalog(legacyMunicipalityName)?.municipality.id

  const department = findDepartmentById(departmentId)
  const municipality = findMunicipalityById(department?.id, municipalityId)
  const fallbackMatch = !department || !municipality
    ? findMunicipalityByNameAcrossCatalog(legacyMunicipalityName)
    : null

  return {
    departmentId: department?.id ?? fallbackMatch?.department.id ?? '',
    departmentName: department?.name ?? fallbackMatch?.department.name ?? legacyDepartmentName ?? '',
    municipalityId: municipality?.id ?? fallbackMatch?.municipality.id ?? '',
    municipalityName:
      municipality?.name ?? fallbackMatch?.municipality.name ?? legacyMunicipalityName ?? '',
  }
}

function normalizeStoredUser(rawUser: Record<string, unknown>): RegisteredUserRecord {
  const firstName =
    typeof rawUser.firstName === 'string' ? normalizeTrimmedValue(rawUser.firstName) : ''
  const lastName =
    typeof rawUser.lastName === 'string' ? normalizeTrimmedValue(rawUser.lastName) : ''
  const email = typeof rawUser.email === 'string' ? normalizeTrimmedValue(rawUser.email) : ''
  const username =
    typeof rawUser.username === 'string' ? normalizeOptionalText(rawUser.username) : undefined
  const gender =
    typeof rawUser.gender === 'string' && VALID_GENDERS.includes(rawUser.gender as GenderOption)
      ? (rawUser.gender as GenderOption)
      : 'Prefiero no decirlo'
  const institutionLinked =
    typeof rawUser.institutionLinked === 'boolean'
      ? rawUser.institutionLinked
      : typeof rawUser.belongsToUniversity === 'boolean'
        ? rawUser.belongsToUniversity
        : typeof rawUser.isActiveStudent === 'boolean'
          ? rawUser.isActiveStudent
          : false
  const institutionRelationship =
    typeof rawUser.institutionRelationship === 'string'
      ? rawUser.institutionRelationship
      : rawUser.isActiveStudent === true
        ? 'Estudiante'
        : institutionLinked
          ? 'Inscrito'
          : undefined
  const academicProgramId =
    typeof rawUser.academicProgramId === 'string'
      ? rawUser.academicProgramId
      : typeof rawUser.currentCareer === 'string'
        ? findAcademicProgramByName(rawUser.currentCareer)?.id
        : undefined
  const academicProgramName =
    typeof rawUser.academicProgramName === 'string'
      ? rawUser.academicProgramName
      : typeof rawUser.currentCareer === 'string'
        ? normalizeOptionalText(rawUser.currentCareer)
        : getAcademicProgramName(academicProgramId)
  const departmentInfo = resolveDepartmentAndMunicipality(rawUser)
  const createdAt =
    typeof rawUser.createdAt === 'string' ? rawUser.createdAt : new Date().toISOString()
  const personalDataConsentAccepted =
    typeof rawUser.personalDataConsentAccepted === 'boolean'
      ? rawUser.personalDataConsentAccepted
      : typeof rawUser.dataConsent === 'boolean'
        ? rawUser.dataConsent
        : false
  const legacyCombinedPolicyAccepted =
    typeof rawUser.termsAccepted === 'boolean' ? rawUser.termsAccepted : false
  const privacyPolicyAccepted =
    typeof rawUser.privacyPolicyAccepted === 'boolean'
      ? rawUser.privacyPolicyAccepted
      : legacyCombinedPolicyAccepted
  const termsAccepted =
    typeof rawUser.termsAccepted === 'boolean' ? rawUser.termsAccepted : false
  const storedAge =
    typeof rawUser.age === 'number' && Number.isFinite(rawUser.age)
      ? rawUser.age
      : undefined
  const birthDate =
    typeof rawUser.birthDate === 'string' && calculateAgeFromBirthDate(rawUser.birthDate) !== null
      ? rawUser.birthDate
      : storedAge !== undefined
        ? deriveBirthDateFromAge(storedAge)
        : undefined

  return {
    id: typeof rawUser.id === 'string' ? rawUser.id : `usr-${crypto.randomUUID()}`,
    role: normalizeStoredRole(rawUser.role),
    fullName:
      typeof rawUser.fullName === 'string' && rawUser.fullName.trim()
        ? rawUser.fullName.trim()
        : `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    username,
    document: typeof rawUser.document === 'string' ? normalizeTrimmedValue(rawUser.document) : '',
    birthDate,
    age: birthDate ? calculateAgeFromBirthDate(birthDate) ?? storedAge ?? 18 : storedAge ?? 18,
    email,
    phone: typeof rawUser.phone === 'string' ? normalizeTrimmedValue(rawUser.phone) : '',
    departmentId: departmentInfo.departmentId,
    departmentName: departmentInfo.departmentName,
    municipalityId: departmentInfo.municipalityId,
    municipalityName: departmentInfo.municipalityName,
    gender,
    genderOther:
      gender === 'Otro' && typeof rawUser.genderOther === 'string'
        ? normalizeOptionalText(rawUser.genderOther)
        : undefined,
    institutionLinked,
    institutionRelationship:
      institutionRelationship === 'Inscrito' || institutionRelationship === 'Estudiante'
        ? institutionRelationship
        : undefined,
    academicProgramId,
    academicProgramName,
    semester:
      typeof rawUser.semester === 'string'
        ? normalizeOptionalText(rawUser.semester)
        : typeof rawUser.currentSemester === 'string'
          ? normalizeOptionalText(rawUser.currentSemester)
          : undefined,
    personalDataConsentAccepted,
    personalDataConsentAcceptedAt:
      typeof rawUser.personalDataConsentAcceptedAt === 'string'
        ? rawUser.personalDataConsentAcceptedAt
        : personalDataConsentAccepted
          ? createdAt
          : undefined,
    personalDataConsentVersion:
      typeof rawUser.personalDataConsentVersion === 'string'
        ? rawUser.personalDataConsentVersion
        : LEGAL_DOCUMENT_VERSIONS.personalDataConsent,
    privacyPolicyAccepted,
    privacyPolicyAcceptedAt:
      typeof rawUser.privacyPolicyAcceptedAt === 'string'
        ? rawUser.privacyPolicyAcceptedAt
        : privacyPolicyAccepted
          ? createdAt
          : undefined,
    privacyPolicyVersion:
      typeof rawUser.privacyPolicyVersion === 'string'
        ? rawUser.privacyPolicyVersion
        : LEGAL_DOCUMENT_VERSIONS.privacyPolicy,
    termsAccepted,
    termsAcceptedAt:
      typeof rawUser.termsAcceptedAt === 'string'
        ? rawUser.termsAcceptedAt
        : termsAccepted
          ? createdAt
          : undefined,
    termsVersion:
      typeof rawUser.termsVersion === 'string'
        ? rawUser.termsVersion
        : LEGAL_DOCUMENT_VERSIONS.terms,
    createdAt,
    normalizedEmail: normalizeEmail(email),
    normalizedUsername: username ? normalizeUsernameForComparison(username) : undefined,
    passwordMock:
      typeof rawUser.passwordMock === 'string' ? rawUser.passwordMock : '',
  }
}

function findUserByMockIdentity(
  users: RegisteredUserRecord[],
  mockUser: RegisteredUserRecord,
) {
  return users.find(
    (user) =>
      user.id === mockUser.id ||
      user.normalizedEmail === mockUser.normalizedEmail ||
      (mockUser.normalizedUsername &&
        user.normalizedUsername === mockUser.normalizedUsername),
  )
}

function syncDefaultMockUsers(users: RegisteredUserRecord[]) {
  const mergedUsers = [...users]

  for (const mockUser of defaultMockUsers.map((user) =>
    normalizeStoredUser(user as unknown as Record<string, unknown>),
  )) {
    const storedUser = findUserByMockIdentity(mergedUsers, mockUser)

    if (!storedUser) {
      mergedUsers.push(mockUser)
      continue
    }

    storedUser.role = mockUser.role
    storedUser.passwordMock = mockUser.passwordMock
    storedUser.normalizedEmail = mockUser.normalizedEmail
    storedUser.normalizedUsername = mockUser.normalizedUsername
  }

  return mergedUsers
}

export function getUsers() {
  const storedUsers = readStorage<Record<string, unknown>[]>(storageKeys.users, [])
  const normalizedUsers = storedUsers.map((user) => normalizeStoredUser(user))
  const usersWithMockFixtures = syncDefaultMockUsers(normalizedUsers)
  writeStorage(storageKeys.users, usersWithMockFixtures)
  return usersWithMockFixtures
}

export function saveUsers(users: RegisteredUserRecord[]) {
  writeStorage(storageKeys.users, users)
}

export function toUserProfile(user: RegisteredUserRecord): UserProfile {
  const { passwordMock, normalizedEmail, normalizedUsername, ...profile } = user
  void passwordMock
  void normalizedEmail
  void normalizedUsername
  return profile
}
