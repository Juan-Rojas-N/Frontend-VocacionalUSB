import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AreaProfile, ChartDatum } from '../../types'

interface ResultChartsProps {
  affinityByArea: ChartDatum[]
  selectedArea: string
  selectedProfile: AreaProfile | null
  onAreaSelect: (label: string) => void
}

function splitTraits(value?: string): string[] {
  if (!value) {
    return []
  }

  return value
    .replace(/\.$/, '')
    .split(',')
    .map((trait) => trait.trim())
    .filter(Boolean)
}

export function ResultCharts({
  affinityByArea,
  selectedArea,
  selectedProfile,
  onAreaSelect,
}: ResultChartsProps) {
  const traits = splitTraits(selectedProfile?.perfil)

  return (
    <div className="chart-grid">
      <div className="chart-card">
        <h3>Afinidad por Área</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={affinityByArea} margin={{ top: 12, right: 16, left: -12, bottom: 28 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e9e4db" />
            <XAxis
              dataKey="label"
              tick={false}
              label={{
                value: 'Área',
                position: 'bottom',
                offset: 6,
                fill: '#6d6d6d',
                fontSize: 14,
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: '#8c8c8c', fontSize: 14 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {affinityByArea.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={entry.label === selectedArea ? '#b25d00' : '#ef7d00'}
                  cursor="pointer"
                  onClick={() => onAreaSelect(entry.label)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="chart-card__pista">Haz clic en una barra para ver el perfil del área.</p>
      </div>

      <div className="chart-card">
        <h3>Tu perfil vocacional</h3>
        {selectedProfile ? (
          <div className="perfil-vocacional-card">
            <div className="perfil-vocacional-card__principal">
              <img
                src={`${import.meta.env.BASE_URL}images/pacho/pachito_celebra.png`}
                alt=""
                className="perfil-vocacional-card__imagen"
              />
              <div className="perfil-vocacional-card__texto">
                <div className="perfil-vocacional-card__area">{selectedProfile.nombreArea}</div>
                {traits.length > 0 ? (
                  <ul className="perfil-vocacional-card__lista">
                    {traits.map((trait) => (
                      <li key={trait}>{trait}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <p className="chart-card__pista">Selecciona un área para ver su perfil.</p>
        )}
      </div>
    </div>
  )
}
