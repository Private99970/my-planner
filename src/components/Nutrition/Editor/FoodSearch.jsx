import { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { r0 } from '../../../hooks/useMacro'

const DROPDOWN_MAX_H = 260
const RECENT_KEY = 'np_recentFoods'
const RECENT_MAX = 8

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || [] } catch { return [] }
}
function pushRecent(name) {
  try {
    const list = [name, ...loadRecent().filter(n => n !== name)].slice(0, RECENT_MAX)
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

function rankMatches(allFoods, qNorm) {
  const scored = []
  for (const name of allFoods) {
    const l = norm(name)
    let score
    if (l === qNorm) score = 0
    else if (l.startsWith(qNorm)) score = 1
    else if (l.includes(' ' + qNorm)) score = 2
    else if (l.includes(qNorm)) score = 3
    else continue
    scored.push({ name, score })
  }
  scored.sort((a, b) => a.score - b.score || a.name.length - b.name.length || a.name.localeCompare(b.name))
  return scored.slice(0, 30).map(x => x.name)
}

function Highlight({ text, qNorm }) {
  if (!qNorm) return text
  const idx = norm(text).indexOf(qNorm)
  if (idx < 0) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-indigo-600">{text.slice(idx, idx + qNorm.length)}</span>
      {text.slice(idx + qNorm.length)}
    </>
  )
}

export default function FoodSearch({ catalog, onSelect }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [grams, setGrams] = useState('')
  const [selected, setSelected] = useState(null)
  const [highlight, setHighlight] = useState(0)
  const [rect, setRect] = useState(null)
  const inputRef = useRef(null)
  const gramsRef = useRef(null)

  const allFoods = Object.keys(catalog)
  const q = query.trim()
  const qNorm = norm(q)
  const isEmpty = qNorm.length === 0
  const recent = loadRecent().filter(n => catalog[n])
  const matches = isEmpty
    ? (recent.length > 0 ? recent : [...allFoods].sort((a, b) => a.localeCompare(b)).slice(0, 30))
    : rankMatches(allFoods, qNorm)

  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      if (inputRef.current) setRect(inputRef.current.getBoundingClientRect())
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  const pickFood = (name) => {
    setSelected(name)
    setQuery(name)
    setOpen(false)
    setTimeout(() => gramsRef.current?.focus(), 50)
  }

  const handleAdd = () => {
    let food = selected
    if (!food) {
      const exact = allFoods.find(n => norm(n) === qNorm)
      if (exact) food = exact
    }
    if (!food) { alert('Seleziona un alimento dalla lista.'); return }
    const g = parseFloat(grams)
    if (!g || g <= 0) { alert('Inserisci i grammi.'); return }
    onSelect(food, g)
    pushRecent(food)
    setQuery(''); setGrams(''); setSelected(null)
  }

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { setOpen(true); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, matches.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (open && matches[highlight]) pickFood(matches[highlight]) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  const dropdownStyle = (() => {
    if (!rect) return null
    const spaceBelow = window.innerHeight - rect.bottom
    const flipUp = spaceBelow < DROPDOWN_MAX_H && rect.top > spaceBelow
    return {
      position: 'fixed', left: rect.left, width: rect.width,
      maxHeight: DROPDOWN_MAX_H, zIndex: 60,
      ...(flipUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    }
  })()

  return (
    <div className="flex gap-2 items-center p-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex-wrap">
      <div className="relative flex-1 min-w-36">
        <input
          ref={inputRef}
          className="inp w-full text-[12.5px]"
          placeholder="🔍 Cerca alimento…"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null); setHighlight(0); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {open && dropdownStyle && createPortal(
          <div
            style={dropdownStyle}
            className="bg-white border-2 border-slate-200 rounded-2xl shadow-2xl overflow-y-auto thin-scroll"
          >
            {isEmpty && recent.length > 0 && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recenti</div>
            )}
            {matches.length === 0 ? (
              <div className="px-3 py-3 text-[12px] text-slate-400">Nessun alimento trovato</div>
            ) : matches.map((name, i) => {
              const f = catalog[name]
              return (
                <button
                  key={name}
                  onMouseDown={() => pickFood(name)}
                  onMouseEnter={() => setHighlight(i)}
                  className={`w-full flex justify-between items-center px-3 py-2 text-left text-[12.5px] transition-colors ${i === highlight ? 'bg-indigo-50' : ''}`}
                >
                  <span className="text-slate-800 truncate">
                    <Highlight text={name} qNorm={qNorm} />
                  </span>
                  <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0 tabular-nums">
                    K{r0(f[0])} · C{f[2]} P{f[1]} G{f[3]}
                  </span>
                </button>
              )
            })}
          </div>,
          document.body
        )}
      </div>
      <input
        ref={gramsRef}
        className="inp w-16 text-center text-[12.5px]"
        type="number" min="1" max="9999" placeholder="g"
        value={grams}
        onChange={e => setGrams(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
      />
      <button onClick={handleAdd} className="btn-ind px-3.5 py-2 text-[13px]">＋</button>
    </div>
  )
}
