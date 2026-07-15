import { Dumbbell, Apple, BarChart3 } from 'lucide-react'

const TABS = [
  { id: 'workout',    label: 'Workout',       Icon: Dumbbell  },
  { id: 'nutrition',  label: 'Alimentazione', Icon: Apple     },
  { id: 'stats',      label: 'Statistiche',   Icon: BarChart3 },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="shrink-0 bg-white border-t border-slate-200 flex z-20 sticky bottom-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
            active === id ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Icon size={20} strokeWidth={active === id ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">{label}</span>
        </button>
      ))}
    </nav>
  )
}
