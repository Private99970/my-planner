import { useState, useMemo, useEffect } from 'react'
import { MEAL_DEFS } from '../../data/diets'

const MEAL_IDS = MEAL_DEFS.map(m => m.id)

function fmt(g) {
  if (g >= 1000) return (g / 1000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',') + ' kg'
  return Math.round(g) + ' g'
}

// Raggruppa gli alimenti per categoria in base ai macro dominanti del catalogo
function categoria(name, catalog) {
  const f = catalog[name]
  if (!f) return 'Altro'
  const [, p, c, fat] = f
  if (p >= 10 && p >= c) return 'Proteici'
  if (c >= 15) return 'Cereali e carboidrati'
  if (fat >= 40) return 'Condimenti ed extra'
  return 'Frutta, verdura e altro'
}

const CAT_ORDER = ['Proteici', 'Cereali e carboidrati', 'Frutta, verdura e altro', 'Condimenti ed extra', 'Altro']

export default function ShoppingListPanel({ open, onClose, dietName, diet, catalog }) {
  const [weeks, setWeeks] = useState(2)
  const [checked, setChecked] = useState({})

  const storageKey = `np_spesa_check_${dietName}`

  // Carica gli spuntati salvati quando cambia dieta / apertura
  useEffect(() => {
    if (!open) return
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
      setChecked(saved)
    } catch { setChecked({}) }
  }, [open, storageKey])

  const toggle = (name) => {
    setChecked(prev => {
      const next = { ...prev, [name]: !prev[name] }
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }

  const resetChecks = () => {
    setChecked({})
    localStorage.removeItem(storageKey)
  }

  // Somma le quantità di tutti gli alimenti su tutti i giorni, × settimane
  const grouped = useMemo(() => {
    const tot = {}
    for (const day of (diet?.days || [])) {
      for (const mid of MEAL_IDS) {
        for (const [name, grams] of (day[mid] || [])) {
          tot[name] = (tot[name] || 0) + grams
        }
      }
    }
    const groups = {}
    for (const [name, g] of Object.entries(tot)) {
      const cat = categoria(name, catalog)
      if (!groups[cat]) groups[cat] = []
      groups[cat].push({ name, grams: g * weeks })
    }
    for (const cat of Object.keys(groups)) groups[cat].sort((a, b) => b.grams - a.grams)
    return groups
  }, [diet, catalog, weeks])

  const allItems = Object.values(grouped).flat()
  const doneCount = allItems.filter(i => checked[i.name]).length

  return (
    <>
      {open && <div className="panel-overlay" onClick={onClose} />}
      <div className={`panel-slide z-50 ${open ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="bg-[#161b22] text-[#e6edf3] px-5 py-4 flex items-center gap-3 flex-shrink-0 border-b border-[#21262d]">
          <div className="flex-1">
            <div className="text-[15px] font-bold">🛒 Lista della spesa</div>
            <div className="text-[10px] text-[#7d8590]">{dietName} · {doneCount}/{allItems.length} presi</div>
          </div>
          <button onClick={onClose} className="text-[#7d8590] border border-[#30363d] rounded-lg px-3 py-1 text-[12px]">✕</button>
        </div>

        {/* Selettore settimane */}
        <div className="px-4 py-3 border-b border-[#21262d] flex-shrink-0 flex items-center gap-2">
          <span className="text-[12px] text-[#7d8590] font-semibold">Settimane:</span>
          {[1, 2, 3, 4].map(w => (
            <button
              key={w}
              onClick={() => setWeeks(w)}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                weeks === w ? 'bg-[#58a6ff] text-[#0d1117]' : 'bg-[#0d1117] border border-[#30363d] text-[#7d8590]'
              }`}
            >
              {w}
            </button>
          ))}
          <button onClick={resetChecks} className="ml-auto text-[11px] text-[#7d8590] underline">Azzera</button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto thin-scroll p-4">
          {CAT_ORDER.filter(c => grouped[c]?.length).map(cat => (
            <div key={cat} className="mb-4">
              <h3 className="text-[11px] font-bold text-[#7d8590] uppercase tracking-wide mb-2">{cat}</h3>
              <div className="flex flex-col gap-1.5">
                {grouped[cat].map(({ name, grams }) => {
                  const isDone = !!checked[name]
                  return (
                    <button
                      key={name}
                      onClick={() => toggle(name)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                        isDone
                          ? 'bg-[#0d1117] border-[#21262d] opacity-50'
                          : 'bg-[#161b22] border-[#21262d]'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 text-[11px] ${
                        isDone ? 'bg-[#3fb950] border-[#3fb950] text-[#0d1117]' : 'border-[#30363d] text-transparent'
                      }`}>✓</span>
                      <span className={`flex-1 text-sm ${isDone ? 'line-through text-[#7d8590]' : 'text-[#e6edf3]'}`}>{name}</span>
                      <span className={`text-sm font-bold ${isDone ? 'text-[#7d8590]' : 'text-[#58a6ff]'}`}>{fmt(grams)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {allItems.length === 0 && (
            <p className="text-center text-[#7d8590] text-sm py-8">Nessun alimento nella dieta selezionata.</p>
          )}
        </div>
      </div>
    </>
  )
}
