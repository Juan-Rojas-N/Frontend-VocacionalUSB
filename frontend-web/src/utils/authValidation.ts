import { PASSWORD_POLICY } from '../constants'

const PASSWORD_SPECIAL_CHARACTER_REGEX = /[^A-Za-z0-9]/
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/
const PASSWORD_LOWERCASE_REGEX = /[a-z]/
const PASSWORD_DIGIT_REGEX = /\d/
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function normalizeTrimmedValue(value: string) {
  return value.trim()
}

export function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

export function normalizeEmail(value: string) {
  return normalizeTrimmedValue(value).toLowerCase()
}

export function normalizeUsernameForComparison(value: string) {
  return normalizeTrimmedValue(value).toLowerCase()
}

export function getPasswordRequirementText() {
  return `La contraseña debe tener al menos ${PASSWORD_POLICY.minLength} caracteres e incluir una mayúscula, una minúscula, un número y un carácter especial.`
}

export function getPasswordValidationError(password: string) {
  if (password.length < PASSWORD_POLICY.minLength) {
    return `La contraseña debe tener al menos ${PASSWORD_POLICY.minLength} caracteres.`
  }

  if (password.length > PASSWORD_POLICY.maxLength) {
    return `La contraseña no puede superar ${PASSWORD_POLICY.maxLength} caracteres.`
  }

  if (PASSWORD_POLICY.requireUppercase && !PASSWORD_UPPERCASE_REGEX.test(password)) {
    return 'La contraseña debe incluir al menos una letra mayúscula.'
  }

  if (PASSWORD_POLICY.requireLowercase && !PASSWORD_LOWERCASE_REGEX.test(password)) {
    return 'La contraseña debe incluir al menos una letra minúscula.'
  }

  if (PASSWORD_POLICY.requireDigit && !PASSWORD_DIGIT_REGEX.test(password)) {
    return 'La contraseña debe incluir al menos un número.'
  }

  if (PASSWORD_POLICY.requireSpecialCharacter && !PASSWORD_SPECIAL_CHARACTER_REGEX.test(password)) {
    return 'La contraseña debe incluir al menos un carácter especial.'
  }

  return null
}

function parseIsoDate(value: string) {
  if (!ISO_DATE_REGEX.test(value)) {
    return null
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function calculateAgeFromBirthDate(
  birthDate: string,
  referenceDate = new Date(),
) {
  const parsedBirthDate = parseIsoDate(birthDate)
  if (!parsedBirthDate) {
    return null
  }

  let age = referenceDate.getFullYear() - parsedBirthDate.getFullYear()
  const currentMonth = referenceDate.getMonth()
  const birthMonth = parsedBirthDate.getMonth()

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && referenceDate.getDate() < parsedBirthDate.getDate())
  ) {
    age -= 1
  }

  return age
}

export function getAdultBirthDateLimit(referenceDate = new Date()) {
  return toDateInputValue(
    new Date(referenceDate.getFullYear() - 18, referenceDate.getMonth(), referenceDate.getDate()),
  )
}

export function getBirthDateValidationError(birthDate: string) {
  if (!birthDate) {
    return 'Selecciona la fecha de nacimiento.'
  }

  const parsedBirthDate = parseIsoDate(birthDate)
  if (!parsedBirthDate) {
    return 'Selecciona una fecha de nacimiento vÃ¡lida.'
  }

  if (parsedBirthDate > new Date()) {
    return 'La fecha de nacimiento no puede ser futura.'
  }

  const age = calculateAgeFromBirthDate(birthDate)
  if (age === null || age < 18) {
    return 'Debes ser mayor de edad.'
  }

  return null
}

export function deriveBirthDateFromAge(age: number, referenceDate = new Date()) {
  if (!Number.isFinite(age) || age < 0) {
    return undefined
  }

  return toDateInputValue(new Date(referenceDate.getFullYear() - age, 0, 1))
}
