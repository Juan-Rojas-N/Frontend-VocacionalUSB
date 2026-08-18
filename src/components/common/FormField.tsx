import type { PropsWithChildren, ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: ReactNode
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: PropsWithChildren<FormFieldProps>) {
  return (
    <label className="form-field" htmlFor={htmlFor}>
      <span className="form-field__label">{label}</span>
      {children}
      {hint ? <small className="form-field__hint">{hint}</small> : null}
      {error ? <small className="form-field__error">{error}</small> : null}
    </label>
  )
}
