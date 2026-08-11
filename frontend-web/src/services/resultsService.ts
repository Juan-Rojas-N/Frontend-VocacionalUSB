import type {
  BackendPrueba,
  BackendResultado,
  VocationalResult,
} from '../types'
import { api } from './apiClient'

const AREA_IMAGE_BY_ID: Record<number, string> = {
  2: 'Ciencias_Salud.png',
  3: 'Ingenieria.png',
  4: 'Ciencias_Economicas_Administrativas.png',
  5: 'Ciencias_Sociales_Humanas.png',
  6: 'Artes.png',
  7: 'Ciencias_Exactas.png',
  8: 'Educacion.png',
  9: 'Ciencias_Agrarias.png',
}

const PACHO_IMAGE_BY_ID: Record<number, string> = {
  2: 'Ciencias_Salud.jpeg',
  3: 'Ingenieria.jpeg',
  4: 'Ciencias_Economicas_Administrativas.jpeg',
  5: 'Ciencias_Sociales_Humanas.jpeg',
  6: 'Artes.jpeg',
  7: 'Ciencias_Exactas.jpeg',
  8: 'Educacion.png',
  9: 'Ciencias_Agrarias.png',
}

function toAreaImageUrl(idArea: number, pathLogo: string | null): string | undefined {
  const fileName = pathLogo?.trim() ? pathLogo.trim() : AREA_IMAGE_BY_ID[idArea]
  return fileName ? `${import.meta.env.BASE_URL}images/areas/${fileName}` : undefined
}

function toAreaPachoUrl(idArea: number, pachoPath: string | null): string | undefined {
  const fileName = pachoPath?.trim() ? pachoPath.trim() : PACHO_IMAGE_BY_ID[idArea]
  return fileName ? `${import.meta.env.BASE_URL}images/pacho/${fileName}` : undefined
}

function toVocationalResult(raw: BackendResultado): VocationalResult {
  const primary =
    raw.afinidadPorArea.find((item) => item.idArea === raw.idAreaPredominante) ??
    raw.afinidadPorArea[0]

  return {
    id: String(raw.idPrueba),
    generatedAt: raw.fecha ?? new Date().toISOString(),
    primaryArea: primary?.nombreArea ?? raw.nombreAreaPredominante,
    qualitativeSummary:
      raw.perfil ??
      'Tu perfil vocacional fue calculado con base en tus respuestas de la prueba.',
    careers: raw.programasRecomendados.map((programa) => ({
      id: String(programa.idPrograma),
      name: programa.nombrePrograma,
      affinity: programa.valorAfinidad,
      area: programa.nombreArea ?? raw.nombreAreaPredominante,
      summary:
        programa.descripcionPrograma ??
        'Programa académico recomendado según tu perfil vocacional.',
      rationale: [],
      url: programa.urlPrograma ?? undefined,
      pathLogo: programa.pathLogo ?? undefined,
    })),
    areas: raw.afinidadPorArea.map((item) => ({
      id: String(item.idArea),
      name: item.nombreArea,
      affinity: item.valorAfinidad,
      description: item.perfil ?? '',
      profile: item.descripcionArea ?? '',
    })),
    affinityByArea: raw.afinidadPorArea.map((item) => ({
      label: item.nombreArea,
      value: item.valorAfinidad,
    })),
    areaProfiles: raw.afinidadPorArea.map((item) => ({
      idArea: item.idArea,
      nombreArea: item.nombreArea,
      valorAfinidad: item.valorAfinidad,
      perfil: item.descripcionArea ?? undefined,
      descripcionArea: item.perfil ?? undefined,
      imagenUrl: toAreaImageUrl(item.idArea, item.pathLogo),
      imagenPachoUrl: toAreaPachoUrl(item.idArea, item.pachoPath),
    })),
    perfil: raw.perfil ?? undefined,
    descripcionArea: raw.descripcionArea ?? undefined,
    nombreReporte: raw.nombreReporte,
    url: raw.url ?? undefined,
  }
}

function latestPrueba(items: BackendPrueba[]): BackendPrueba | null {
  return (
    [...items]
      .filter((item) => item.id != null)
      .sort(
        (left, right) =>
          new Date(right.fecha ?? 0).getTime() - new Date(left.fecha ?? 0).getTime(),
      )[0] ?? null
  )
}

export const resultsService = {
  async getMyResults() {
    const listResponse = await api.get<BackendPrueba[]>('/pruebas/mis-pruebas')
    const latest = latestPrueba(listResponse.data)

    if (!latest?.id) {
      throw new Error('Aún no tienes resultados registrados. Completa la prueba para verlos.')
    }

    const resultResponse = await api.get<BackendResultado>(`/pruebas/${latest.id}/resultado`)
    return {
      ...resultResponse,
      data: toVocationalResult(resultResponse.data),
    }
  },

  async getResultByTest(testId: string) {
    const resultResponse = await api.get<BackendResultado>(`/pruebas/${testId}/resultado`)
    return {
      ...resultResponse,
      data: toVocationalResult(resultResponse.data),
    }
  },
}
