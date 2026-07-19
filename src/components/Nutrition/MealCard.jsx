import { calcMealMacro, r0 } from '../../hooks/useMacro'
import FoodTable from './FoodTable'

export default function MealCard({ meal, foods, isOpen, onToggle, catalog }) {
  const m = calcMealMacro(foods, catalog)
  const desc = foods.length ? foods.map(([f]) => f).join(', ') : '—'

  return (
    <div className="bg-[#161b22] rounded-2xl border border-[#21262d] overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-[#21262d]"
        onClick={onToggle}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: meal.bg }}>
          {meal.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: meal.color }}>
            {meal.label}
          </div>
          <div className="text-xs text-[#7d8590] mt-0.5 truncate">{desc}</div>
          <div className="flex gap-2 mt-0.5">
            <span className="text-[10.5px] font-bold" style={{ color: '#d29922' }}>C {r0(m.c)}g</span>
            <span className="text-[10.5px] font-bold" style={{ color: '#3fb950' }}>P {r0(m.p)}g</span>
            <span className="text-[10.5px] font-bold" style={{ color: '#f85149' }}>G {r0(m.f)}g</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[15px] font-extrabold text-[#e6edf3]">
            {r0(m.k)}<span className="text-[10px] font-normal text-[#7d8590] ml-0.5">kcal</span>
          </span>
          <span className={`text-[10px] text-[#7d8590] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-[#21262d]">
          <FoodTable foods={foods} catalog={catalog} />
        </div>
      )}
    </div>
  )
}
