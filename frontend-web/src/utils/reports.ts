import type { AdminReportFilters, AdminReportRow, AdminReportStats } from '../types'

function round(value: number): number {
  return Math.round(value * 10) / 10
}

export function applyReportFilters(
  rows: AdminReportRow[],
  filters: AdminReportFilters,
): AdminReportRow[] {
  return rows.filter((row) => {
    if (filters.userId && row.userId !== filters.userId) {
      return false
    }

    if (filters.departmentId && row.departmentId !== filters.departmentId) {
      return false
    }

    if (filters.programId && row.topCareerId !== Number(filters.programId)) {
      return false
    }

    const completedAt = row.completedAt.slice(0, 10)
    if (filters.startDate && completedAt < filters.startDate) {
      return false
    }

    if (filters.endDate && completedAt > filters.endDate) {
      return false
    }

    return true
  })
}

export function computeReportStats(rows: AdminReportRow[]): AdminReportStats {
  const totalResults = rows.length
  const totalStudents = new Set(rows.map((row) => row.userId)).size

  const averageAffinity =
    totalResults === 0
      ? 0
      : round(rows.reduce((sum, row) => sum + row.affinity, 0) / totalResults)

  const byArea = new Map<string, number>()
  const byCareer = new Map<string, { count: number; totalAffinity: number }>()
  const byDepartment = new Map<string, number>()

  for (const row of rows) {
    byArea.set(row.primaryArea, (byArea.get(row.primaryArea) ?? 0) + 1)

    const career = byCareer.get(row.topCareer) ?? { count: 0, totalAffinity: 0 }
    career.count += 1
    career.totalAffinity += row.affinity
    byCareer.set(row.topCareer, career)

    byDepartment.set(row.departmentName, (byDepartment.get(row.departmentName) ?? 0) + 1)
  }

  const students = new Set(rows.map((row) => row.userId))
  let internos = 0
  for (const userId of students) {
    const studentRows = rows.filter((row) => row.userId === userId)
    if (studentRows.some((row) => row.isInterno)) {
      internos += 1
    }
  }

  return {
    totalResults,
    totalStudents,
    averageAffinity,
    topArea:
      Array.from(byArea.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'Sin datos',
    byArea: Array.from(byArea.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count),
    byCareer: Array.from(byCareer.entries())
      .map(([name, value]) => ({
        name,
        count: value.count,
        avgAffinity: round(value.totalAffinity / value.count),
      }))
      .sort((left, right) => right.count - left.count || right.avgAffinity - left.avgAffinity),
    byDepartment: Array.from(byDepartment.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count),
    internos,
    externos: totalStudents - internos,
  }
}

function toCsvCell(value: string | number): string {
  const text = String(value ?? '')
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function buildReportCsv(rows: AdminReportRow[]): string {
  const header = [
    'Estudiante',
    'Documento',
    'Correo',
    'Departamento',
    'Fecha',
    'Área predominante',
    'Programa sugerido',
    'Afinidad (%)',
    'Tipo',
  ]

  const lines = rows.map((row) =>
    [
      row.studentName,
      row.document,
      row.email,
      row.departmentName,
      row.completedAt.slice(0, 10),
      row.primaryArea,
      row.topCareer,
      row.affinity,
      row.isInterno ? 'Interno' : 'Externo',
    ]
      .map(toCsvCell)
      .join(';'),
  )

  return `\ufeff${header.map(toCsvCell).join(';')}\n${lines.join('\n')}`
}

export function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
