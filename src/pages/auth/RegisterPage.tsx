import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { PasswordField } from '../../components/common/PasswordField'
import { InstitutionalModal } from '../../components/common/InstitutionalModal'
import {
  APP_ROUTES,
  GENDER_OPTIONS,
  GENDER_OTHER_MAX_LENGTH,
  INSTITUTION_LINK_OPTIONS,
  INSTITUTION_RELATIONSHIP_OPTIONS,
  LEGAL_COPY,
  LEGAL_DOCUMENT_VERSIONS,
  LEGAL_LINKS,
  SEMESTER_OPTIONS,
  USERNAME_MAX_LENGTH,
} from '../../constants'
import { ApiError } from '../../services/apiClient'
import { catalogService } from '../../services/catalogService'
import { useAuthStore } from '../../stores/authStore'
import {
  getAdultBirthDateLimit,
  getBirthDateValidationError,
  getPasswordRequirementText,
  getPasswordValidationError,
} from '../../utils/authValidation'
import {
  getDepartmentOptions,
  getInstitutionalAcademicProgramOptionGroups,
  getMunicipalityOptions,
  isMunicipalityValidForDepartment,
} from '../../utils/catalogs'

const adultBirthDateLimit = getAdultBirthDateLimit()

const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'Ingresa el nombre.'),
    lastName: z.string().trim().min(2, 'Ingresa los apellidos.'),
    username: z
      .string()
      .trim()
      .min(1, 'Ingresa el nombre de usuario.')
      .max(USERNAME_MAX_LENGTH, `El nombre de usuario no puede superar ${USERNAME_MAX_LENGTH} caracteres.`),
    document: z.string().trim().min(6, 'Ingresa un documento válido.'),
    birthDate: z.string().min(1, 'Selecciona la fecha de nacimiento.'),
    email: z.email('Ingresa un correo válido.'),
    phone: z.string().trim().min(7, 'Ingresa un teléfono válido.'),
    departmentId: z.string().min(1, 'Selecciona un departamento.'),
    municipalityId: z.string().min(1, 'Selecciona una ciudad.'),
    gender: z.string().min(1, 'Selecciona un género.'),
    genderOther: z
      .string()
      .max(
        GENDER_OTHER_MAX_LENGTH,
        `El detalle de género no puede superar ${GENDER_OTHER_MAX_LENGTH} caracteres.`,
      )
      .optional(),
    institutionLinkedChoice: z.enum(['Si', 'No'], {
      error: () => ({ message: 'Selecciona si estás vinculado a la universidad.' }),
    }),
    institutionRelationship: z.enum(['Inscrito', 'Estudiante']).optional(),
    academicProgramId: z.string().optional(),
    semester: z.string().optional(),
    personalDataConsentAccepted: z.boolean().refine((value) => value, {
      message: 'Debes autorizar el tratamiento de datos personales.',
    }),
    privacyPolicyAccepted: z.boolean().refine((value) => value, {
      message: 'Debes aceptar las políticas de uso y privacidad.',
    }),
    termsAccepted: z.boolean().refine((value) => value, {
      message: 'Debes aceptar los términos y condiciones.',
    }),
    password: z.string(),
    confirmPassword: z.string().min(1, 'Confirma la contraseña.'),
  })
  .superRefine((values, ctx) => {
    const passwordError = getPasswordValidationError(values.password)
    if (passwordError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: passwordError,
      })
    }

    const birthDateError = getBirthDateValidationError(values.birthDate)
    if (birthDateError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['birthDate'],
        message: birthDateError,
      })
    }

    if (values.confirmPassword !== values.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'La confirmación debe coincidir exactamente con la contraseña.',
      })
    }

    if (values.gender === 'Otro' && !values.genderOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['genderOther'],
        message: 'Indica otra identidad de género.',
      })
    }

    if (!isMunicipalityValidForDepartment(values.departmentId, values.municipalityId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['municipalityId'],
        message: 'Selecciona una ciudad válida para el departamento elegido.',
      })
    }

    if (values.institutionLinkedChoice === 'Si' && !values.institutionRelationship) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['institutionRelationship'],
        message: 'Selecciona el tipo de vinculación.',
      })
    }

    if (values.institutionRelationship === 'Estudiante') {
      if (!values.academicProgramId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['academicProgramId'],
          message: 'Selecciona el programa actual.',
        })
      }
      if (!values.semester) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['semester'],
          message: 'Selecciona el semestre actual.',
        })
      }
    }
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const registerUser = useAuthStore((state) => state.register)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingValues, setPendingValues] = useState<RegisterFormValues | null>(null)
  const [adultModalOpen, setAdultModalOpen] = useState(false)
  const [adultConfirmed, setAdultConfirmed] = useState(false)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [, setCatalogRefresh] = useState(0)
  const previousDepartmentId = useRef<string | undefined>(undefined)

  const {
    register,
    handleSubmit,
    control,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      institutionLinkedChoice: 'No',
      personalDataConsentAccepted: false,
      privacyPolicyAccepted: false,
      termsAccepted: false,
    },
  })

  const selectedGender = useWatch({ control, name: 'gender' })
  const institutionLinkedChoice = useWatch({ control, name: 'institutionLinkedChoice' })
  const institutionRelationship = useWatch({ control, name: 'institutionRelationship' })
  const departmentId = useWatch({ control, name: 'departmentId' })
  const municipalityId = useWatch({ control, name: 'municipalityId' })

  const departmentOptions = getDepartmentOptions()
  const municipalityOptions = departmentId ? getMunicipalityOptions(departmentId) : []
  const programGroups = getInstitutionalAcademicProgramOptionGroups()
  const showAcademicFields =
    institutionLinkedChoice === 'Si' && institutionRelationship === 'Estudiante'

  useEffect(() => {
    let active = true

    async function loadCatalogs() {
      try {
        await catalogService.loadAll()
        if (active) {
          setCatalogLoading(false)
          setCatalogRefresh((value) => value + 1)
        }
      } catch {
        if (active) {
          setCatalogError('No se pudo cargar el catálogo de lugares y programas.')
          setCatalogLoading(false)
        }
      }
    }

    void loadCatalogs()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!departmentId) {
      return
    }

    let active = true

    async function loadMunicipalities() {
      try {
        await catalogService.loadMunicipalities(departmentId)
        if (active) {
          setCatalogRefresh((value) => value + 1)
        }
      } catch {
        if (active) {
          setCatalogRefresh((value) => value + 1)
        }
      }
    }

    void loadMunicipalities()

    return () => {
      active = false
    }
  }, [departmentId])

  useEffect(() => {
    if (selectedGender !== 'Otro') {
      setValue('genderOther', '')
      clearErrors('genderOther')
    }
  }, [clearErrors, selectedGender, setValue])

  useEffect(() => {
    if (institutionLinkedChoice === 'No') {
      setValue('institutionRelationship', undefined)
      setValue('academicProgramId', '')
      setValue('semester', '')
      clearErrors(['institutionRelationship', 'academicProgramId', 'semester'])
    }
  }, [clearErrors, institutionLinkedChoice, setValue])

  useEffect(() => {
    if (institutionRelationship !== 'Estudiante') {
      setValue('academicProgramId', '')
      setValue('semester', '')
      clearErrors(['academicProgramId', 'semester'])
    }
  }, [clearErrors, institutionRelationship, setValue])

  useEffect(() => {
    if (previousDepartmentId.current === undefined) {
      previousDepartmentId.current = departmentId
      return
    }

    if (previousDepartmentId.current !== departmentId) {
      setValue('municipalityId', '')
      clearErrors('municipalityId')
      previousDepartmentId.current = departmentId
      return
    }

    if (
      municipalityId &&
      departmentId &&
      !isMunicipalityValidForDepartment(departmentId, municipalityId)
    ) {
      setValue('municipalityId', '')
      clearErrors('municipalityId')
    }
  }, [clearErrors, departmentId, municipalityId, setValue])

  const onSubmit = handleSubmit(async (values) => {
    setPendingValues(values)
    setAdultConfirmed(false)
    setAdultModalOpen(true)
  })

  async function completeRegister() {
    if (!pendingValues || !adultConfirmed) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      const shouldIncludeAcademicData =
        pendingValues.institutionLinkedChoice === 'Si' &&
        pendingValues.institutionRelationship === 'Estudiante'
      await registerUser({
        firstName: pendingValues.firstName.trim(),
        lastName: pendingValues.lastName.trim(),
        username: pendingValues.username.trim(),
        document: pendingValues.document.trim(),
        birthDate: pendingValues.birthDate,
        email: pendingValues.email.trim(),
        phone: pendingValues.phone.trim(),
        departmentId: pendingValues.departmentId,
        municipalityId: pendingValues.municipalityId,
        gender: pendingValues.gender as 'Masculino' | 'Femenino' | 'Prefiero no decirlo' | 'Otro',
        genderOther: pendingValues.gender === 'Otro' ? pendingValues.genderOther?.trim() : undefined,
        institutionLinked: pendingValues.institutionLinkedChoice === 'Si',
        institutionRelationship:
          pendingValues.institutionLinkedChoice === 'Si'
            ? pendingValues.institutionRelationship
            : undefined,
        academicProgramId: shouldIncludeAcademicData ? pendingValues.academicProgramId : undefined,
        semester: shouldIncludeAcademicData ? pendingValues.semester : undefined,
        personalDataConsentAccepted: pendingValues.personalDataConsentAccepted,
        privacyPolicyAccepted: pendingValues.privacyPolicyAccepted,
        termsAccepted: pendingValues.termsAccepted,
        personalDataConsentVersion: LEGAL_DOCUMENT_VERSIONS.personalDataConsent,
        privacyPolicyVersion: LEGAL_DOCUMENT_VERSIONS.privacyPolicy,
        termsVersion: LEGAL_DOCUMENT_VERSIONS.terms,
        password: pendingValues.password,
      })
      setAdultModalOpen(false)
      navigate(APP_ROUTES.testIntro)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'No se pudo registrar el usuario.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="autenticacion-layout autenticacion-layout--registro">
      <div className="autenticacion-contenedor">
        <form className="autenticacion-panel autenticacion-panel--registro" onSubmit={onSubmit}>
          <div className="autenticacion-panel__encabezado">
            <h1>Registro de usuario</h1>
            <p>Completa el formulario para acceder a la prueba vocacional</p>
          </div>

          <div className="registro-usuario__cuadricula">
            <div className="autenticacion-campo">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                className="autenticacion-control"
                placeholder="Nombre"
                {...register('firstName')}
              />
              {errors.firstName ? <small className="form-field__error">{errors.firstName.message}</small> : null}
            </div>

            <div className="autenticacion-campo">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                className="autenticacion-control"
                placeholder="Apellido"
                {...register('lastName')}
              />
              {errors.lastName ? <small className="form-field__error">{errors.lastName.message}</small> : null}
            </div>

            <div className="autenticacion-campo">
              <label htmlFor="username">Nombre de usuario</label>
              <input
                id="username"
                className="autenticacion-control"
                placeholder="Ingresa tu nombre de usuario"
                {...register('username')}
              />
              {errors.username ? <small className="form-field__error">{errors.username.message}</small> : null}
            </div>

            <div className="autenticacion-campo">
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                className="autenticacion-control"
                type="email"
                placeholder="usuario@example.com"
                {...register('email')}
              />
              {errors.email ? <small className="form-field__error">{errors.email.message}</small> : null}
            </div>

            <div className="autenticacion-campo">
              <label htmlFor="document">Identificación</label>
              <input
                id="document"
                className="autenticacion-control"
                placeholder="xxxxxxxxxxx"
                {...register('document')}
              />
              {errors.document ? <small className="form-field__error">{errors.document.message}</small> : null}
            </div>

            <div className="autenticacion-campo">
              <label htmlFor="birthDate">Fecha de nacimiento</label>
              <input
                id="birthDate"
                className="autenticacion-control"
                type="date"
                max={adultBirthDateLimit}
                {...register('birthDate')}
              />
              {errors.birthDate ? (
                <small className="form-field__error">{errors.birthDate.message}</small>
              ) : null}
            </div>

            <div className="autenticacion-campo">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                className="autenticacion-control"
                placeholder="xxxxxxxxxx"
                {...register('phone')}
              />
              {errors.phone ? <small className="form-field__error">{errors.phone.message}</small> : null}
            </div>

            <div className="autenticacion-campo">
              <label htmlFor="gender">Género</label>
              <select id="gender" className="autenticacion-control" {...register('gender')}>
                <option value="">-</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.gender ? <small className="form-field__error">{errors.gender.message}</small> : null}
            </div>

            {selectedGender === 'Otro' ? (
              <div className="autenticacion-campo">
                <label htmlFor="genderOther">Indique otro</label>
                <input
                  id="genderOther"
                  className="autenticacion-control"
                  placeholder="Indica otro género"
                  {...register('genderOther')}
                />
                {errors.genderOther ? (
                  <small className="form-field__error">{errors.genderOther.message}</small>
                ) : null}
              </div>
            ) : null}

            <div className="autenticacion-campo">
              <label htmlFor="departmentId">Departamento</label>
              <select
                id="departmentId"
                className="autenticacion-control"
                disabled={catalogLoading}
                {...register('departmentId')}
              >
                <option value="">
                  {catalogLoading ? 'Cargando departamentos...' : '-'}
                </option>
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.departmentId ? (
                <small className="form-field__error">{errors.departmentId.message}</small>
              ) : null}
              {catalogError ? <small className="form-field__error">{catalogError}</small> : null}
            </div>

            <div className="autenticacion-campo">
              <label htmlFor="municipalityId">Ciudad</label>
              <select
                id="municipalityId"
                className="autenticacion-control"
                disabled={!departmentId || catalogLoading}
                {...register('municipalityId')}
              >
                <option value="">{departmentId ? '-' : 'Selecciona primero el departamento'}</option>
                {departmentId && municipalityOptions.length === 0 && !catalogLoading ? (
                  <option value="">Cargando ciudades...</option>
                ) : null}
                {municipalityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.municipalityId ? (
                <small className="form-field__error">{errors.municipalityId.message}</small>
              ) : null}
            </div>

            <div className="autenticacion-campo autenticacion-campo--completo">
              <span className="autenticacion-campo__label">
                ¿Está vinculado actualmente con la Universidad de San Buenaventura?
              </span>
              <div className="autenticacion-opciones">
                {INSTITUTION_LINK_OPTIONS.map((option) => (
                  <label key={option.value} className="autenticacion-seleccion">
                    <input type="radio" value={option.value} {...register('institutionLinkedChoice')} />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.institutionLinkedChoice ? (
                <small className="form-field__error">{errors.institutionLinkedChoice.message}</small>
              ) : null}
            </div>

            {institutionLinkedChoice === 'Si' ? (
              <div className="autenticacion-campo">
                <label htmlFor="institutionRelationship">Tipo de vinculación</label>
                <select
                  id="institutionRelationship"
                  className="autenticacion-control"
                  {...register('institutionRelationship')}
                >
                  <option value="">-</option>
                  {INSTITUTION_RELATIONSHIP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.institutionRelationship ? (
                  <small className="form-field__error">{errors.institutionRelationship.message}</small>
                ) : null}
              </div>
            ) : null}

            {showAcademicFields ? (
              <>
                <div className="autenticacion-campo">
                  <label htmlFor="academicProgramId">Programa</label>
                  <select
                    id="academicProgramId"
                    className="autenticacion-control"
                    disabled={catalogLoading}
                    {...register('academicProgramId')}
                  >
                    <option value="">-</option>
                    {programGroups.map((group) => (
                      <optgroup key={group.id} label={group.label}>
                        {group.programs.map((program) => (
                          <option key={program.value} value={program.value}>
                            {program.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {!catalogLoading && programGroups.length === 0 ? (
                    <small className="form-field__error">
                      No se encontraron programas de la Universidad de San Buenaventura.
                    </small>
                  ) : null}
                  {errors.academicProgramId ? (
                    <small className="form-field__error">{errors.academicProgramId.message}</small>
                  ) : null}
                </div>

                <div className="autenticacion-campo">
                  <label htmlFor="semester">Semestre</label>
                  <select id="semester" className="autenticacion-control" {...register('semester')}>
                    <option value="">-</option>
                    {SEMESTER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.semester ? <small className="form-field__error">{errors.semester.message}</small> : null}
                </div>
              </>
            ) : null}

            <PasswordField
              id="password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              registration={register('password')}
              error={errors.password?.message}
              helpText={getPasswordRequirementText()}
            />

            <PasswordField
              id="confirmPassword"
              label="Confirmar contraseña"
              placeholder="Vuelve a escribir tu contraseña"
              registration={register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="registro-usuario__consentimientos">
            <label className="registro-usuario__consentimiento-destacado">
              <input type="checkbox" {...register('personalDataConsentAccepted')} />
              <span>{LEGAL_COPY.dataPolicy}</span>
            </label>
            {errors.personalDataConsentAccepted ? (
              <small className="form-field__error">{errors.personalDataConsentAccepted.message}</small>
            ) : null}

            <label className="registro-usuario__consentimiento-destacado">
              <input type="checkbox" {...register('privacyPolicyAccepted')} />
              <span>
                Acepto las{' '}
                <a href={LEGAL_LINKS.privacyPolicy} target="_blank" rel="noopener noreferrer">
                  Políticas de uso y privacidad
                </a>
                .
              </span>
            </label>
            {errors.privacyPolicyAccepted ? (
              <small className="form-field__error">{errors.privacyPolicyAccepted.message}</small>
            ) : null}

            <label className="registro-usuario__consentimiento-destacado">
              <input type="checkbox" {...register('termsAccepted')} />
              <span>
                Acepto los{' '}
                <a href={LEGAL_LINKS.terms} target="_blank" rel="noopener noreferrer">
                  Términos y Condiciones
                </a>
                .
              </span>
            </label>
            {errors.termsAccepted ? (
              <small className="form-field__error">{errors.termsAccepted.message}</small>
            ) : null}
          </div>

          {errorMessage ? <div className="autenticacion-mensaje">{errorMessage}</div> : null}

          <div className="registro-usuario__acciones">
            <Link to={APP_ROUTES.home} className="registro-usuario__accion-secundaria">
              Cancelar
            </Link>
            <button type="submit" className="boton-principal" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>

      <InstitutionalModal open={adultModalOpen} onClose={() => setAdultModalOpen(false)}>
        <p>
          Esta aplicación está dirigida para mayores de 18 años. Al aceptar, confirmas que cuentas
          con mayoría de edad para continuar con el proceso.
        </p>
        <label className="autenticacion-seleccion autenticacion-seleccion--centrada">
          <input
            type="checkbox"
            checked={adultConfirmed}
            onChange={(event) => setAdultConfirmed(event.target.checked)}
          />
          <span>Sí, soy mayor de 18 años de edad</span>
        </label>
        <button
          type="button"
          className="boton-principal boton-principal--pequeno"
          disabled={!adultConfirmed || isSubmitting}
          onClick={() => void completeRegister()}
        >
          Entendido
        </button>
      </InstitutionalModal>
    </div>
  )
}
