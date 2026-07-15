import { calcDayMacro, r0, kcalTarget } from '../../hooks/useMacro'
import { MEAL_DEFS } from '../../data/diets'

function MacroBar({ label, value, target, color }) {
  const pct = Math.min(110, (value / Math.max(target, 1)) * 100)
  const diff = Math.round(value - target)
  const ok = Math.abs(diff) <= 15
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[17px] font-extrabold leading-none" style={{ color }}>{r0(value)}g</span>
        <span className="text-[11px] text-slate-400">/ {target}g</span>
      </div>
      <div className="h-1 bg-slate-200 rounded-full overflow-hidden mb-1">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-[11px] font-semibold" style={{ color: ok ? '#16a34a' : '#dc2626' }}>
        {diff >= 0 ? '+' : ''}{diff}g
      </div>
    </div>
  )
}

export default function MacroBanner({ day, targets, dayName, catalog }) {
  const tot = calcDayMacro(day, catalog, MEAL_DEFS)
  const ktgt = kcalTarget(targets)
  const kd = Math.round(tot.k - ktgt)
  const kOk = Math.abs(kd) < 120

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-3">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[13px] font-bold text-slate-800">{dayName}</div>
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-extrabold tracking-tight text-slate-800">
            {r0(tot.k)}<span className="text-[12px] font-normal text-slate-400 ml-0.5">kcal</span>
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${kOk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {kd >= 0 ? '+' : ''}{kd} kcal
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MacroBar label="Carboidrati" value={tot.c} target={targets.C} color="#d97706" />
        <MacroBar label="Proteine"    value={tot.p} target={targets.P} color="#0d9488" />
        <MacroBar label="Grassi"      value={tot.f} target={targets.G} color="#dc2626" />
      </div>
    </div>
  )
}
