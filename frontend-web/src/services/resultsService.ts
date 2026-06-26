import { mockResult } from '../mocks/data'
import type { VocationalResult } from '../types'
import { simulateRequest } from './apiClient'

export const resultsService = {
  async getMyResults() {
    return simulateRequest<VocationalResult>(
      '/api/results/me',
      () => mockResult,
      'Resultados mock consultados.',
    )
  },

  async downloadPdf() {
    return simulateRequest<{ ready: boolean; fileName: string }>(
      '/api/results/export/pdf',
      () => ({
        ready: true,
        fileName: 'usb-vocacional-resultado-mock.pdf',
      }),
      'Descarga mock preparada.',
    )
  },
}
