import { useEffect, useMemo, useState } from 'react'
import { adminService } from '../../../services/adminService'
import type { RoleActivity, RoleActivityAssignment } from '../../../types'

type LoadState = 'loading' | 'ready' | 'error'

export function RootRoleActivitiesView() {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [assignments, setAssignments] = useState<RoleActivityAssignment[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [draftActivities, setDraftActivities] = useState<RoleActivity[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => assignment.roleId === selectedRoleId) ?? null,
    [assignments, selectedRoleId],
  )
  const isProtectedRole = selectedAssignment?.role === 'root'

  const hasPendingChanges = useMemo(() => {
    if (!selectedAssignment || draftActivities.length !== selectedAssignment.activities.length) {
      return false
    }

    return draftActivities.some(
      (activity) =>
        activity.enabled !==
        selectedAssignment.activities.find((current) => current.id === activity.id)?.enabled,
    )
  }, [draftActivities, selectedAssignment])

  useEffect(() => {
    let active = true

    void adminService
      .getRoleActivityAssignments()
      .then((response) => {
        if (!active) {
          return
        }

        setAssignments(response.data)
        const initial = response.data[0]
        if (initial) {
          setSelectedRoleId(initial.roleId)
          setDraftActivities(initial.activities.map((activity) => ({ ...activity })))
        }
        setLoadState('ready')
      })
      .catch(() => {
        if (active) {
          setLoadState('error')
        }
      })

    return () => {
      active = false
    }
  }, [])

  function selectRole(roleId: number) {
    if (
      hasPendingChanges &&
      !window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos y cambiar de rol?')
    ) {
      return
    }

    const assignment = assignments.find((item) => item.roleId === roleId)
    setSelectedRoleId(roleId)
    setDraftActivities(assignment?.activities.map((activity) => ({ ...activity })) ?? [])
    setStatus(null)
  }

  function toggleActivity(activityId: string) {
    if (isProtectedRole) {
      return
    }

    setDraftActivities((current) =>
      current.map((activity) =>
        activity.id === activityId ? { ...activity, enabled: !activity.enabled } : activity,
      ),
    )
    setStatus(null)
  }

  async function saveChanges() {
    if (selectedRoleId == null || isProtectedRole) {
      return
    }

    try {
      setIsSaving(true)
      setStatus(null)
      const response = await adminService.saveRoleActivities(selectedRoleId, draftActivities)
      setAssignments((current) =>
        current.map((assignment) =>
          assignment.roleId === selectedRoleId ? response.data : assignment,
        ),
      )
      setDraftActivities(response.data.activities.map((activity) => ({ ...activity })))
      setStatus({ tone: 'success', message: 'Permisos guardados y aplicados en el servidor.' })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'No fue posible guardar los cambios.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loadState === 'loading') {
    return <div className="loading-state">Cargando roles y actividades...</div>
  }

  if (loadState === 'error') {
    return (
      <section className="seccion-administracion admin-error-state" role="alert">
        <h2>No fue posible cargar los permisos</h2>
        <p>Verifica que el backend esté disponible y recarga la página para reintentar.</p>
      </section>
    )
  }

  return (
    <section className="seccion-administracion">
      <div className="seccion-administracion__encabezado">
        <div>
          <span className="panel-administracion__eyebrow">ROOT · Seguridad</span>
          <h2>Roles - Actividades</h2>
          <p>
            Activa o desactiva actividades del rol seleccionado. Los cambios se guardan en el
            servidor y se aplican de inmediato a la autorización por URL.
          </p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="admin-empty-state">No hay roles configurados.</div>
      ) : (
        <>
          <div className="role-activities__toolbar">
            <label htmlFor="role-activities-role">
              Rol
              <select
                id="role-activities-role"
                value={selectedRoleId ?? ''}
                onChange={(event) => selectRole(Number(event.target.value))}
              >
                {assignments.map((assignment) => (
                  <option key={assignment.roleId} value={assignment.roleId}>
                    {assignment.roleLabel}
                  </option>
                ))}
              </select>
            </label>
            <div className="role-activities__summary" aria-live="polite">
              <strong>{draftActivities.filter((activity) => activity.enabled).length}</strong>
              <span>de {draftActivities.length} actividades activas</span>
            </div>
          </div>

          {isProtectedRole ? (
            <div className="admin-empty-state">
              El rol ROOT no permite modificar sus permisos desde esta pantalla.
            </div>
          ) : null}

          {draftActivities.length > 0 && !isProtectedRole ? (
            <div className="role-activities__list">
              {draftActivities.map((activity) => (
                <article key={activity.id} className="role-activities__item">
                  <div>
                    <div className="role-activities__name">
                      <span className={`role-activities__method role-activities__method--${activity.method.toLowerCase()}`}>
                        {activity.method}
                      </span>
                      <strong>{activity.name}</strong>
                    </div>
                    <code>{activity.path}</code>
                  </div>
                  <label className="role-activities__toggle">
                    <input
                      type="checkbox"
                      checked={activity.enabled}
                      onChange={() => toggleActivity(activity.id)}
                    />
                    <span aria-hidden="true" />
                    <strong>{activity.enabled ? 'Activa' : 'Inactiva'}</strong>
                  </label>
                </article>
              ))}
            </div>
          ) : !isProtectedRole ? (
            <div className="admin-empty-state">Este rol no tiene actividades disponibles.</div>
          ) : null}

          <div className="admin-save-bar">
            <div>
              <strong>{hasPendingChanges ? 'Cambios pendientes' : 'Sin cambios pendientes'}</strong>
              <span>
                {hasPendingChanges
                  ? 'Guarda para confirmar el cambio en el servidor.'
                  : 'La configuración visible coincide con la última versión guardada.'}
              </span>
            </div>
            <button
              type="button"
              className="boton-principal"
              onClick={() => void saveChanges()}
              disabled={!hasPendingChanges || isSaving || isProtectedRole}
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </>
      )}

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
