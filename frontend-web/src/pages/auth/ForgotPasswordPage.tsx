import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { APP_ROUTES } from '../../constants'
import { authService } from '../../services/authService'

const recoverSchema = z.object({
  email: z.email('Ingresa un correo válido.'),
  document: z.string().trim().max(30, 'El documento no puede superar 30 caracteres.').optional(),
})

type RecoverFormValues = z.infer<typeof recoverSchema>

export function ForgotPasswordPage() {
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: '', document: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true)
      setStatus(null)
      const response = await authService.recoverPassword(values)
      setStatus({ tone: 'success', message: response.data.status })
    } catch (error) {
      setStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible iniciar la recuperación. Intenta nuevamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  })

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
            <h1>Recuperar contraseña</h1>
            <p>Ingresa tus datos y te enviaremos instrucciones si encontramos una coincidencia.</p>
          </div>

          <div className="inicio-sesion__cuerpo inicio-sesion__cuerpo--recuperacion">
            <div className="autenticacion-campo">
              <label htmlFor="recover-email">Correo</label>
              <input
                id="recover-email"
                className="autenticacion-control"
                type="email"
                autoComplete="email"
                placeholder="usuario@ejemplo.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'recover-email-error' : undefined}
                {...register('email')}
              />
              {errors.email ? (
                <small id="recover-email-error" className="form-field__error">
                  {errors.email.message}
                </small>
              ) : null}
            </div>

            <div className="autenticacion-campo">
              <label htmlFor="recover-document">Número de identificación (opcional)</label>
              <input
                id="recover-document"
                className="autenticacion-control"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Tu documento registrado"
                aria-invalid={Boolean(errors.document)}
                aria-describedby={errors.document ? 'recover-document-error' : 'recover-document-help'}
                {...register('document')}
              />
              <small id="recover-document-help" className="autenticacion-ayuda">
                Ayuda a distinguir cuentas que compartan datos de contacto.
              </small>
              {errors.document ? (
                <small id="recover-document-error" className="form-field__error">
                  {errors.document.message}
                </small>
              ) : null}
            </div>

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
              {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
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
