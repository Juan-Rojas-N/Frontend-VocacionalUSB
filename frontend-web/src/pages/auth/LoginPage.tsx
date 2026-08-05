import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { PasswordField } from '../../components/common/PasswordField'
import { APP_ROUTES } from '../../constants'
import { useAuthStore } from '../../stores/authStore'

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresa tu correo o nombre de usuario.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
  rememberMe: z.boolean(),
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
      identifier: '',
      password: '',
      rememberMe: false,
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
    <div className="autenticacion-layout autenticacion-layout--inicio-sesion">
      <div className="autenticacion-contenedor autenticacion-contenedor--centrado">
        <form
          className="autenticacion-panel autenticacion-panel--inicio-sesion autenticacion-panel--superficie-clara"
          onSubmit={onSubmit}
        >
          <div className="inicio-sesion__hero">
            <h1>Iniciar sesión</h1>
            <p>Accede a la plataforma institucional de orientación vocacional</p>
          </div>

          <div className="inicio-sesion__cuerpo">
            <div className="autenticacion-campo">
              <label htmlFor="login-identifier">Correo o nombre de usuario</label>
              <input
                id="login-identifier"
                className="autenticacion-control"
                type="text"
                placeholder="Ingresa tu correo o nombre de usuario"
                {...register('identifier')}
              />
              {errors.identifier ? (
                <small className="form-field__error">{errors.identifier.message}</small>
              ) : null}
            </div>

            <PasswordField
              id="login-password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              registration={register('password')}
              error={errors.password?.message}
            />

            <div className="inicio-sesion__opciones inicio-sesion__opciones--principal">
              <label className="autenticacion-seleccion inicio-sesion__seleccion">
                <input type="checkbox" {...register('rememberMe')} />
                <span>Recordarme</span>
              </label>
              <Link to={APP_ROUTES.recoverPassword}>¿Olvidaste tu contraseña?</Link>
            </div>

            {errorMessage ? <div className="autenticacion-mensaje">{errorMessage}</div> : null}

            <button
              type="submit"
              className="boton-principal boton-principal--inicio-sesion"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Validando...' : 'Ingresar'}
            </button>

            <div className="inicio-sesion__divisor">
              <span />
              <p>Acceso seguro</p>
              <span />
            </div>

            <div className="autenticacion-enlace-secundario autenticacion-enlace-secundario--inicio-sesion">
              <span>¿No tienes cuenta?</span>
              <Link to={APP_ROUTES.register}>Regístrate</Link>
            </div>

            <small className="inicio-sesion__leyenda inicio-sesion__leyenda--contraste">
              UNIVERSIDAD DE SAN BUENAVENTURA VIGILADA MINIEDUCACIÓN
            </small>
          </div>
        </form>
      </div>
    </div>
  )
}
