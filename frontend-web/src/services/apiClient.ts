import type { ApiEnvelope } from '../types'

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
