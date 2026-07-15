import { SS } from '../../data/diets'

export default function DayTabs({ curDay, onSelectDay }) {
  return (
    <div className="bg-white border-b border-slate-100 flex no-scrollbar overflow-x-auto sticky top-0 z-10">
      {SS.map((d, i) => (
        <button
          key={i}
          onClick={() => onSelectDay(i)}
          className={`
            px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0
            ${i === curDay
              ? 'text-indigo-600 border-indigo-600'
              : 'text-slate-400 border-transparent hover:text-slate-600'
            }
          `}
          style={{ minWidth: 44 }}
        >
          {d}
        </button>
      ))}
    </div>
  )
}
