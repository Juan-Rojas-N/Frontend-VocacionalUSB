import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { APP_ROUTES } from '../../constants'
import { authService } from '../../services/authService'

const recoverSchema = z.object({
  email: z.email('Ingresa un correo válido.'),
  document: z.string().optional(),
})

type RecoverFormValues = z.infer<typeof recoverSchema>

export function ForgotPasswordPage() {
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverSchema),
  })

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true)
    const response = await authService.recoverPassword(values)
    setStatusMessage(response.data.status)
    setIsSubmitting(false)
  })

  return (
    <div className="mockup-auth-page">
      <div className="mockup-auth-shell mockup-auth-shell--login">
        <form className="mockup-auth-card mockup-auth-card--login" onSubmit={onSubmit}>
          <div className="mockup-auth-card__header mockup-auth-card__header--login">
            <h1>Recuperar acceso</h1>
            <p>Simula el envío del enlace para el backend real</p>
          </div>

          <div className="mockup-field-group">
            <label htmlFor="recover-email">Correo</label>
            <input id="recover-email" className="mockup-input" type="email" {...register('email')} />
            {errors.email ? <small className="form-field__error">{errors.email.message}</small> : null}
          </div>

          <div className="mockup-field-group">
            <label htmlFor="recover-document">Documento opcional</label>
            <input id="recover-document" className="mockup-input" {...register('document')} />
          </div>

          {statusMessage ? <div className="mockup-inline-error">{statusMessage}</div> : null}

          <button type="submit" className="mockup-primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Recuperar contraseña'}
          </button>

          <div className="mockup-auth-register-link">
            <Link to={APP_ROUTES.login}>Volver al login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
