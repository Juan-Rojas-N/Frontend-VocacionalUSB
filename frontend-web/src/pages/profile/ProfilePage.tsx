import { useEffect } from 'react'
import { catalogService } from '../../services/catalogService'
import { useAuthStore } from '../../stores/authStore'
import { getDepartmentDisplayName, getMunicipalityDisplayName } from '../../utils/catalogs'

export function ProfilePage() {
  const sessionUser = useAuthStore((state) => state.sessionUser)

  useEffect(() => {
    let active = true

    async function loadCatalogs() {
      try {
        await catalogService.loadAll()
        if (active && sessionUser?.departmentId) {
          await catalogService.loadMunicipalities(sessionUser.departmentId)
        }
      } catch {
        // Se conservan los nombres guardados en el perfil.
      }
    }

    void loadCatalogs()

    return () => {
      active = false
    }
  }, [sessionUser?.departmentId])

  const departmentName = sessionUser
    ? getDepartmentDisplayName(sessionUser.departmentId, sessionUser.departmentName)
    : 'Sin departamento'
  const municipalityName = sessionUser
    ? getMunicipalityDisplayName(
        sessionUser.departmentId,
        sessionUser.municipalityId,
        sessionUser.municipalityName,
      )
    : 'Sin municipio'

  return (
    <div className="profile-shell">
      <section className="profile-card">
        <div className="profile-card__hero">
          <div className="profile-card__avatar">{sessionUser?.firstName?.slice(0, 1) ?? 'U'}</div>
          <div>
            <span>Perfil de usuario</span>
            <h1>{sessionUser?.fullName ?? 'Usuario USB'}</h1>
            <p>Espacio disponible para consultar la información básica del usuario.</p>
          </div>
        </div>

        <div className="profile-grid">
          <div>
            <span>Correo</span>
            <strong>{sessionUser?.email}</strong>
          </div>
          <div>
            <span>Nombre de usuario</span>
            <strong>{sessionUser?.username ?? 'Pendiente de asignación'}</strong>
          </div>
          <div>
            <span>Documento</span>
            <strong>{sessionUser?.document}</strong>
          </div>
          <div>
            <span>Ciudad</span>
            <strong>{municipalityName}</strong>
          </div>
          <div>
            <span>Departamento</span>
            <strong>{departmentName}</strong>
          </div>
        </div>
      </section>
    </div>
  )
}
