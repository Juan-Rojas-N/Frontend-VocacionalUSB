export class MockValidationError extends Error {
  code = 'VALIDATION_ERROR' as const
  fieldErrors: Record<string, string>

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message)
    this.name = 'MockValidationError'
    this.fieldErrors = fieldErrors
  }
}
