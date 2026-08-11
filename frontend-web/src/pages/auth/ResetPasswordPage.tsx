import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { PasswordField } from '../../components/common/PasswordField'
import { APP_ROUTES, PASSWORD_POLICY } from '../../constants'
import { authService } from '../../services/authService'
import { getPasswordRequirementText } from '../../utils/authValidation'

const resetSchema = z
  .object({
    password: z
      .string()
      .min(
        PASSWORD_POLICY.minLength,
        `La contraseña debe tener al menos ${PASSWORD_POLICY.minLength} caracteres.`,
      )
      .max(
        PASSWORD_POLICY.maxLength,
        `La contraseña no puede superar ${PASSWORD_POLICY.maxLength} caracteres.`,
      )
      .regex(/[A-Z]/, 'La contraseña debe incluir al menos una letra mayúscula.')
      .regex(/[a-z]/, 'La contraseña debe incluir al menos una letra minúscula.')
      .regex(/\d/, 'La contraseña debe incluir al menos un número.')
      .regex(/[^A-Za-z0-9]/, 'La contraseña debe incluir al menos un carácter especial.'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

type ResetFormValues = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return
    try {
      setIsSubmitting(true)
      setStatus(null)
      const response = await authService.resetPassword({
        token,
        nuevaContrasena: values.password,
      })
      setStatus({ tone: 'success', message: response.data.status })
    } catch (error) {
      setStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible restablecer la contraseña. Intenta nuevamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  })

  if (!token) {
    return (
      <div className="autenticacion-layout autenticacion-layout--recuperacion">
        <div className="autenticacion-contenedor autenticacion-contenedor--centrado">
          <div className="autenticacion-panel autenticacion-panel--inicio-sesion autenticacion-panel--superficie-clara">
            <div className="inicio-sesion__hero inicio-sesion__hero--recuperacion">
              <h1>Enlace no válido</h1>
              <p>
                El enlace de restablecimiento no es válido o llegó sin el token. Solicita uno nuevo
                desde la pantalla de recuperación.
              </p>
            </div>
            <div className="inicio-sesion__cuerpo inicio-sesion__cuerpo--recuperacion">
              <div className="autenticacion-enlace-secundario autenticacion-enlace-secundario--inicio-sesion">
                <Link to={APP_ROUTES.recoverPassword}>Solicitar nuevamente</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="autenticacion-layout autenticacion-layout--recuperacion">
      <div className="autenticacion-contenedor autenticacion-contenedor--centrado">
        <form
          className="autenticacion-panel autenticacion-panel--inicio-sesion autenticacion-panel--superficie-clara"
          onSubmit={onSubmit}
          noValidate
        >
          <div className="inicio-sesion__hero inicio-sesion__hero--recuperacion">
            <span className="inicio-sesion__paso">Acceso a tu cuenta</span>
            <h1>Restablecer contraseña</h1>
            <p>Elige una nueva contraseña para tu cuenta.</p>
          </div>

          <div className="inicio-sesion__cuerpo inicio-sesion__cuerpo--recuperacion">
            <PasswordField
              id="reset-password"
              label="Nueva contraseña"
              placeholder="Ingresa tu nueva contraseña"
              registration={register('password')}
              error={errors.password?.message}
              helpText={getPasswordRequirementText()}
              autoComplete="new-password"
            />

            <PasswordField
              id="reset-confirm-password"
              label="Confirmar contraseña"
              placeholder="Repite tu nueva contraseña"
              registration={register('confirmPassword')}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
            />

            {status ? (
              <div
                className={`autenticacion-mensaje autenticacion-mensaje--${status.tone}`}
                role={status.tone === 'error' ? 'alert' : 'status'}
              >
                {status.message}
              </div>
            ) : null}

            <button
              type="submit"
              className="boton-principal boton-principal--inicio-sesion"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>

            <div className="autenticacion-enlace-secundario autenticacion-enlace-secundario--inicio-sesion">
              <Link to={APP_ROUTES.login}>Volver a iniciar sesión</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
