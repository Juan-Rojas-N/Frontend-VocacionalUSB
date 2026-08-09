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
  return (
    <section className="seccion-administracion">
      <div className="seccion-administracion__encabezado">
        <div>
          <span className="panel-administracion__eyebrow">Resultados</span>
          <h2>Resultados por individuo</h2>
          <p>Vista lista para recibir el detalle consolidado desde el backend.</p>
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
                <div className="resultados-administracion__area">{card.primaryArea}</div>
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
