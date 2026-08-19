import type {
  AcademicProgramGroup,
  DepartmentCatalogItem,
  MunicipalityCatalogItem,
} from '../types'
import {
  setAcademicProgramGroups,
  setDepartmentCatalog,
  setDepartmentMunicipalities,
} from '../utils/catalogs'
import { api } from './apiClient'

interface BackendDepartamento {
  idDepartamento: string
  nombreDepartamento: string
}

interface BackendMunicipio {
  idMunicipio: string
  nombreMunicipio: string
  idDepartamento: string
}

interface BackendProgramaCatalogo {
  id: number
  nombrePrograma: string
  urlPrograma?: string | null
}

interface BackendAreaProgramas {
  id: number
  nombreArea: string
  programas: BackendProgramaCatalogo[]
}

const municipalitiesCache = new Map<string, MunicipalityCatalogItem[]>()

function toDepartmentCatalogItem(departamento: BackendDepartamento): DepartmentCatalogItem {
  return {
    id: String(departamento.idDepartamento),
    code: String(departamento.idDepartamento),
    name: departamento.nombreDepartamento,
    municipalities: [],
  }
}

function toMunicipalityCatalogItem(municipio: BackendMunicipio): MunicipalityCatalogItem {
  return {
    id: String(municipio.idMunicipio),
    code: String(municipio.idMunicipio),
    name: municipio.nombreMunicipio,
    type: 'municipio',
  }
}

function toAcademicProgramGroup(area: BackendAreaProgramas): AcademicProgramGroup {
  return {
    id: String(area.id),
    label: area.nombreArea,
    programs: area.programas.map((programa) => ({
      id: String(programa.id),
      code: String(programa.id),
      name: programa.nombrePrograma,
      areaId: String(area.id),
      areaName: area.nombreArea,
      active: true,
      url: programa.urlPrograma ?? null,
    })),
  }
}

export const catalogService = {
  async loadDepartments(): Promise<void> {
    const response = await api.get<BackendDepartamento[]>('/departamentos')
    setDepartmentCatalog(response.data.map(toDepartmentCatalogItem))
  },

  async loadMunicipalities(departmentId: string): Promise<void> {
    if (municipalitiesCache.has(departmentId)) {
      return
    }

    const response = await api.get<BackendMunicipio[]>(`/departamentos/${departmentId}/municipios`)
    const municipalities = response.data.map(toMunicipalityCatalogItem)
    municipalitiesCache.set(departmentId, municipalities)
    setDepartmentMunicipalities(departmentId, municipalities)
  },

  async loadProgramCatalog(): Promise<void> {
    const response = await api.get<BackendAreaProgramas[]>('/catalogos/programas')
    setAcademicProgramGroups(response.data.map(toAcademicProgramGroup))
  },

  async loadAll(): Promise<void> {
    await Promise.all([catalogService.loadDepartments(), catalogService.loadProgramCatalog()])
  },
}
