import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartDatum, RadarDatum } from '../../types'

interface ResultChartsProps {
  affinityByArea: ChartDatum[]
  radarProfile: RadarDatum[]
}

export function ResultCharts({ affinityByArea, radarProfile }: ResultChartsProps) {
  return (
    <div className="chart-grid">
      <div className="chart-card">
        <h3>Afinidad por Área</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={affinityByArea} margin={{ top: 12, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e9e4db" />
            <XAxis dataKey="label" tick={{ fill: '#6d6d6d', fontSize: 14 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8c8c8c', fontSize: 14 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#ef7d00" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-card">
        <h3>Perfil de Habilidades</h3>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarProfile}>
            <PolarGrid stroke="#dfddd8" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6d6d6d', fontSize: 14 }} />
            <Radar
              name="Tus habilidades"
              dataKey="score"
              stroke="#ef7d00"
              fill="#ef7d00"
              fillOpacity={0.55}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
