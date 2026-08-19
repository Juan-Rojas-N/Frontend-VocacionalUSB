import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TestQuestion } from '../types'

interface TestSessionState {
  attemptId: string | null
  startedAt: string | null
  expiresAt: number | null
  versionLabel: string | null
  attemptLabel: string | null
  audienceLabel: string | null
  questions: TestQuestion[]
  answers: Record<string, number>
  currentIndex: number
  introAcknowledged: boolean
  satisfaccion: number | null
  initialize: (payload: {
    attemptId: string
    startedAt: string
    expiresAt: string
    versionLabel?: string
    attemptLabel?: string
    audienceLabel?: string
    questions: TestQuestion[]
  }) => void
  answerQuestion: (questionId: string, value: number) => void
  setCurrentIndex: (value: number) => void
  acknowledgeIntro: () => void
  setSatisfaccion: (value: number | null) => void
  clear: () => void
}

export const useTestSessionStore = create<TestSessionState>()(
  persist(
    (set) => ({
      attemptId: null,
      startedAt: null,
      expiresAt: null,
      versionLabel: null,
      attemptLabel: null,
      audienceLabel: null,
      questions: [],
      answers: {},
      currentIndex: 0,
      introAcknowledged: false,
      satisfaccion: null,
      setSatisfaccion(value) {
        set({ satisfaccion: value })
      },
      initialize(payload) {
    set({
      attemptId: payload.attemptId,
      startedAt: payload.startedAt,
      expiresAt: new Date(payload.expiresAt).getTime(),
      versionLabel: payload.versionLabel ?? null,
      attemptLabel: payload.attemptLabel ?? null,
      audienceLabel: payload.audienceLabel ?? null,
      questions: payload.questions,
      answers: {},
      currentIndex: 0,
      introAcknowledged: false,
      satisfaccion: null,
    })
      },
      answerQuestion(questionId, value) {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: value,
          },
        }))
      },
      setCurrentIndex(value) {
        set({ currentIndex: value })
      },
      acknowledgeIntro() {
        set({ introAcknowledged: true })
      },
      clear() {
        set({
          attemptId: null,
          startedAt: null,
          expiresAt: null,
          versionLabel: null,
          attemptLabel: null,
          audienceLabel: null,
          questions: [],
          answers: {},
          currentIndex: 0,
          introAcknowledged: false,
          satisfaccion: null,
        })
      },
    }),
    {
      name: 'usb-vocacional-test',
    },
  ),
)
