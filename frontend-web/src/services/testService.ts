import { mockQuestions } from '../mocks/data'
import type { TestAttempt, TestQuestion, TestSubmissionPayload } from '../types'
import { simulateRequest } from './apiClient'

export const testService = {
  async getQuestions() {
    return simulateRequest<TestQuestion[]>(
      '/api/test/questions',
      () => mockQuestions,
      'Preguntas mock obtenidas.',
    )
  },

  async startAttempt() {
    return simulateRequest<TestAttempt>(
      '/api/test/attempts',
      () => {
        const startedAt = new Date()
        const expiresAt = new Date(startedAt.getTime() + 35 * 60 * 1000)
        return {
          id: `attempt-${crypto.randomUUID()}`,
          startedAt: startedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          status: 'draft',
          progress: 0,
          versionLabel: 'Versión v1.1',
          attemptLabel: 'Intento #00011',
          audienceLabel: 'Usuario interno',
          questions: mockQuestions,
          answers: {},
        }
      },
      'Intento mock inicializado.',
    )
  },

  async submitAttempt(payload: TestSubmissionPayload) {
    return simulateRequest<{ resultId: string; submittedAt: string }>(
      '/api/test/submit',
      () => ({
        resultId: `result-${payload.attemptId}`,
        submittedAt: payload.submittedAt,
      }),
      'Intento mock enviado.',
    )
  },
}
