import { useMemo, useState } from 'react'
import { mockResult } from '../../../mocks/data'
import { adminService } from '../../../services/adminService'
import type { AdminReportFilters, RegisteredUserRecord } from '../../../types'

interface AdminReportsViewProps {
  users: RegisteredUserRecord[]
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function AdminReportsView({ users }: AdminReportsViewProps) {
  const [userQuery, setUserQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [departmentQuery, setDepartmentQuery] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [programId, setProgramId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isExporting, setIsExporting] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)

  const matchingUsers = useMemo(() => {
    const query = normalizeSearch(userQuery)
    if (!query) {
      return []
    }

    return users
      .filter((user) =>
        [user.fullName, user.email, user.username ?? '', user.document]
          .map(normalizeSearch)
          .some((value) => value.includes(query)),
      )
      .slice(0, 8)
  }, [userQuery, users])

  const departments = useMemo(() => {
    const unique = new Map<string, string>()
    for (const user of users) {
      if (user.departmentId && user.departmentName) {
        unique.set(user.departmentId, user.departmentName)
      }
    }
    return Array.from(unique, ([id, name]) => ({ id, name })).sort((left, right) =>
      left.name.localeCompare(right.name, 'es'),
    )
  }, [users])

  const matchingDepartments = useMemo(() => {
    const query = normalizeSearch(departmentQuery)
    if (!query) {
      return []
    }
    return departments.filter((department) => normalizeSearch(department.name).includes(query))
  }, [departmentQuery, departments])

  function validateFilters() {
    const nextErrors: Record<string, string> = {}

    if (userQuery && !selectedUserId) {
      nextErrors.user =
        matchingUsers.length === 0
          ? 'No hay usuarios que coincidan con la búsqueda.'
          : 'Selecciona un usuario de la lista o limpia la búsqueda.'
    }

    if (selectedUserId && !users.some((user) => user.id === selectedUserId)) {
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

  async function exportReport(format: 'pdf' | 'csv' | 'excel') {
    if (!validateFilters()) {
      setStatus(null)
      return
    }

    const filters: AdminReportFilters = {
      userId: selectedUserId || undefined,
      departmentId: selectedDepartmentId || undefined,
      programId: programId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }

    try {
      setIsExporting(true)
      setStatus(null)
      const response = await adminService.exportReport(format, filters)
      setStatus({ tone: 'success', message: response.data.status })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'No fue posible generar el reporte.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section className="seccion-administracion">
      <div className="seccion-administracion__encabezado">
        <div>
          <span className="panel-administracion__eyebrow">Administrador · Reportes</span>
          <h2>Filtros de reportes</h2>
          <p>Combina filtros opcionales y valida el periodo antes de preparar una exportación mock.</p>
        </div>
        <span className="admin-mock-badge">Sin archivo real</span>
      </div>

      <div className="admin-report-filters">
        <fieldset className="admin-filter-card">
          <legend>Usuario</legend>
          <label htmlFor="report-user-search">Nombre, correo, usuario o identificación</label>
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
              setErrors((current) => ({ ...current, user: '' }))
            }}
          />
          {userQuery ? (
            matchingUsers.length > 0 ? (
              <div className="admin-filter-options" role="radiogroup" aria-label="Usuarios encontrados">
                {matchingUsers.map((user) => (
                  <label key={user.id}>
                    <input
                      type="radio"
                      name="report-user"
                      value={user.id}
                      checked={selectedUserId === user.id}
                      onChange={() => {
                        setSelectedUserId(user.id)
                        setErrors((current) => ({ ...current, user: '' }))
                      }}
                    />
                    <span>
                      <strong>{user.fullName}</strong>
                      <small>{user.email} · {user.document}</small>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="admin-filter-empty">Sin resultados para “{userQuery}”.</p>
            )
          ) : (
            <p className="admin-filter-hint">Escribe para mostrar resultados seleccionables.</p>
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
          <select id="report-program" value={programId} onChange={(event) => setProgramId(event.target.value)}>
            <option value="">Todos los programas</option>
            {mockResult.careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.name}
              </option>
            ))}
          </select>
          <p className="admin-filter-hint">La lista usa los programas disponibles en el resultado mock.</p>
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
                  setErrors((current) => ({ ...current, period: '' }))
                }}
              />
            </label>
          </div>
          {errors.period ? <small className="form-field__error">{errors.period}</small> : null}
        </fieldset>
      </div>

      <div className="admin-report-actions">
        <button type="button" onClick={() => void exportReport('pdf')} disabled={isExporting}>
          Preparar PDF
        </button>
        <button type="button" onClick={() => void exportReport('csv')} disabled={isExporting}>
          Preparar CSV
        </button>
        <button type="button" onClick={() => void exportReport('excel')} disabled={isExporting}>
          Preparar Excel
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
    </section>
  )
}
