// DietPills — adattato al tema chiaro (light theme), sfondo slate-50
export default function DietPills({ dietNames, diets, curDietIdx, onSelectDiet, onEditDiet, onNewDiet }) {
  return (
    <div className="flex gap-1.5 no-scrollbar overflow-x-auto pb-1 items-center">
      {dietNames.map((name, i) => {
        const d = diets[name]
        const isOn = i === curDietIdx
        const isCustom = d?.custom
        return (
          <div key={name} className="flex items-center flex-shrink-0">
            <button
              onClick={() => onSelectDiet(i)}
              className={`
                px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all
                border rounded-l-full border-r-0
                ${isOn
                  ? isCustom
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-slate-700 border-slate-700 text-white'
                  : isCustom
                    ? 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                    : 'border-slate-300 text-slate-500 hover:bg-slate-100'
                }
              `}
              style={{ borderRadius: '999px 0 0 999px' }}
            >
              {name}
            </button>
            <button
              onClick={() => onEditDiet(name)}
              className={`
                px-2 py-1.5 text-[10px] border rounded-r-full transition-all
                ${isOn
                  ? isCustom
                    ? 'bg-indigo-500 border-indigo-600 text-white'
                    : 'bg-slate-600 border-slate-700 text-white'
                  : isCustom
                    ? 'border-indigo-300 text-indigo-400 hover:bg-indigo-50'
                    : 'border-slate-300 text-slate-400 hover:bg-slate-100'
                }
              `}
              style={{ borderRadius: '0 999px 999px 0', borderLeft: '1px solid rgba(0,0,0,0.08)' }}
              title="Modifica"
            >
              ✎
            </button>
          </div>
        )
      })}
      <button
        onClick={onNewDiet}
        className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-400 border border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-500 transition-all whitespace-nowrap"
      >
        ＋ Nuova
      </button>
    </div>
  )
}
