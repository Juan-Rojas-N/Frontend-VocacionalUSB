import { useEffect, useMemo, useState } from 'react'
import { adminService } from '../../../services/adminService'
import type {
  AdminReportDataset,
  AdminReportFilters,
  AdminReportProgramOption,
  AdminReportRow,
  AdminReportStats,
} from '../../../types'
import {
  applyReportFilters,
  buildReportCsv,
  computeReportStats,
  downloadTextFile,
} from '../../../utils/reports'

interface GeneratedReport {
  filters: AdminReportFilters
  rows: AdminReportRow[]
  stats: AdminReportStats
  generatedAt: string
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function maxCount(items: Array<{ count: number }>): number {
  return Math.max(1, ...items.map((item) => item.count))
}

export function AdminReportsView() {
  const [dataset, setDataset] = useState<AdminReportDataset | null>(null)
  const [datasetError, setDatasetError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [userQuery, setUserQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [departmentQuery, setDepartmentQuery] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [programId, setProgramId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [report, setReport] = useState<GeneratedReport | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    let active = true

    adminService
      .getReportsDataset()
      .then((response) => {
        if (active) {
          setDataset(response.data)
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setDatasetError(
            error instanceof Error ? error.message : 'No fue posible cargar los datos del reporte.',
          )
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const rows = useMemo(() => dataset?.rows ?? [], [dataset])
  const programOptions = useMemo(() => dataset?.programs ?? [], [dataset])

  const usersById = useMemo(
    () => new Map(rows.map((row) => [row.userId, row])),
    [rows],
  )

  const departments = useMemo(() => {
    const unique = new Map<string, string>()
    for (const row of rows) {
      if (row.departmentId) {
        unique.set(row.departmentId, row.departmentName)
      }
    }
    return Array.from(unique, ([id, name]) => ({ id, name })).sort((left, right) =>
      left.name.localeCompare(right.name, 'es'),
    )
  }, [rows])

  const programGroups = useMemo(() => {
    const groups = new Map<string, AdminReportProgramOption[]>()
    for (const program of programOptions) {
      const label = program.areaName ?? 'Otras áreas'
      const list = groups.get(label) ?? []
      list.push(program)
      groups.set(label, list)
    }
    return Array.from(groups, ([label, options]) => ({ label, options }))
  }, [programOptions])

  const programsById = useMemo(
    () => new Map(programOptions.map((program) => [program.id, program])),
    [programOptions],
  )

  const departmentsById = useMemo(
    () => new Map(departments.map((department) => [department.id, department])),
    [departments],
  )

  const matchingUsers = useMemo(() => {
    const query = normalizeSearch(userQuery)
    if (!query) {
      return []
    }

    const unique = new Map<string, AdminReportRow>()
    for (const row of rows) {
      unique.set(row.userId, row)
    }

    return Array.from(unique.values())
      .filter((row) =>
        [row.studentName, row.email, row.document]
          .map(normalizeSearch)
          .some((value) => value.includes(query)),
      )
      .slice(0, 8)
  }, [userQuery, rows])

  const matchingDepartments = useMemo(() => {
    const query = normalizeSearch(departmentQuery)
    if (!query) {
      return []
    }
    return departments.filter((department) => normalizeSearch(department.name).includes(query))
  }, [departmentQuery, departments])

  function clearReport() {
    setReport(null)
  }

  function validateFilters() {
    const nextErrors: Record<string, string> = {}

    if (userQuery && !selectedUserId) {
      nextErrors.user =
        matchingUsers.length === 0
          ? 'No hay usuarios que coincidan con la búsqueda.'
          : 'Selecciona un usuario de la lista o limpia la búsqueda.'
    }

    if (selectedUserId && !usersById.has(selectedUserId)) {
      nextErrors.user = 'La selección de usuario ya no es válida.'
    }

    if (departmentQuery && !selectedDepartmentId) {
      nextErrors.department =
        matchingDepartments.length === 0
          ? 'No hay departamentos que coincidan con la búsqueda.'
          : 'Selecciona un departamento de la lista o limpia la búsqueda.'
    }

    if (Boolean(startDate) !== Boolean(endDate)) {
      nextErrors.period = 'Completa la fecha inicial y la fecha final.'
    } else if (startDate && endDate && startDate > endDate) {
      nextErrors.period = 'La fecha inicial no puede ser posterior a la fecha final.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function buildFilters(): AdminReportFilters {
    return {
      userId: selectedUserId || undefined,
      departmentId: selectedDepartmentId || undefined,
      programId: programId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }
  }

  function generateReport() {
    if (!dataset || !validateFilters()) {
      setReport(null)
      setStatus(null)
      return
    }

    const filters = buildFilters()
    const filtered = applyReportFilters(dataset.rows, filters)
    setReport({
      filters,
      rows: filtered,
      stats: computeReportStats(filtered),
      generatedAt: new Date().toISOString(),
    })
    setStatus(null)
  }

  function exportCsv() {
    if (!dataset || !validateFilters()) {
      setReport(null)
      return
    }

    const filtered = applyReportFilters(dataset.rows, buildFilters())
    if (filtered.length === 0) {
      setStatus({ tone: 'error', message: 'No hay resultados que exportar con los filtros actuales.' })
      return
    }

    setIsExporting(true)
    try {
      const csv = buildReportCsv(filtered)
      downloadTextFile(
        `reporte-vocacional-${new Date().toISOString().slice(0, 10)}.csv`,
        csv,
        'text/csv;charset=utf-8',
      )
      setStatus({ tone: 'success', message: `Se descargó el CSV con ${filtered.length} resultado(s).` })
    } finally {
      setIsExporting(false)
    }
  }

  function printReport() {
    if (!validateFilters()) {
      return
    }

    if (dataset) {
      const filters = buildFilters()
      const filtered = applyReportFilters(dataset.rows, filters)
      setReport({
        filters,
        rows: filtered,
        stats: computeReportStats(filtered),
        generatedAt: new Date().toISOString(),
      })
    }
    setStatus(null)
    window.setTimeout(() => window.print(), 80)
  }

  const filterChips = useMemo(() => {
    if (!report) {
      return []
    }

    const chips: string[] = []
    const selectedUser = report.filters.userId ? usersById.get(report.filters.userId) : undefined
    if (selectedUser) {
      chips.push(`Usuario: ${selectedUser.studentName}`)
    }
    const selectedDepartment = report.filters.departmentId
      ? departmentsById.get(report.filters.departmentId)
      : undefined
    if (selectedDepartment) {
      chips.push(`Departamento: ${selectedDepartment.name}`)
    }
    const selectedProgram = report.filters.programId
      ? programsById.get(report.filters.programId)
      : undefined
    if (selectedProgram) {
      chips.push(`Programa: ${selectedProgram.name}`)
    }
    if (report.filters.startDate) {
      chips.push(`Desde: ${report.filters.startDate}`)
    }
    if (report.filters.endDate) {
      chips.push(`Hasta: ${report.filters.endDate}`)
    }
    return chips
  }, [report, usersById, departmentsById, programsById])

  if (isLoading) {
    return <div className="loading-state">Cargando datos de reportes...</div>
  }

  if (datasetError) {
    return (
      <section className="seccion-administracion">
        <div className="seccion-administracion__encabezado">
          <div>
            <span className="panel-administracion__eyebrow">Administrador · Reportes</span>
            <h2>No fue posible cargar el reporte</h2>
            <p>{datasetError}</p>
          </div>
        </div>
        <div className="admin-report-actions">
          <button type="button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="seccion-administracion">
      <div className="seccion-administracion__encabezado">
        <div>
          <span className="panel-administracion__eyebrow">Administrador · Reportes</span>
          <h2>Reporte de resultados vocacionales</h2>
          <p>Filtra los resultados registrados y genera estadísticas consolidadas para la toma de decisiones.</p>
        </div>
      </div>

      <div className="admin-report-filters">
        <fieldset className="admin-filter-card">
          <legend>Usuario</legend>
          <label htmlFor="report-user-search">Nombre, correo o identificación</label>
          <input
            id="report-user-search"
            type="search"
            value={userQuery}
            placeholder="Ej. Laura, correo@ejemplo.com o 1029..."
            aria-invalid={Boolean(errors.user)}
            aria-describedby={errors.user ? 'report-user-error' : undefined}
            onChange={(event) => {
              setUserQuery(event.target.value)
              setSelectedUserId('')
              clearReport()
              setErrors((current) => ({ ...current, user: '' }))
            }}
          />
          {userQuery ? (
            matchingUsers.length > 0 ? (
              <div className="admin-filter-options" role="radiogroup" aria-label="Usuarios encontrados">
                {matchingUsers.map((user) => (
                  <label key={user.userId}>
                    <input
                      type="radio"
                      name="report-user"
                      value={user.userId}
                      checked={selectedUserId === user.userId}
                      onChange={() => {
                        setSelectedUserId(user.userId)
                        clearReport()
                        setErrors((current) => ({ ...current, user: '' }))
                      }}
                    />
                    <span>
                      <strong>{user.studentName}</strong>
                      <small>{user.email} · {user.document}</small>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="admin-filter-empty">Sin resultados para “{userQuery}”.</p>
            )
          ) : (
            <p className="admin-filter-hint">
              {rows.length === 0
                ? 'Aún no hay usuarios con pruebas registradas.'
                : 'Escribe para mostrar resultados seleccionables.'}
            </p>
          )}
          {errors.user ? (
            <small id="report-user-error" className="form-field__error">
              {errors.user}
            </small>
          ) : null}
        </fieldset>

        <fieldset className="admin-filter-card">
          <legend>Departamento</legend>
          <label htmlFor="report-department-search">Buscar departamento</label>
          <input
            id="report-department-search"
            type="search"
            value={departmentQuery}
            placeholder="Ej. Cundinamarca"
            aria-invalid={Boolean(errors.department)}
            aria-describedby={errors.department ? 'report-department-error' : undefined}
            onChange={(event) => {
              setDepartmentQuery(event.target.value)
              setSelectedDepartmentId('')
              clearReport()
              setErrors((current) => ({ ...current, department: '' }))
            }}
          />
          {departmentQuery ? (
            matchingDepartments.length > 0 ? (
              <div className="admin-filter-options" role="radiogroup" aria-label="Departamentos encontrados">
                {matchingDepartments.map((department) => (
                  <label key={department.id}>
                    <input
                      type="radio"
                      name="report-department"
                      value={department.id}
                      checked={selectedDepartmentId === department.id}
                      onChange={() => {
                        setSelectedDepartmentId(department.id)
                        clearReport()
                        setErrors((current) => ({ ...current, department: '' }))
                      }}
                    />
                    <span>{department.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="admin-filter-empty">Sin departamentos coincidentes.</p>
            )
          ) : (
            <p className="admin-filter-hint">Escribe para buscar en los departamentos registrados.</p>
          )}
          {errors.department ? (
            <small id="report-department-error" className="form-field__error">
              {errors.department}
            </small>
          ) : null}
        </fieldset>

        <fieldset className="admin-filter-card">
          <legend>Programa sugerido</legend>
          <label htmlFor="report-program">Programa</label>
          <select
            id="report-program"
            value={programId}
            onChange={(event) => {
              setProgramId(event.target.value)
              clearReport()
            }}
          >
            <option value="">Todos los programas</option>
            {programGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="admin-filter-hint">Programas sugeridos por las pruebas del catálogo.</p>
        </fieldset>

        <fieldset className="admin-filter-card">
          <legend>Periodo</legend>
          <div className="reportes-administracion__fechas">
            <label htmlFor="report-start-date">
              Desde
              <input
                id="report-start-date"
                type="date"
                value={startDate}
                aria-invalid={Boolean(errors.period)}
                onChange={(event) => {
                  setStartDate(event.target.value)
                  clearReport()
                  setErrors((current) => ({ ...current, period: '' }))
                }}
              />
            </label>
            <label htmlFor="report-end-date">
              Hasta
              <input
                id="report-end-date"
                type="date"
                value={endDate}
                aria-invalid={Boolean(errors.period)}
                onChange={(event) => {
                  setEndDate(event.target.value)
                  clearReport()
                  setErrors((current) => ({ ...current, period: '' }))
                }}
              />
            </label>
          </div>
          {errors.period ? <small className="form-field__error">{errors.period}</small> : null}
        </fieldset>
      </div>

      <div className="admin-report-actions">
        <button type="button" onClick={generateReport} disabled={!dataset}>
          Generar reporte
        </button>
        <button type="button" onClick={exportCsv} disabled={isExporting || !dataset}>
          Descargar CSV
        </button>
        <button type="button" onClick={printReport} disabled={!dataset}>
          Imprimir (PDF)
        </button>
      </div>

      {status ? (
        <p
          className={`admin-feedback admin-feedback--${status.tone}`}
          role={status.tone === 'error' ? 'alert' : 'status'}
        >
          {status.message}
        </p>
      ) : null}

      {report ? (
        <section className="reporte-generado">
          <div className="reporte-generado__encabezado">
            <div>
              <span className="panel-administracion__eyebrow">Reporte generado</span>
              <h3>Estadísticas consolidadas</h3>
              {filterChips.length > 0 ? (
                <div className="reporte-generado__resumen">
                  {filterChips.map((chip) => (
                    <span key={chip} className="reporte-generado__chip">
                      {chip}
                    </span>
                  ))}
                </div>
              ) : (
                <p>Todos los resultados registrados en el sistema.</p>
              )}
            </div>
            <span className="reporte-generado__fecha">
              Generado el {new Date(report.generatedAt).toLocaleString('es-CO')}
            </span>
          </div>

          {report.rows.length === 0 ? (
            <p className="reporte-generado__vacio">
              No hay resultados que coincidan con los filtros seleccionados. Ajusta los filtros o
              limpia la selección para ver más datos.
            </p>
          ) : (
            <>
              <div className="reporte-generado__kpis">
                <article className="estadistica-administracion__tarjeta">
                  <span>Resultados</span>
                  <strong>{report.stats.totalResults}</strong>
                  <p>Pruebas con reporte dentro del filtro.</p>
                </article>
                <article className="estadistica-administracion__tarjeta">
                  <span>Estudiantes únicos</span>
                  <strong>{report.stats.totalStudents}</strong>
                  <p>Usuarios que completaron al menos una prueba.</p>
                </article>
                <article className="estadistica-administracion__tarjeta">
                  <span>Afinidad promedio</span>
                  <strong>{report.stats.averageAffinity}%</strong>
                  <p>Promedio del programa sugerido.</p>
                </article>
                <article className="estadistica-administracion__tarjeta">
                  <span>Área predominante</span>
                  <strong>{report.stats.topArea}</strong>
                  <p>Área con mayor número de resultados.</p>
                </article>
              </div>

              <div className="reporte-generado__paneles">
                <article className="resumen-administracion__panel reporte-generado__panel">
                  <h4>Resultados por área</h4>
                  <div className="reporte-barras">
                    {report.stats.byArea.map((item) => (
                      <div key={item.name} className="reporte-barras__fila">
                        <span>{item.name}</span>
                        <div className="reporte-barras__pista">
                          <div
                            className="reporte-barras__relleno"
                            style={{
                              width: `${Math.min(100, (item.count / maxCount(report.stats.byArea)) * 100)}%`,
                            }}
                          />
                        </div>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="resumen-administracion__panel reporte-generado__panel">
                  <h4>Programas sugeridos</h4>
                  <div className="reporte-barras">
                    {report.stats.byCareer.map((item) => (
                      <div key={item.name} className="reporte-barras__fila">
                        <span title={`${item.avgAffinity}% de afinidad promedio`}>
                          {item.name}
                        </span>
                        <div className="reporte-barras__pista">
                          <div
                            className="reporte-barras__relleno"
                            style={{
                              width: `${Math.min(100, (item.count / maxCount(report.stats.byCareer)) * 100)}%`,
                            }}
                          />
                        </div>
                        <strong>{item.count} · {item.avgAffinity}%</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="resumen-administracion__panel reporte-generado__panel">
                  <h4>Distribución por departamento</h4>
                  <div className="reporte-barras">
                    {report.stats.byDepartment.map((item) => (
                      <div key={item.name} className="reporte-barras__fila">
                        <span>{item.name}</span>
                        <div className="reporte-barras__pista">
                          <div
                            className="reporte-barras__relleno"
                            style={{
                              width: `${Math.min(100, (item.count / maxCount(report.stats.byDepartment)) * 100)}%`,
                            }}
                          />
                        </div>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="resumen-administracion__panel reporte-generado__panel">
                  <h4>Internos vs Externos</h4>
                  <p className="admin-filter-hint">
                    Clasificación de los estudiantes únicos según tengan o no un programa asociado.
                  </p>
                  <div className="reporte-generado__resumen-interno">
                    <div>
                      <strong>{report.stats.internos}</strong>
                      <span>Internos · {report.stats.totalStudents > 0 ? Math.round((report.stats.internos / report.stats.totalStudents) * 100) : 0}%</span>
                    </div>
                    <div>
                      <strong>{report.stats.externos}</strong>
                      <span>Externos · {report.stats.totalStudents > 0 ? Math.round((report.stats.externos / report.stats.totalStudents) * 100) : 0}%</span>
                    </div>
                  </div>
                </article>
              </div>

              <article className="resumen-administracion__panel reporte-generado__panel">
                <h4>Detalle de resultados ({report.rows.length})</h4>
                <div className="reporte-generado__tabla">
                  <div className="reporte-generado__cabecera" aria-hidden="true">
                    <span>Estudiante</span>
                    <span>Documento</span>
                    <span>Fecha</span>
                    <span>Departamento</span>
                    <span>Área</span>
                    <span>Programa</span>
                    <span>Afinidad</span>
                  </div>
                  {report.rows.map((row) => (
                    <div key={row.testId} className="reporte-generado__fila">
                      <span>{row.studentName}</span>
                      <span>{row.document}</span>
                      <span>{row.completedAt.slice(0, 10)}</span>
                      <span>{row.departmentName}</span>
                      <span>{row.primaryArea}</span>
                      <span>{row.topCareer}</span>
                      <strong>{row.affinity}%</strong>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}
        </section>
      ) : null}
    </section>
  )
}
