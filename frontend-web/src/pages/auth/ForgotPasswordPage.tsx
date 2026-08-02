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
    <div className="autenticacion-layout">
      <div className="autenticacion-contenedor autenticacion-contenedor--centrado">
        <form className="autenticacion-panel autenticacion-panel--inicio-sesion" onSubmit={onSubmit}>
          <div className="autenticacion-panel__encabezado autenticacion-panel__encabezado--inicio-sesion">
            <h1>Recuperar contraseña</h1>
            <p>Simula el envío del enlace en el entorno de demostración.</p>
          </div>

          <div className="autenticacion-campo">
            <label htmlFor="recover-email">Correo</label>
            <input id="recover-email" className="autenticacion-control" type="email" {...register('email')} />
            {errors.email ? <small className="form-field__error">{errors.email.message}</small> : null}
          </div>

          <div className="autenticacion-campo">
            <label htmlFor="recover-document">Documento opcional</label>
            <input id="recover-document" className="autenticacion-control" {...register('document')} />
          </div>

          {statusMessage ? <div className="autenticacion-mensaje">{statusMessage}</div> : null}

          <button type="submit" className="boton-principal" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Recuperar contraseña'}
          </button>

          <div className="autenticacion-enlace-secundario">
            <Link to={APP_ROUTES.login}>Volver al login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
