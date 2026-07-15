import { SS, GG } from '../../../data/diets'

export function CopyDayBar({ curDay, onCopyTo }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100 no-scrollbar overflow-x-auto">
      <span className="text-[11.5px] font-semibold text-blue-700 whitespace-nowrap flex-shrink-0">Copia in:</span>
      {SS.map((d, i) => i !== curDay && (
        <button
          key={i}
          onClick={() => {
            if (window.confirm(`Copia ${GG[curDay]} → ${GG[i]}? Il giorno di destinazione verrà sovrascritto.`)) {
              onCopyTo(i)
            }
          }}
          className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 border border-blue-200 text-blue-700 hover:bg-blue-200 transition-colors"
        >
          {d}
        </button>
      ))}
    </div>
  )
}
