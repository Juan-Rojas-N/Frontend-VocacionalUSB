import { useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

interface PasswordFieldProps {
  id: string
  label: string
  placeholder: string
  registration: UseFormRegisterReturn
  error?: string
  helpText?: string
  autoComplete?: string
}

export function PasswordField({
  id,
  label,
  placeholder,
  registration,
  error,
  helpText,
  autoComplete,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const helpTextId = helpText ? `${id}-help` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="autenticacion-campo autenticacion-campo--completo">
      <label htmlFor={id}>{label}</label>
      {helpText ? (
        <small id={helpTextId} className="autenticacion-ayuda">
          {helpText}
        </small>
      ) : null}
      <div className="autenticacion-control autenticacion-control--con-icono autenticacion-control--icono-compacto">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={[helpTextId, errorId].filter(Boolean).join(' ') || undefined}
          {...registration}
        />
        <button
          type="button"
          className="autenticacion-control__toggle"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {error ? (
        <small id={errorId} className="form-field__error">
          {error}
        </small>
      ) : null}
    </div>
  )
}
