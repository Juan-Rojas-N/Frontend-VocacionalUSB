import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { APP_ROUTES } from '../../constants'
import { useAuthStore } from '../../stores/authStore'

const loginSchema = z.object({
  email: z.email('Ingresa un correo válido.'),
  password: z.string().min(6, 'Ingresa tu contraseña mock.'),
  isAdultConfirmed: z.boolean().refine((value) => value, {
    message: 'Debes confirmar que eres mayor de edad.',
  }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const signIn = useAuthStore((state) => state.signIn)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      isAdultConfirmed: false,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true)
      setErrorMessage('')
      const user = await signIn(values)
      const fallbackRoute = user.role === 'admin' ? APP_ROUTES.admin : APP_ROUTES.testIntro
      const nextRoute = location.state?.from ?? fallbackRoute
      navigate(nextRoute, { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible iniciar sesión.')
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div className="mockup-auth-page">
      <div className="mockup-auth-shell mockup-auth-shell--login">
        <form className="mockup-auth-card mockup-auth-card--login" onSubmit={onSubmit}>
          <div className="mockup-auth-card__header mockup-auth-card__header--login">
            <h1>Iniciar sesión</h1>
            <p>Accede a la plataforma institucional de orientación vocacional</p>
          </div>

          <div className="mockup-field-group">
            <label htmlFor="login-email">Correo</label>
            <input
              id="login-email"
              className="mockup-input"
              type="email"
              placeholder="usuario@example.com"
              {...register('email')}
            />
            {errors.email ? <small className="form-field__error">{errors.email.message}</small> : null}
          </div>

          <div className="mockup-field-group">
            <label htmlFor="login-password">Contraseña</label>
            <div className="mockup-input mockup-input--with-icon">
              <input
                id="login-password"
                type="password"
                placeholder="Ingresa tu contraseña"
                {...register('password')}
              />
              <span aria-hidden="true">◉</span>
            </div>
            {errors.password ? <small className="form-field__error">{errors.password.message}</small> : null}
          </div>

          <div className="mockup-auth-row">
            <label className="mockup-checkline">
              <input type="checkbox" {...register('isAdultConfirmed')} />
              <span>Confirmo mayoría de edad</span>
            </label>
            <Link to={APP_ROUTES.recoverPassword}>¿Olvidaste tu contraseña?</Link>
          </div>
          {errors.isAdultConfirmed ? <small className="form-field__error">{errors.isAdultConfirmed.message}</small> : null}
          {errorMessage ? <div className="mockup-inline-error">{errorMessage}</div> : null}

          <button type="submit" className="mockup-primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Validando...' : 'Ingresar'}
          </button>

          <div className="mockup-auth-divider">
            <span />
            <p>acceso seguro</p>
            <span />
          </div>
          <div className="mockup-auth-register-link">
            <span>¿No tienes cuenta?</span>
            <Link to={APP_ROUTES.register}>Regístrate</Link>
          </div>
          <small className="mockup-auth-legend">
            UNIVERSIDAD DE SAN BUENAVENTURA VIGILADA MINIEDUCACIÓN
          </small>
        </form>
      </div>
    </div>
  )
}
