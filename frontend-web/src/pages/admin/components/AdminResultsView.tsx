import { useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '../../../constants'

interface ResultCard {
  id: string
  userName: string
  city: string
  primaryArea: string
  programs: Array<{
    id: string
    name: string
    affinity: number
  }>
}

interface AdminResultsViewProps {
  cards: ResultCard[]
}

export function AdminResultsView({ cards }: AdminResultsViewProps) {
  const navigate = useNavigate()

  return (
    <section className="seccion-administracion">
      <div className="seccion-administracion__encabezado">
        <div>
          <span className="panel-administracion__eyebrow">Resultados</span>
          <h2>Resultados por individuo</h2>
          <p>Últimos resultados consolidados desde el backend, con el programa sugerido y su afinidad.</p>
        </div>
      </div>

      {cards.length > 0 ? (
        <div className="resultados-administracion__lista">
          {cards.map((card) => (
            <article key={card.id} className="resultados-administracion__tarjeta">
              <div className="resultados-administracion__resumen">
                <div>
                  <strong>{card.userName}</strong>
                  <span>{card.city}</span>
                </div>
                <div className="resultados-administracion__area-acciones">
                  <div className="resultados-administracion__area">{card.primaryArea}</div>
                  <button
                    type="button"
                    className="resultados-administracion__ver-resultado"
                    onClick={() =>
                      navigate(
                        `${APP_ROUTES.results}/${card.id}?student=${encodeURIComponent(card.userName)}`,
                      )
                    }
                  >
                    Ver resultado
                  </button>
                </div>
              </div>
              <div className="resultados-administracion__programas">
                {card.programs.slice(0, 3).map((program, index) => (
                  <div key={program.id} className="resultados-administracion__programa">
                    <span>{index + 1}</span>
                    <div>
                      <strong>{program.name}</strong>
                      <small>{program.affinity}% de afinidad</small>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-empty-state">No hay resultados disponibles.</div>
      )}
    </section>
  )
}
