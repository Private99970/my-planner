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
                    ? 'bg-[#58a6ff] border-[#58a6ff] text-[#0d1117]'
                    : 'bg-[#30363d] border-[#30363d] text-[#e6edf3]'
                  : isCustom
                    ? 'border-[#58a6ff]/40 text-[#58a6ff] hover:bg-[#58a6ff]/10'
                    : 'border-[#30363d] text-[#7d8590] hover:bg-[#21262d]'
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
                    ? 'bg-[#388bfd] border-[#58a6ff] text-[#0d1117]'
                    : 'bg-[#21262d] border-[#30363d] text-[#e6edf3]'
                  : isCustom
                    ? 'border-[#58a6ff]/40 text-[#58a6ff]/70 hover:bg-[#58a6ff]/10'
                    : 'border-[#30363d] text-[#7d8590] hover:bg-[#21262d]'
                }
              `}
              style={{ borderRadius: '0 999px 999px 0', borderLeft: '1px solid rgba(255,255,255,0.05)' }}
              title="Modifica"
            >
              ✎
            </button>
          </div>
        )
      })}
      <button
        onClick={onNewDiet}
        className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#7d8590] border border-dashed border-[#30363d] hover:border-[#58a6ff] hover:text-[#58a6ff] transition-all whitespace-nowrap"
      >
        ＋ Nuova
      </button>
    </div>
  )
}
