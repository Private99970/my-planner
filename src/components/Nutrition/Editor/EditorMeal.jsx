import { useState } from 'react'
import { calcMealMacro, calcMacro, r0, r1 } from '../../../hooks/useMacro'
import FoodSearch from './FoodSearch'
import { MEAL_DEFS, GG } from '../../../data/diets'

export default function EditorMeal({ meal, foods, curDay, catalog, onUpdateGrams, onRemoveFood, onAddFood, onCopyMealTo }) {
  const mm = calcMealMacro(foods, catalog)
  const [copyDay, setCopyDay] = useState(curDay === 6 ? 0 : curDay + 1)
  const [copyMeal, setCopyMeal] = useState(meal.id)

  const handleCopyMeal = () => {
    if (foods.length === 0) { alert('Il pasto è vuoto, nulla da copiare.'); return }
    const dstLabel = MEAL_DEFS.find(m => m.id === copyMeal)?.label || copyMeal
    if (window.confirm(`Copia ${meal.label} → ${dstLabel} di ${GG[copyDay]}?\nIl pasto di destinazione verrà sovrascritto.`)) {
      onCopyMealTo(meal.id, copyDay, copyMeal)
    }
  }

  const selectCls = "text-[10.5px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 px-1.5 py-1 outline-none focus:border-indigo-500"

  return (
    <div
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
      style={{ borderLeft: `4px solid ${meal.color}` }}
    >
      {/* Meal header */}
      <div className="px-3.5 pt-2.5 pb-2" style={{ background: `${meal.color}0f` }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[15px] flex-shrink-0">{meal.icon}</span>
          <span className="text-[11.5px] font-bold uppercase tracking-wide flex-shrink-0" style={{ color: meal.color }}>{meal.label}</span>
          <span className="flex items-center gap-1.5 text-[10.5px] font-semibold ml-1">
            <span style={{ color: '#d97706' }}>C{r0(mm.c)}</span>
            <span style={{ color: '#0d9488' }}>P{r0(mm.p)}</span>
            <span style={{ color: '#dc2626' }}>G{r0(mm.f)}</span>
          </span>
          <span className="ml-auto text-[11px] font-bold text-slate-500 whitespace-nowrap flex-shrink-0">
            {r0(mm.k)} kcal
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 flex-shrink-0">Copia in:</span>
          <select value={copyDay} onChange={e => setCopyDay(parseInt(e.target.value))} className={selectCls}>
            {GG.map((g, i) => <option key={i} value={i}>{g}</option>)}
          </select>
          <select value={copyMeal} onChange={e => setCopyMeal(e.target.value)} className={selectCls}>
            {MEAL_DEFS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <button onClick={handleCopyMeal} className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            Copia
          </button>
        </div>
      </div>

      {/* Food rows */}
      {foods.map(([food, grams], fi) => {
        const m = calcMacro(food, grams, catalog)
        const missing = !catalog[food]
        return (
          <div key={fi} className="flex items-center gap-2 px-3.5 py-2 border-t border-slate-100">
            <span className="flex-1 text-[12.5px] font-medium text-slate-800 min-w-0 truncate">
              {food}
              {missing && <span className="ml-1 text-amber-500 text-[10px]">⚠</span>}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                className="w-14 border-2 border-slate-200 rounded-lg px-2 py-1 text-[12px] text-center font-sans outline-none focus:border-indigo-500"
                type="number" min="1" max="9999"
                value={grams}
                onChange={e => onUpdateGrams(meal.id, fi, e.target.value)}
              />
              <span className="text-[11px] text-slate-400">g</span>
            </div>
            <span className="text-[10px] text-slate-400 min-w-[4.5rem] text-right hidden sm:block flex-shrink-0">
              C{r1(m.c)} P{r1(m.p)} G{r1(m.f)}
            </span>
            <button
              onClick={() => onRemoveFood(meal.id, fi)}
              className="px-2 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )
      })}

      <FoodSearch
        catalog={catalog}
        onSelect={(food, g) => onAddFood(meal.id, food, g)}
      />
    </div>
  )
}
