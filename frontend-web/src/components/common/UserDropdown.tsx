import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../../constants'
import { useAuthStore } from '../../stores/authStore'

interface UserDropdownProps {
  open: boolean
  onClose: () => void
}

export function UserDropdown({ open, onClose }: UserDropdownProps) {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const signOut = useAuthStore((state) => state.signOut)

  if (!open || !sessionUser) {
    return null
  }

  return (
    <div className="user-dropdown">
      <div className="user-dropdown__header">
        <strong>{sessionUser.firstName}</strong>
        <button
          type="button"
          className="user-dropdown__close"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          ☰
        </button>
      </div>
      <Link to={APP_ROUTES.profile} className="user-dropdown__item" onClick={onClose}>
        Perfil
      </Link>
      {sessionUser.role === 'admin' ? (
        <Link to={APP_ROUTES.admin} className="user-dropdown__item" onClick={onClose}>
          Administración
        </Link>
      ) : null}
      <button
        type="button"
        className="user-dropdown__item user-dropdown__item--button"
        onClick={() => {
          signOut()
          onClose()
        }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}
