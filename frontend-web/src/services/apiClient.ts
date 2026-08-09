import type { ApiEnvelope } from '../types'
import { clearAccessToken, getAccessToken } from './tokenStore'

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api/v1'
).replace(/\/+$/, '')

export class ApiError extends Error {
  status: number
  code?: string
  fieldErrors: Record<string, string>

  constructor(
    message: string,
    status: number,
    code?: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  authenticated?: boolean
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  const status = response.status
  let message = response.statusText || 'Error de comunicación con el servidor.'
  let code: string | undefined
  const fieldErrors: Record<string, string> = {}

  try {
    const body = await response.json()
    if (body && typeof body.message === 'string') {
      message = body.message
    } else if (body && typeof body.detail === 'string') {
      message = body.detail
    } else if (body && typeof body.error === 'string') {
      message = body.error
    }

    if (Array.isArray(body?.errors)) {
      for (const fieldError of body.errors) {
        if (
          fieldError &&
          typeof fieldError.field === 'string' &&
          typeof fieldError.defaultMessage === 'string'
        ) {
          fieldErrors[fieldError.field] = fieldError.defaultMessage
        }
      }
    }

    if (body && typeof body.code === 'string') {
      code = body.code
    }
  } catch {
    // La respuesta no tiene un cuerpo JSON; se conserva el mensaje del estado HTTP.
  }

  return new ApiError(message, status, code, fieldErrors)
}

async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const { method = 'GET', body, authenticated = true } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (authenticated) {
    const token = getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    clearAccessToken()
  }

  if (!response.ok) {
    throw await parseErrorResponse(response)
  }

  const data = response.status === 204 ? (null as T) : ((await response.json()) as T)

  return {
    data,
    endpoint: path,
    mocked: false,
    requestedAt: new Date().toISOString(),
  }
}

export const api = {
  get<T>(path: string): Promise<ApiEnvelope<T>> {
    return apiRequest<T>(path)
  },
  post<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
    return apiRequest<T>(path, { method: 'POST', body })
  },
  put<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
    return apiRequest<T>(path, { method: 'PUT', body })
  },
  patch<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
    return apiRequest<T>(path, { method: 'PATCH', body })
  },
  delete<T>(path: string): Promise<ApiEnvelope<T>> {
    return apiRequest<T>(path, { method: 'DELETE' })
  },
}

// Capa de simulación: se conserva mientras los servicios de prueba,
// resultados y administración sigan sin conexión al backend real.
export async function simulateRequest<T>(
  endpoint: string,
  resolver: () => T,
  message?: string,
  latency = 400,
): Promise<ApiEnvelope<T>> {
  await new Promise((resolve) => window.setTimeout(resolve, latency))

  return {
    data: resolver(),
    endpoint,
    mocked: true,
    message,
    requestedAt: new Date().toISOString(),
  }
}
