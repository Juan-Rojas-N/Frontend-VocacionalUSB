import { ACADEMIC_PROGRAM_GROUPS } from '../constants'
import colombiaCatalog from '../data/colombiaCatalog.json'
import type {
  AcademicProgram,
  AcademicProgramGroup,
  DepartmentCatalogItem,
  MunicipalityCatalogItem,
} from '../types'

let departmentCatalog: DepartmentCatalogItem[] =
  colombiaCatalog.departments as DepartmentCatalogItem[]

let academicProgramGroups: AcademicProgramGroup[] = ACADEMIC_PROGRAM_GROUPS

export function setDepartmentCatalog(items: DepartmentCatalogItem[]) {
  departmentCatalog = items
}

export function setDepartmentMunicipalities(
  departmentId: string,
  municipalities: MunicipalityCatalogItem[],
) {
  departmentCatalog = departmentCatalog.map((department) =>
    department.id === departmentId ? { ...department, municipalities } : department,
  )
}

export function setAcademicProgramGroups(groups: AcademicProgramGroup[]) {
  academicProgramGroups = groups
}

function normalizeLookupValue(value?: string | null) {
  return value
    ?.normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase()
}

export function findDepartmentById(departmentId?: string | null) {
  return departmentCatalog.find((department) => department.id === departmentId)
}

export function getMunicipalitiesByDepartment(departmentId?: string | null) {
  return findDepartmentById(departmentId)?.municipalities ?? []
}

export function findMunicipalityById(
  departmentId?: string | null,
  municipalityId?: string | null,
) {
  return getMunicipalitiesByDepartment(departmentId).find(
    (municipality) => municipality.id === municipalityId,
  )
}

export function findDepartmentByName(name?: string | null) {
  const normalizedName = normalizeLookupValue(name)
  return departmentCatalog.find(
    (department) => normalizeLookupValue(department.name) === normalizedName,
  )
}

export function findMunicipalityByName(
  departmentId: string | undefined,
  municipalityName?: string | null,
) {
  const normalizedName = normalizeLookupValue(municipalityName)
  return getMunicipalitiesByDepartment(departmentId).find(
    (municipality) => normalizeLookupValue(municipality.name) === normalizedName,
  )
}

export function findMunicipalityByNameAcrossCatalog(name?: string | null) {
  const normalizedName = normalizeLookupValue(name)
  for (const department of departmentCatalog) {
    const municipality = department.municipalities.find(
      (item) => normalizeLookupValue(item.name) === normalizedName,
    )
    if (municipality) {
      return {
        department,
        municipality,
      }
    }
  }

  return null
}

export function findAcademicProgramById(programId?: string | null) {
  return academicProgramGroups
    .flatMap((group) => group.programs)
    .find((program) => program.id === programId)
}

export function findAcademicProgramByName(name?: string | null) {
  const normalizedName = normalizeLookupValue(name)
  return academicProgramGroups
    .flatMap((group) => group.programs)
    .find((program) => normalizeLookupValue(program.name) === normalizedName)
}

export function isMunicipalityValidForDepartment(
  departmentId?: string | null,
  municipalityId?: string | null,
) {
  return Boolean(findMunicipalityById(departmentId, municipalityId))
}

export function getDepartmentDisplayName(
  departmentId?: string | null,
  fallbackName?: string | null,
) {
  return findDepartmentById(departmentId)?.name ?? fallbackName ?? 'Sin departamento'
}

export function getMunicipalityDisplayName(
  departmentId?: string | null,
  municipalityId?: string | null,
  fallbackName?: string | null,
) {
  return findMunicipalityById(departmentId, municipalityId)?.name ?? fallbackName ?? 'Sin municipio'
}

export function getAcademicProgramDisplayName(
  academicProgramId?: string | null,
  fallbackName?: string | null,
) {
  return findAcademicProgramById(academicProgramId)?.name ?? fallbackName ?? 'Sin programa'
}

export function getMunicipalityOptions(departmentId?: string | null) {
  return getMunicipalitiesByDepartment(departmentId).map((municipality) => ({
    value: municipality.id,
    label: municipality.name,
  }))
}

export function getDepartmentOptions() {
  return departmentCatalog.map((department) => ({
    value: department.id,
    label: department.name,
  }))
}

export function getAcademicProgramOptionGroups() {
  return academicProgramGroups.map((group) => ({
    id: group.id,
    label: group.label,
    programs: group.programs.map((program) => ({
      value: program.id,
      label: program.name,
    })),
  }))
}

export function resolveAcademicProgram(programId?: string | null): AcademicProgram | undefined {
  return findAcademicProgramById(programId)
}

export function resolveMunicipality(
  departmentId?: string | null,
  municipalityId?: string | null,
): MunicipalityCatalogItem | undefined {
  return findMunicipalityById(departmentId, municipalityId)
}
