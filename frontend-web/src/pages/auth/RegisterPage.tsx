import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { InstitutionalModal } from '../../components/common/InstitutionalModal'
import {
  APP_ROUTES,
  CITY_OPTIONS,
  DEPARTMENT_OPTIONS,
  GENDER_OPTIONS,
  LEGAL_COPY,
  SEMESTER_OPTIONS,
} from '../../constants'
import { useAuthStore } from '../../stores/authStore'

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Ingresa el nombre.'),
    lastName: z.string().min(2, 'Ingresa los apellidos.'),
    document: z.string().min(6, 'Ingresa un documento válido.'),
    age: z.number().min(18, 'Debes ser mayor de edad.'),
    email: z.email('Ingresa un correo válido.'),
    phone: z.string().min(7, 'Ingresa un teléfono válido.'),
    department: z.string().min(1, 'Selecciona un departamento.'),
    city: z.string().min(1, 'Selecciona una ciudad.'),
    gender: z.string().min(1, 'Selecciona un género.'),
    genderOther: z.string().optional(),
    belongsToUniversity: z.boolean(),
    isActiveStudent: z.boolean(),
    currentCareer: z.string().optional(),
    currentSemester: z.string().optional(),
    dataConsent: z.boolean().refine((value) => value, {
      message: 'Debes aceptar el tratamiento de datos.',
    }),
    termsAccepted: z.boolean().refine((value) => value, {
      message: 'Debes aceptar políticas y términos.',
    }),
    password: z.string().min(8, 'La contraseña debe tener mínimo 8 caracteres.'),
  })
  .superRefine((values, ctx) => {
    if (values.gender === 'Otro' && !values.genderOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['genderOther'],
        message: 'Describe el género seleccionado.',
      })
    }

    if (values.belongsToUniversity || values.isActiveStudent) {
      if (!values.currentCareer?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['currentCareer'],
          message: 'Indica la carrera actual.',
        })
      }
      if (!values.currentSemester?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['currentSemester'],
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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      belongsToUniversity: false,
      isActiveStudent: false,
      dataConsent: false,
      termsAccepted: false,
    },
  })

  const selectedGender = useWatch({ control, name: 'gender' })
  const belongsToUniversity = useWatch({ control, name: 'belongsToUniversity' })
  const isActiveStudent = useWatch({ control, name: 'isActiveStudent' })

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
      await registerUser({
        firstName: pendingValues.firstName,
        lastName: pendingValues.lastName,
        document: pendingValues.document,
        age: pendingValues.age,
        email: pendingValues.email,
        phone: pendingValues.phone,
        department: pendingValues.department,
        city: pendingValues.city,
        gender: pendingValues.gender as 'Masculino' | 'Femenino' | 'Prefiero no decirlo' | 'Otro',
        genderOther: pendingValues.genderOther,
        belongsToUniversity: pendingValues.belongsToUniversity || pendingValues.isActiveStudent,
        currentCareer: pendingValues.currentCareer,
        currentSemester: pendingValues.currentSemester,
        dataConsent: pendingValues.dataConsent,
        password: pendingValues.password,
      })
      setAdultModalOpen(false)
      navigate(APP_ROUTES.testIntro)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo registrar el usuario.')
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
              <input id="firstName" className="autenticacion-control" placeholder="Nombre" {...register('firstName')} />
              {errors.firstName ? <small className="form-field__error">{errors.firstName.message}</small> : null}
            </div>
            <div className="autenticacion-campo">
              <label htmlFor="lastName">Apellido</label>
              <input id="lastName" className="autenticacion-control" placeholder="Apellido" {...register('lastName')} />
              {errors.lastName ? <small className="form-field__error">{errors.lastName.message}</small> : null}
            </div>
            <div className="autenticacion-campo autenticacion-campo--completo">
              <label htmlFor="email">Correo</label>
              <input id="email" className="autenticacion-control" type="email" placeholder="usuario@example.com" {...register('email')} />
              {errors.email ? <small className="form-field__error">{errors.email.message}</small> : null}
            </div>
            <div className="autenticacion-campo">
              <label htmlFor="document">Identificación</label>
              <input id="document" className="autenticacion-control" placeholder="xxxxxxxxxxx" {...register('document')} />
              {errors.document ? <small className="form-field__error">{errors.document.message}</small> : null}
            </div>
            <div className="autenticacion-campo">
              <label htmlFor="age">Edad</label>
              <input id="age" className="autenticacion-control" type="number" placeholder="xx" {...register('age', { valueAsNumber: true })} />
              {errors.age ? <small className="form-field__error">{errors.age.message}</small> : null}
            </div>
            <div className="autenticacion-campo">
              <label htmlFor="phone">Teléfono</label>
              <input id="phone" className="autenticacion-control" placeholder="xxxxxxxxxx" {...register('phone')} />
              {errors.phone ? <small className="form-field__error">{errors.phone.message}</small> : null}
            </div>
            <div className="autenticacion-campo">
              <label htmlFor="gender">Género</label>
              <select id="gender" className="autenticacion-control" {...register('gender')}>
                <option value="">-</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.gender ? <small className="form-field__error">{errors.gender.message}</small> : null}
            </div>
            <div className="autenticacion-campo">
              <label htmlFor="genderOther">En caso de otro ¿cuál?</label>
              <input id="genderOther" className="autenticacion-control" placeholder="-" {...register('genderOther')} />
              {selectedGender === 'Otro' && errors.genderOther ? <small className="form-field__error">{errors.genderOther.message}</small> : null}
            </div>
            <div className="autenticacion-campo">
              <label htmlFor="department">Departamento</label>
              <select id="department" className="autenticacion-control" {...register('department')}>
                <option value="">-</option>
                {DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.department ? <small className="form-field__error">{errors.department.message}</small> : null}
            </div>
            <div className="autenticacion-campo">
              <label htmlFor="city">Ciudad</label>
              <select id="city" className="autenticacion-control" {...register('city')}>
                <option value="">-</option>
                {CITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.city ? <small className="form-field__error">{errors.city.message}</small> : null}
            </div>
            {(belongsToUniversity || isActiveStudent) ? (
              <>
                <div className="autenticacion-campo">
                  <label htmlFor="currentCareer">Carrera actual</label>
                  <input id="currentCareer" className="autenticacion-control" placeholder="Programa académico" {...register('currentCareer')} />
                  {errors.currentCareer ? <small className="form-field__error">{errors.currentCareer.message}</small> : null}
                </div>
                <div className="autenticacion-campo">
                  <label htmlFor="currentSemester">Semestre actual</label>
                  <select id="currentSemester" className="autenticacion-control" {...register('currentSemester')}>
                    <option value="">-</option>
                    {SEMESTER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.currentSemester ? <small className="form-field__error">{errors.currentSemester.message}</small> : null}
                </div>
              </>
            ) : null}
            <div className="autenticacion-campo autenticacion-campo--completo">
              <label htmlFor="password">Contraseña</label>
              <div className="autenticacion-control autenticacion-control--con-icono">
                <input id="password" type="password" placeholder="Ingresa tu contraseña" {...register('password')} />
                <span aria-hidden="true"></span>
              </div>
              {errors.password ? <small className="form-field__error">{errors.password.message}</small> : null}
            </div>
          </div>

          <div className="registro-usuario__consentimientos">
            <label className="registro-usuario__consentimiento-linea">
              <input type="checkbox" {...register('belongsToUniversity')} />
              <span>¿Se encuentra usted actualmente inscrito en la Universidad de San Buenaventura?</span>
            </label>
            <label className="registro-usuario__consentimiento-linea">
              <input type="checkbox" {...register('isActiveStudent')} />
              <span>¿Es usted estudiante activo de algún programa de la Universidad de San Buenaventura?</span>
            </label>
            <label className="registro-usuario__consentimiento-destacado">
              <input type="checkbox" {...register('dataConsent')} />
              <span>{LEGAL_COPY.dataPolicy}</span>
            </label>
            {errors.dataConsent ? <small className="form-field__error">{errors.dataConsent.message}</small> : null}
            <label className="registro-usuario__consentimiento-destacado">
              <input type="checkbox" {...register('termsAccepted')} />
              <span>Declaro haber leído y aceptado las Políticas de Tratamiento de Datos Personales, así como los Términos y Condiciones de la institución.</span>
            </label>
            {errors.termsAccepted ? <small className="form-field__error">{errors.termsAccepted.message}</small> : null}
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
          con mayorí­a de edad para continuar con el proceso.
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
