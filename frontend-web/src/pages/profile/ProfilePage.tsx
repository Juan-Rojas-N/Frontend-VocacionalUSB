import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { MockValidationError } from '../../services/errors'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../stores/authStore'
import type { UserProfile } from '../../types'
import { departmentCatalog, getMunicipalitiesByDepartment } from '../../utils/catalogs'

const profileSchema = z.object({
  firstName: z.string().trim().min(2, 'Ingresa al menos 2 caracteres.'),
  lastName: z.string().trim().min(2, 'Ingresa al menos 2 caracteres.'),
  username: z
    .string()
    .trim()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres.')
    .max(50, 'El nombre de usuario no puede superar 50 caracteres.'),
  email: z.email('Ingresa un correo válido.'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{7,16}$/, 'Ingresa un teléfono válido.'),
  departmentId: z.string().min(1, 'Selecciona un departamento.'),
  municipalityId: z.string().min(1, 'Selecciona una ciudad.'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

function toFormValues(profile: UserProfile): ProfileFormValues {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username ?? '',
    email: profile.email,
    phone: profile.phone,
    departmentId: profile.departmentId,
    municipalityId: profile.municipalityId,
  }
}

export function ProfilePage() {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const updateSessionUser = useAuthStore((state) => state.updateSessionUser)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null,
  )

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: sessionUser
      ? toFormValues(sessionUser)
      : {
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          phone: '',
          departmentId: '',
          municipalityId: '',
        },
  })

  const departmentId = useWatch({ control, name: 'departmentId' })
  const municipalities = useMemo(
    () => getMunicipalitiesByDepartment(departmentId),
    [departmentId],
  )

  if (!sessionUser) {
    return <div className="loading-state">Cargando perfil...</div>
  }

  const departmentRegistration = register('departmentId')

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSaving(true)
      setStatus(null)
      const response = await userService.updateProfile(sessionUser.id, values)
      updateSessionUser(response.data)
      reset(toFormValues(response.data))
      setIsEditing(false)
      setStatus({
        tone: 'success',
        message: `${response.message ?? 'Perfil actualizado.'} La integración HTTP sigue pendiente.`,
      })
    } catch (error) {
      if (error instanceof MockValidationError) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof ProfileFormValues, { type: 'server', message })
        }
      }

      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'No fue posible actualizar el perfil.',
      })
    } finally {
      setIsSaving(false)
    }
  })

  function cancelEditing() {
    if (!sessionUser) {
      return
    }
    reset(toFormValues(sessionUser))
    setIsEditing(false)
    setStatus(null)
  }

  return (
    <div className="profile-shell">
      <section className="profile-card">
        <div className="profile-card__hero">
          <div className="profile-card__avatar" aria-hidden="true">
            {sessionUser.firstName.slice(0, 1)}
          </div>
          <div className="profile-card__hero-copy">
            <span>Perfil de usuario</span>
            <h1>{sessionUser.fullName}</h1>
            <p>Consulta y mantén actualizada tu información de contacto.</p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              className="profile-card__edit"
              onClick={() => {
                setStatus(null)
                setIsEditing(true)
              }}
            >
              Modificar datos
            </button>
          ) : null}
        </div>

        <div className="profile-card__notice">
          <strong>Datos de cuenta</strong>
          <span>
            El documento y los consentimientos no se modifican desde esta pantalla. Los cambios se
            guardan en un mock local hasta conectar el backend.
          </span>
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={onSubmit} noValidate>
            <div className="profile-form__grid">
              <div className="autenticacion-campo">
                <label htmlFor="profile-first-name">Nombre</label>
                <input
                  id="profile-first-name"
                  className="autenticacion-control"
                  autoComplete="given-name"
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? 'profile-first-name-error' : undefined}
                  {...register('firstName')}
                />
                {errors.firstName ? (
                  <small id="profile-first-name-error" className="form-field__error">
                    {errors.firstName.message}
                  </small>
                ) : null}
              </div>

              <div className="autenticacion-campo">
                <label htmlFor="profile-last-name">Apellido</label>
                <input
                  id="profile-last-name"
                  className="autenticacion-control"
                  autoComplete="family-name"
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? 'profile-last-name-error' : undefined}
                  {...register('lastName')}
                />
                {errors.lastName ? (
                  <small id="profile-last-name-error" className="form-field__error">
                    {errors.lastName.message}
                  </small>
                ) : null}
              </div>

              <div className="autenticacion-campo">
                <label htmlFor="profile-username">Nombre de usuario</label>
                <input
                  id="profile-username"
                  className="autenticacion-control"
                  autoComplete="username"
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={errors.username ? 'profile-username-error' : undefined}
                  {...register('username')}
                />
                {errors.username ? (
                  <small id="profile-username-error" className="form-field__error">
                    {errors.username.message}
                  </small>
                ) : null}
              </div>

              <div className="autenticacion-campo">
                <label htmlFor="profile-email">Correo</label>
                <input
                  id="profile-email"
                  className="autenticacion-control"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'profile-email-error' : undefined}
                  {...register('email')}
                />
                {errors.email ? (
                  <small id="profile-email-error" className="form-field__error">
                    {errors.email.message}
                  </small>
                ) : null}
              </div>

              <div className="autenticacion-campo">
                <label htmlFor="profile-phone">Teléfono</label>
                <input
                  id="profile-phone"
                  className="autenticacion-control"
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'profile-phone-error' : undefined}
                  {...register('phone')}
                />
                {errors.phone ? (
                  <small id="profile-phone-error" className="form-field__error">
                    {errors.phone.message}
                  </small>
                ) : null}
              </div>

              <div className="autenticacion-campo">
                <label htmlFor="profile-department">Departamento</label>
                <select
                  id="profile-department"
                  className="autenticacion-control"
                  aria-invalid={Boolean(errors.departmentId)}
                  aria-describedby={errors.departmentId ? 'profile-department-error' : undefined}
                  {...departmentRegistration}
                  onChange={(event) => {
                    void departmentRegistration.onChange(event)
                    setValue('municipalityId', '', { shouldDirty: true, shouldValidate: true })
                  }}
                >
                  <option value="">Selecciona un departamento</option>
                  {departmentCatalog.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId ? (
                  <small id="profile-department-error" className="form-field__error">
                    {errors.departmentId.message}
                  </small>
                ) : null}
              </div>

              <div className="autenticacion-campo">
                <label htmlFor="profile-municipality">Ciudad</label>
                <select
                  id="profile-municipality"
                  className="autenticacion-control"
                  disabled={!departmentId}
                  aria-invalid={Boolean(errors.municipalityId)}
                  aria-describedby={
                    errors.municipalityId ? 'profile-municipality-error' : undefined
                  }
                  {...register('municipalityId')}
                >
                  <option value="">Selecciona una ciudad</option>
                  {municipalities.map((municipality) => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </option>
                  ))}
                </select>
                {errors.municipalityId ? (
                  <small id="profile-municipality-error" className="form-field__error">
                    {errors.municipalityId.message}
                  </small>
                ) : null}
              </div>
            </div>

            <div className="profile-form__actions">
              <button type="button" className="profile-form__cancel" onClick={cancelEditing}>
                Cancelar
              </button>
              <button type="submit" className="boton-principal" disabled={isSaving || !isDirty}>
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-grid">
            <div>
              <span>Correo</span>
              <strong>{sessionUser.email}</strong>
            </div>
            <div>
              <span>Nombre de usuario</span>
              <strong>{sessionUser.username ?? 'Pendiente de asignación'}</strong>
            </div>
            <div>
              <span>Documento</span>
              <strong>{sessionUser.document}</strong>
            </div>
            <div>
              <span>Teléfono</span>
              <strong>{sessionUser.phone}</strong>
            </div>
            <div>
              <span>Ciudad</span>
              <strong>{sessionUser.municipalityName}</strong>
            </div>
            <div>
              <span>Departamento</span>
              <strong>{sessionUser.departmentName}</strong>
            </div>
          </div>
        )}

        {status ? (
          <p
            className={`profile-card__status profile-card__status--${status.tone}`}
            role={status.tone === 'error' ? 'alert' : 'status'}
          >
            {status.message}
          </p>
        ) : null}
      </section>
    </div>
  )
}
