import { useState, useRef, useCallback } from 'react'
import { useDiets } from '../../hooks/useDiets'
import { useCatalog } from '../../hooks/useCatalog'
import DayTabs from './DayTabs'
import DietPills from './DietPills'
import MacroBanner from './MacroBanner'
import MealCard from './MealCard'
import EditorPanel from './Editor/EditorPanel'
import CatalogPanel from './Catalog/CatalogPanel'
import { printDiet } from './printDiet'
import { MEAL_DEFS, GG } from '../../data/diets'

export default function NutritionSection({ userId }) {
  const {
    diets, dietNames, saveDiet, deleteDiet,
    draft, saveDraft, clearDraft,
    exportDiets, importDiets, loading: dietsLoading,
  } = useDiets(userId)
  const catalogState = useCatalog(userId)

  const [curDietIdx, setCurDietIdx] = useState(0)
  const [curDay, setCurDay] = useState(0)
  const [openMeal, setOpenMeal] = useState(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorDietKey, setEditorDietKey] = useState(null)
  const [catalogOpen, setCatalogOpen] = useState(false)

  const touchStartX = useRef(null)

  const safeIdx = Math.min(curDietIdx, dietNames.length - 1)
  const curDietName = dietNames[safeIdx] || dietNames[0]
  const curDiet = diets[curDietName]
  const curDayData = curDiet?.days?.[curDay] || {}

  const openEditor = useCallback((dietKey) => {
    setEditorDietKey(dietKey ?? null)
    setEditorOpen(true)
  }, [])

  const closeEditor = useCallback(() => {
    setEditorOpen(false)
    setEditorDietKey(null)
  }, [])

  const handleSaveDiet = useCallback((name, targets, days) => {
    saveDiet(name, targets, days)
    clearDraft()
    closeEditor()
    setTimeout(() => {
      const idx = Object.keys({ ...diets, [name]: {} }).indexOf(name)
      if (idx >= 0) setCurDietIdx(idx)
    }, 0)
  }, [saveDiet, clearDraft, closeEditor, diets])

  const handleDeleteDiet = useCallback((name) => {
    deleteDiet(name)
    setCurDietIdx(0)
    closeEditor()
  }, [deleteDiet, closeEditor])

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) > 50) {
      setCurDay(prev => {
        const next = dx < 0 ? Math.min(6, prev + 1) : Math.max(0, prev - 1)
        if (next !== prev) setOpenMeal(null)
        return next
      })
    }
  }

  if (dietsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#7d8590] text-sm">Caricamento diete…</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">

      {/* Selettore dieta + azioni */}
      <div className="bg-[#161b22] border-b border-[#21262d] px-4 pt-3 pb-2">
        <DietPills
          dietNames={dietNames}
          diets={diets}
          curDietIdx={safeIdx}
          onSelectDiet={(i) => { setCurDietIdx(i); setCurDay(0); setOpenMeal(null) }}
          onEditDiet={openEditor}
          onNewDiet={() => openEditor(null)}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setCatalogOpen(true)}
            className="text-[11px] font-semibold text-[#7d8590] border border-[#30363d] rounded-lg px-2.5 py-1 hover:bg-[#21262d] transition-colors"
          >
            📋 Catalogo
          </button>
          <button
            onClick={() => curDiet && printDiet(curDietName, curDiet, catalogState.catalog)}
            disabled={!curDiet}
            className="text-[11px] font-semibold text-[#7d8590] border border-[#30363d] rounded-lg px-2.5 py-1 hover:bg-[#21262d] transition-colors disabled:opacity-40"
          >
            🖨️ Stampa
          </button>
          <button
            onClick={exportDiets}
            className="text-[11px] font-semibold text-[#7d8590] border border-[#30363d] rounded-lg px-2.5 py-1 hover:bg-[#21262d] transition-colors"
          >
            📥 Esporta
          </button>
          <label className="text-[11px] font-semibold text-[#7d8590] border border-[#30363d] rounded-lg px-2.5 py-1 hover:bg-[#21262d] transition-colors cursor-pointer">
            📤 Importa
            <input
              type="file" accept=".json" className="hidden"
              onChange={e => {
                const file = e.target.files[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = ev => {
                  const res = importDiets(ev.target.result)
                  if (res.ok) alert(`Importate ${res.count} diete.`)
                  else alert(`Errore: ${res.error}`)
                }
                reader.readAsText(file)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      {!curDiet ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="text-5xl mb-4">🥗</div>
          <h2 className="text-lg font-bold text-[#e6edf3] mb-1">Nessuna dieta ancora</h2>
          <p className="text-sm text-[#7d8590] mb-6">Crea la tua prima dieta oppure importane una.</p>
          <button onClick={() => openEditor(null)} className="btn-ind">＋ Crea la tua prima dieta</button>
        </div>
      ) : (
        <>
          <DayTabs curDay={curDay} onSelectDay={(i) => { setCurDay(i); setOpenMeal(null) }} />

          <main
            className="px-4 pt-4"
            style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <MacroBanner
              day={curDayData}
              targets={curDiet.targets}
              dayName={GG[curDay]}
              catalog={catalogState.catalog}
            />
            <div className="flex flex-col gap-2">
              {MEAL_DEFS.map(md => (
                <MealCard
                  key={md.id}
                  meal={md}
                  foods={curDayData[md.id] || []}
                  isOpen={openMeal === md.id}
                  onToggle={() => setOpenMeal(prev => prev === md.id ? null : md.id)}
                  catalog={catalogState.catalog}
                />
              ))}
            </div>
          </main>
        </>
      )}

      <EditorPanel
        open={editorOpen}
        dietKey={editorDietKey}
        diets={diets}
        catalog={catalogState.catalog}
        draft={draft}
        onSave={handleSaveDiet}
        onDelete={handleDeleteDiet}
        onClose={closeEditor}
        onSaveDraft={saveDraft}
        onClearDraft={clearDraft}
      />

      <CatalogPanel
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        {...catalogState}
      />
    </div>
  )
}
