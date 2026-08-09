import { useMemo, useState } from 'react'
import { adminService } from '../../../services/adminService'
import { getUsers } from '../../../services/authStorage'
import { useAuthStore } from '../../../stores/authStore'
import type { RegisteredUserRecord, UserRole } from '../../../types'
import { getUserRoleLabel, USER_ROLE_OPTIONS } from '../../../utils/roles'

export function RootUserRolesView() {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const [users, setUsers] = useState<RegisteredUserRecord[]>(() => getUsers())
  const [draftRoles, setDraftRoles] = useState<Record<string, UserRole>>(() =>
    Object.fromEntries(getUsers().map((user) => [user.id, user.role])),
  )
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)

  const pendingCount = useMemo(
    () => users.filter((user) => draftRoles[user.id] !== user.role).length,
    [draftRoles, users],
  )

  async function saveRole(user: RegisteredUserRecord) {
    const nextRole = draftRoles[user.id]
    if (!nextRole || nextRole === user.role) {
      return
    }

    try {
      setSavingUserId(user.id)
      setStatus(null)
      const response = await adminService.updateUserRole(user.id, nextRole)
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, role: response.data.role } : item)),
      )
      setStatus({
        tone: 'success',
        message: `${response.message ?? 'Rol actualizado.'} El backend sigue siendo responsable de autorizar cada operación.`,
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'No fue posible actualizar el rol.',
      })
    } finally {
      setSavingUserId(null)
    }
  }

  return (
    <section className="seccion-administracion">
      <div className="seccion-administracion__encabezado">
        <div>
          <span className="panel-administracion__eyebrow">ROOT · Usuarios</span>
          <h2>Usuarios - Modificar rol</h2>
          <p>
            Selecciona un rol y guarda explícitamente. Cambiar el selector no se presenta como una
            actualización persistida.
          </p>
        </div>
        <div className="admin-pending-count" aria-live="polite">
          {pendingCount} {pendingCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}
        </div>
      </div>

      {users.length > 0 ? (
        <div className="usuarios-administracion">
          {users.map((user) => {
            const draftRole = draftRoles[user.id] ?? user.role
            const isCurrentUser = user.id === sessionUser?.id
            const hasPendingChange = draftRole !== user.role

            return (
              <article key={user.id} className="usuarios-administracion__tarjeta">
                <div className="usuarios-administracion__principal">
                  <strong>{user.fullName}</strong>
                  <span>{user.email}</span>
                  <p>
                    Documento: {user.document} · Usuario: {user.username ?? 'Sin nombre de usuario'}
                  </p>
                  <p>Rol guardado: {getUserRoleLabel(user.role)}</p>
                </div>
                <div className="usuarios-administracion__controles">
                  <label htmlFor={`user-role-${user.id}`}>
                    Nuevo rol
                    <select
                      id={`user-role-${user.id}`}
                      value={draftRole}
                      disabled={isCurrentUser || savingUserId === user.id}
                      onChange={(event) => {
                        setDraftRoles((current) => ({
                          ...current,
                          [user.id]: event.target.value as UserRole,
                        }))
                        setStatus(null)
                      }}
                    >
                      {USER_ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span
                    className={`usuarios-administracion__rol usuarios-administracion__rol--${draftRole}`}
                  >
                    {getUserRoleLabel(draftRole)}
                  </span>
                  <button
                    type="button"
                    className="admin-inline-save"
                    onClick={() => void saveRole(user)}
                    disabled={!hasPendingChange || isCurrentUser || savingUserId === user.id}
                  >
                    {savingUserId === user.id ? 'Guardando...' : 'Guardar cambio'}
                  </button>
                  {isCurrentUser ? (
                    <small>No puedes cambiar tu propio rol durante la sesión activa.</small>
                  ) : hasPendingChange ? (
                    <small>Cambio local pendiente de guardar.</small>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="admin-empty-state">No hay usuarios disponibles.</div>
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
