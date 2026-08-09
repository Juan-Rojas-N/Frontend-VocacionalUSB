import { TEST_SCALE } from '../constants'
import type {
  BackendPreguntaPrueba,
  BackendRespuestaPrueba,
  BackendResultado,
  TestAttempt,
  TestQuestion,
  TestSubmissionPayload,
} from '../types'
import { api } from './apiClient'

const ATTEMPT_DURATION_MINUTES = 35

function toTestQuestion(raw: BackendPreguntaPrueba): TestQuestion {
  return {
    id: `pregunta-${raw.id}`,
    preguntaId: raw.id,
    codigoPregunta: raw.codigo ?? '',
    prompt: raw.enunciado,
    dimension: raw.nombreArea,
    area: raw.nombreArea,
    options: TEST_SCALE,
  }
}

function buildAttemptId() {
  return `attempt-${crypto.randomUUID()}`
}

export const testService = {
  async getQuestions() {
    const response = await api.get<BackendPreguntaPrueba[]>('/preguntas/para-prueba')
    return {
      ...response,
      data: response.data.map(toTestQuestion),
    }
  },

  async startAttempt() {
    const response = await api.get<BackendPreguntaPrueba[]>('/preguntas/para-prueba')
    const questions = response.data.map(toTestQuestion)

    const startedAt = new Date()
    const expiresAt = new Date(startedAt.getTime() + ATTEMPT_DURATION_MINUTES * 60 * 1000)
    const attemptNumber = Math.floor(100000 + Math.random() * 900000)

    const attempt: TestAttempt = {
      id: buildAttemptId(),
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'draft',
      progress: 0,
      versionLabel: 'Versión v1.1',
      attemptLabel: `Intento #${attemptNumber}`,
      audienceLabel: 'Usuario interno',
      questions,
      answers: {},
    }

    return {
      ...response,
      data: attempt,
    }
  },

  async submitAttempt(payload: TestSubmissionPayload) {
    const respuestas: BackendRespuestaPrueba[] = payload.questions.map((question) => ({
      preguntaId: question.preguntaId,
      codigoPregunta: question.codigoPregunta,
      valor: payload.answers[question.id] ?? 0,
    }))

    const response = await api.post<BackendResultado>('/pruebas', {
      tiempoInvertido: null,
      versionPrueba: 'v1.1',
      satisfaccion: null,
      respuestas,
    })

    return {
      ...response,
      data: {
        resultId: String(response.data.idPrueba),
        submittedAt: payload.submittedAt,
      },
    }
  },
}
