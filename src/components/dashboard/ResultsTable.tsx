import type { AdminResultRecord } from '../../types'
import { formatDate, formatDocument, formatPercentage } from '../../utils/formatters'

interface ResultsTableProps {
  rows: AdminResultRecord[]
}

export function ResultsTable({ rows }: ResultsTableProps) {
  return (
    <div className="table-shell">
      <table className="results-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Documento</th>
            <th>Ciudad</th>
            <th>Área principal</th>
            <th>Carrera sugerida</th>
            <th>Afinidad</th>
            <th>Finalización</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.studentName}</td>
              <td>{formatDocument(row.document)}</td>
              <td>{row.city}</td>
              <td>{row.primaryArea}</td>
              <td>{row.topCareer}</td>
              <td>{formatPercentage(row.affinity)}</td>
              <td>{formatDate(row.completedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
