import { useState, useEffect, useRef, useCallback } from 'react'
import { MEAL_DEFS, GG } from '../../../data/diets'
import { calcDayMacro, kcalTarget, r0 } from '../../../hooks/useMacro'
import EditorMeta from './EditorMeta'
import EditorDayTabs from './EditorDayTabs'
import EditorMeal from './EditorMeal'
import { CopyDayBar } from './CopyControls'

const emptyDay = () => ({ col: [], pra: [], spu: [], cen: [], pos: [] })

export default function EditorPanel({
  open, dietKey, diets, catalog,
  draft, onSave, onDelete, onClose, onSaveDraft, onClearDraft,
}) {
  const [name, setName] = useState('')
  const [targets, setTargets] = useState({ C: '', P: '', G: '' })
  const [days, setDays] = useState(() => Array.from({ length: 7 }, emptyDay))
  const [curDay, setCurDay] = useState(0)
  const [autoSaveMsg, setAutoSaveMsg] = useState('')
  const [isDraft, setIsDraft] = useState(false)
  const autoSaveTimer = useRef(null)

  useEffect(() => {
    if (!open) return
    setCurDay(0); setAutoSaveMsg('')

    if (draft && draft.origKey === dietKey) {
      const ago = Math.round((Date.now() - draft.ts) / 60000)
      const resume = window.confirm(
        `Trovata una bozza${draft.name ? ` di '${draft.name}'` : ''} (${ago < 1 ? 'pochi secondi' : ago + ' min'} fa).\nVuoi continuare da dove hai lasciato?`
      )
      if (resume) {
        setName(draft.name || ''); setTargets(draft.targets || { C: '', P: '', G: '' })
        setDays(draft.days); setIsDraft(true); return
      } else { onClearDraft() }
    }

    if (dietKey && diets[dietKey]) {
      const d = diets[dietKey]
      setName(dietKey); setTargets({ C: d.targets.C, P: d.targets.P, G: d.targets.G })
      setDays(JSON.parse(JSON.stringify(d.days)))
    } else {
      setName(''); setTargets({ C: '', P: '', G: '' })
      setDays(Array.from({ length: 7 }, emptyDay))
    }
    setIsDraft(false)
  }, [open, dietKey]) // eslint-disable-line

  const scheduleAutoSave = useCallback(() => {
    clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      onSaveDraft({
        origKey: dietKey, name,
        targets: { C: parseInt(targets.C)||0, P: parseInt(targets.P)||0, G: parseInt(targets.G)||0 },
        days: JSON.parse(JSON.stringify(days)),
      })
      setIsDraft(true); setAutoSaveMsg('✓ Bozza salvata')
      setTimeout(() => setAutoSaveMsg(''), 3000)
    }, 1500)
  }, [dietKey, name, targets, days, onSaveDraft])

  const handleMetaChange = (field, val) => {
    if (field === 'name') setName(val)
    else setTargets(prev => ({ ...prev, [field]: val }))
    scheduleAutoSave()
  }

  const updateGrams = (mealId, fi, val) => {
    const g = parseFloat(val)
    if (g > 0) {
      setDays(prev => {
        const next = prev.map(d => ({ ...d, [mealId]: [...(d[mealId] || [])] }))
        next[curDay][mealId][fi] = [next[curDay][mealId][fi][0], g]
        return next
      })
      scheduleAutoSave()
    }
  }

  const removeFood = (mealId, fi) => {
    setDays(prev => prev.map((d, di) => di !== curDay ? d : {
      ...d, [mealId]: d[mealId].filter((_, i) => i !== fi)
    }))
    scheduleAutoSave()
  }

  const addFood = (mealId, food, grams) => {
    setDays(prev => prev.map((d, di) => di !== curDay ? d : {
      ...d, [mealId]: [...(d[mealId] || []), [food, grams]]
    }))
    scheduleAutoSave()
  }

  const copyDayTo = (targetDay) => {
    setDays(prev => { const next = [...prev]; next[targetDay] = JSON.parse(JSON.stringify(prev[curDay])); return next })
    scheduleAutoSave()
  }

  const copyMealTo = (sourceMealId, targetDay, targetMealId) => {
    const dstMeal = targetMealId || sourceMealId
    setDays(prev => prev.map((d, di) => di !== targetDay ? d : {
      ...d, [dstMeal]: JSON.parse(JSON.stringify(prev[curDay][sourceMealId] || []))
    }))
    scheduleAutoSave()
  }

  const handleSave = () => {
    if (!name.trim()) { alert('Inserisci un nome per la dieta.'); return }
    const t = { C: parseInt(targets.C)||0, P: parseInt(targets.P)||0, G: parseInt(targets.G)||0 }
    onSave(name.trim(), t, JSON.parse(JSON.stringify(days)))
    clearTimeout(autoSaveTimer.current)
  }

  const handleDelete = () => {
    if (!dietKey || !diets[dietKey]?.custom) return
    if (window.confirm(`Eliminare la dieta "${dietKey}"?`)) onDelete(dietKey)
  }

  const diet = dietKey ? diets[dietKey] : null
  const isCustom = diet?.custom
  const isEditing = !!dietKey

  const dayTot = calcDayMacro(days[curDay] || emptyDay(), catalog, MEAL_DEFS)
  const t = { C: parseInt(targets.C)||0, P: parseInt(targets.P)||0, G: parseInt(targets.G)||0 }
  const ktgt = kcalTarget(t)
  const kd = Math.round(dayTot.k - ktgt)

  return (
    <>
      {open && <div className="panel-overlay" onClick={onClose} />}
      <div className={`panel-slide z-50 ${open ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-5 py-4 flex items-center gap-2.5 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-bold truncate">
              {!isEditing ? '✨ Nuova dieta' : isCustom ? '✏️ Modifica dieta' : '✏️ Modifica copia'}
            </div>
            <div className="text-[10px] text-white/60 h-4">{autoSaveMsg}</div>
          </div>
          {isDraft && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 flex-shrink-0">
              Bozza
            </span>
          )}
          <div className="flex gap-1.5 flex-shrink-0">
            {isCustom && (
              <button onClick={handleDelete} className="btn-ghost bg-red-900/30 border-red-400/40 text-[12px]">🗑</button>
            )}
            <button onClick={onClose} className="btn-ghost text-[12px]">✕</button>
            <button onClick={handleSave} className="px-3 py-1.5 rounded-xl bg-white/20 text-white text-[12px] font-bold border border-white/30 hover:bg-white/30 transition-colors">
              💾 Salva
            </button>
          </div>
        </div>

        <div className="flex-shrink-0"><EditorMeta name={name} targets={targets} onChange={handleMetaChange} /></div>
        <div className="flex-shrink-0"><EditorDayTabs days={days} curDay={curDay} onSelectDay={setCurDay} /></div>

        {/* Day macro summary */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kcal</span>
              <strong className="text-[17px]" style={{ color: Math.abs(kd) < 150 ? '#0d9488' : '#dc2626' }}>{r0(dayTot.k)}</strong>
              <span className="text-[12px] text-slate-400">/ ~{ktgt}</span>
              {t.C > 0 && (
                <span className="text-[11px] font-bold ml-1" style={{ color: Math.abs(kd) < 150 ? '#0d9488' : '#dc2626' }}>
                  {kd > 0 ? '+' : ''}{kd}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Giorno {curDay + 1}/7</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: 'C', label: 'Carbo', val: dayTot.c, tgt: t.C, color: '#d97706', bg: '#fef3c7' },
              { k: 'P', label: 'Proteine', val: dayTot.p, tgt: t.P, color: '#0d9488', bg: '#ccfbf1' },
              { k: 'G', label: 'Grassi', val: dayTot.f, tgt: t.G, color: '#dc2626', bg: '#fee2e2' },
            ].map(m => {
              const pct = m.tgt > 0 ? Math.min(100, Math.round((m.val / m.tgt) * 100)) : 0
              return (
                <div key={m.k} className="rounded-xl px-2.5 py-2 bg-white border border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: m.color }}>{m.label}</span>
                    <span className="text-[10px] text-slate-400">{pct}%</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-[15px] font-extrabold" style={{ color: m.color }}>{r0(m.val)}</span>
                    <span className="text-[11px] text-slate-400">/ {m.tgt}g</span>
                  </div>
                  <div className="h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: m.bg }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: m.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex-shrink-0"><CopyDayBar curDay={curDay} onCopyTo={copyDayTo} /></div>

        <div className="flex-1 overflow-y-auto thin-scroll bg-slate-50">
          <div className="p-4 flex flex-col gap-3">
            {MEAL_DEFS.map(md => (
              <EditorMeal
                key={md.id}
                meal={md}
                foods={(days[curDay] || emptyDay())[md.id] || []}
                curDay={curDay}
                catalog={catalog}
                onUpdateGrams={updateGrams}
                onRemoveFood={removeFood}
                onAddFood={addFood}
                onCopyMealTo={copyMealTo}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
