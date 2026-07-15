import { SS, MEAL_DEFS } from '../../../data/diets'

export default function EditorDayTabs({ days, curDay, onSelectDay }) {
  return (
    <div className="flex no-scrollbar overflow-x-auto border-b border-slate-100 bg-white">
      {SS.map((d, i) => {
        const day = days[i] || {}
        const hasData = MEAL_DEFS.some(md => (day[md.id] || []).length > 0)
        const isOn = i === curDay
        return (
          <button
            key={i}
            onClick={() => onSelectDay(i)}
            className={`
              flex flex-col items-center px-4 py-2.5 border-b-2 text-[12.5px] font-semibold flex-shrink-0 transition-all
              ${isOn
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-400 border-transparent hover:text-slate-600'
              }
            `}
            style={{ minWidth: 44 }}
          >
            {d}
            <div
              className="h-[3px] rounded-full w-full mt-1 transition-colors"
              style={{
                background: isOn ? '#6366f1' : hasData ? 'rgba(99,102,241,0.3)' : 'transparent'
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
