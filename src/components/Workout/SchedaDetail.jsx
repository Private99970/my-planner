import { useState } from 'react'
import { Plus, ChevronRight, Trash2 } from 'lucide-react'
import { progressIndicator, best1RM, formatBlocchi } from '../../hooks/useWorkout'

function ProgressBadge({ direction }) {
  if (!direction) return null
  const map = {
    up:     ['↑', 'bg-[#3fb950]/15 text-[#3fb950]'],
    down:   ['↓', 'bg-[#f85149]/15 text-[#f85149]'],
    stable: ['→', 'bg-[#30363d] text-[#7d8590]'],
  }
  const [icon, cls] = map[direction]
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>{icon}</span>
}

export default function SchedaDetail({ scheda, schede, onEsercizioClick, onAddEsercizio, onAddGiorno, onDuplicaSettimana, onDeleteSettimana }) {
  const [settimanaNum, setSettimanaNum] = useState(scheda.settimane[0]?.numero ?? 1)
  const settimana = scheda.settimane.find(s => s.numero === settimanaNum) ?? scheda.settimane[0]

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-8">

      {/* Selettore settimane */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {scheda.settimane.map(s => (
          <button
            key={s.numero}
            onClick={() => setSettimanaNum(s.numero)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              s.numero === settimanaNum
                ? 'bg-[#58a6ff] text-[#0d1117]'
                : 'bg-[#161b22] border border-[#30363d] text-[#7d8590]'
            }`}
          >
            Sett. {s.numero}
          </button>
        ))}
        <button
          onClick={() => onDuplicaSettimana(settimanaNum)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm border border-dashed border-[#30363d] text-[#7d8590]"
        >
          + Duplica
        </button>
        {scheda.settimane.length > 1 && (
          <button
            onClick={() => {
              if (window.confirm(`Eliminare Settimana ${settimanaNum}?`)) {
                const remaining = scheda.settimane.filter(s => s.numero !== settimanaNum)
                setSettimanaNum(remaining[remaining.length - 1].numero)
                onDeleteSettimana(settimanaNum)
              }
            }}
            className="flex-shrink-0 p-1.5 rounded-full text-[#30363d] hover:text-[#f85149] transition-colors"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Sedute */}
      {settimana?.sedute.map(seduta => (
        <div key={seduta.numero} className="bg-[#161b22] rounded-xl border border-[#21262d] overflow-hidden">
          <div className="px-4 py-2.5 bg-[#0d1117] border-b border-[#21262d] flex justify-between items-center">
            <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-wide">Giorno {seduta.numero}</p>
          </div>
          <div className="divide-y divide-[#21262d]">
            {seduta.esercizi.map(es => {
              const prog = progressIndicator(schede, es.nome)
              const hasDati = es.serieEseguite?.length > 0
              return (
                <button
                  key={es.id}
                  onClick={() => onEsercizioClick(settimanaNum, seduta.numero, es.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left active:bg-[#21262d]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#e6edf3]">{es.nome || <span className="text-[#30363d]">Nuovo esercizio</span>}</p>
                    <p className="text-xs text-[#7d8590] mt-0.5">
                      {formatBlocchi(es)} · {es.recuperoSec}s
                      {hasDati && (
                        <span className="text-[#58a6ff] ml-1">
                          · {best1RM(es.serieEseguite).toFixed(1)} kg 1RM
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBadge direction={prog} />
                    <ChevronRight size={14} className="text-[#30363d]" />
                  </div>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => onAddEsercizio(settimanaNum, seduta.numero)}
            className="w-full px-4 py-3 flex items-center gap-2 text-xs text-[#58a6ff] font-semibold border-t border-[#21262d]"
          >
            <Plus size={14} /> Aggiungi esercizio
          </button>
        </div>
      ))}

      {/* Aggiungi giorno */}
      <button
        onClick={() => onAddGiorno(settimanaNum)}
        className="w-full py-3 rounded-xl border border-dashed border-[#30363d] text-sm text-[#7d8590] flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Aggiungi giorno
      </button>
    </div>
  )
}
