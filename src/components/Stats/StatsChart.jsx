import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Dot
} from 'recharts'
import { MEASUREMENT_FIELDS } from '../../hooks/useBodyMeasurements'

const CIRCONF_FIELDS = MEASUREMENT_FIELDS.filter(f => f.group === 'circonf')

const COLORS = [
  '#58a6ff', '#d29922', '#3fb950', '#f85149',
  '#bc8cff', '#39d5ff', '#f97316', '#ec4899',
]

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-lg px-3 py-2 text-[12px]">
      <div className="font-bold text-[#e6edf3] mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-[#7d8590]">{p.name}:</span>
          <span className="font-semibold text-[#e6edf3]">{p.value} {p.unit ?? ''}</span>
        </div>
      ))}
    </div>
  )
}

export default function StatsChart({ records }) {
  const [tab, setTab] = useState('peso') // 'peso' | 'misure'
  const [selected, setSelected] = useState(() =>
    new Set(['vita', 'fianchi', 'spalle'])
  )

  // Ordine ascendente per il grafico
  const chartData = useMemo(() => {
    return [...records]
      .filter(r => r.recorded_at)
      .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
      .map(r => ({
        ...r,
        _label: fmtDate(r.recorded_at),
      }))
  }, [records])

  const toggleField = (key) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className="mx-4 mt-4 bg-[#161b22] rounded-2xl border border-[#21262d] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#21262d]">
        <button
          onClick={() => setTab('peso')}
          className={`flex-1 py-2.5 text-[12px] font-semibold transition-colors ${
            tab === 'peso'
              ? 'text-[#58a6ff] border-b-2 border-[#58a6ff]'
              : 'text-[#7d8590] hover:text-[#e6edf3]'
          }`}
        >
          ⚖️ Peso
        </button>
        <button
          onClick={() => setTab('misure')}
          className={`flex-1 py-2.5 text-[12px] font-semibold transition-colors ${
            tab === 'misure'
              ? 'text-[#58a6ff] border-b-2 border-[#58a6ff]'
              : 'text-[#7d8590] hover:text-[#e6edf3]'
          }`}
        >
          📏 Misure
        </button>
      </div>

      {tab === 'peso' && (
        <div className="pt-4 pb-2 pr-4">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis
                dataKey="_label"
                tick={{ fontSize: 10, fill: '#7d8590' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#7d8590' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="peso"
                name="Peso"
                unit="kg"
                stroke="#58a6ff"
                strokeWidth={2.5}
                dot={<Dot r={3} fill="#58a6ff" strokeWidth={0} />}
                activeDot={{ r: 5, fill: '#58a6ff' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'misure' && (
        <>
          {/* Selettore misure */}
          <div className="px-4 pt-3 flex flex-wrap gap-1.5">
            {CIRCONF_FIELDS.map((f, i) => {
              const active = selected.has(f.key)
              return (
                <button
                  key={f.key}
                  onClick={() => toggleField(f.key)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                    active
                      ? 'text-[#0d1117] border-transparent'
                      : 'text-[#7d8590] border-[#30363d] bg-[#0d1117]'
                  }`}
                  style={active ? { background: COLORS[i % COLORS.length] } : {}}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          <div className="pt-3 pb-2 pr-4">
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis
                  dataKey="_label"
                  tick={{ fontSize: 10, fill: '#7d8590' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#7d8590' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                {CIRCONF_FIELDS.map((f, i) =>
                  selected.has(f.key) ? (
                    <Line
                      key={f.key}
                      type="monotone"
                      dataKey={f.key}
                      name={f.label}
                      unit="cm"
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={<Dot r={3} fill={COLORS[i % COLORS.length]} strokeWidth={0} />}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  ) : null
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
