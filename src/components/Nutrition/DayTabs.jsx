import { SS } from '../../data/diets'

export default function DayTabs({ curDay, onSelectDay }) {
  return (
    <div className="bg-[#161b22] border-b border-[#21262d] flex no-scrollbar overflow-x-auto sticky top-0 z-10">
      {SS.map((d, i) => (
        <button
          key={i}
          onClick={() => onSelectDay(i)}
          className={`
            px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0
            ${i === curDay
              ? 'text-[#58a6ff] border-[#58a6ff]'
              : 'text-[#7d8590] border-transparent hover:text-[#e6edf3]'
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
