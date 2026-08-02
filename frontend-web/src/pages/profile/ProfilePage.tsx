import { useAuthStore } from '../../stores/authStore'

export function ProfilePage() {
  const sessionUser = useAuthStore((state) => state.sessionUser)

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
            <span>Documento</span>
            <strong>{sessionUser?.document}</strong>
          </div>
          <div>
            <span>Ciudad</span>
            <strong>{sessionUser?.city}</strong>
          </div>
          <div>
            <span>Departamento</span>
            <strong>{sessionUser?.department}</strong>
          </div>
        </div>
      </section>
    </div>
  )
}
