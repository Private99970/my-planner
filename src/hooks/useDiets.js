import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { BASE_DIETS } from '../data/diets'

const LS_DRAFT = 'np_draft_v2'

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(LS_DRAFT) || 'null') }
  catch { return null }
}

function buildDiets(custom) {
  const result = {}
  for (const [k, v] of Object.entries(BASE_DIETS)) result[k] = { ...v, custom: false }
  for (const [k, v] of Object.entries(custom)) result[k] = { ...v, custom: true }
  return result
}

export function useDiets(userId) {
  const [customDiets, setCustomDiets] = useState({})
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState(loadDraft)

  // Carica le diete dell'utente da Supabase al mount
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('diets')
      .select('name, targets, days')
      .then(({ data, error }) => {
        if (error) {
          console.error('useDiets load:', error)
        } else {
          const obj = {}
          for (const row of data) {
            obj[row.name] = { targets: row.targets, days: row.days, custom: true }
          }
          setCustomDiets(obj)
        }
        setLoading(false)
      })
  }, [userId])

  const diets = buildDiets(customDiets)
  const dietNames = Object.keys(diets)

  // Salva o aggiorna una dieta (upsert per nome)
  // Aggiornamento ottimistico: lo stato locale è aggiornato subito
  const saveDiet = useCallback(async (name, targets, days) => {
    setCustomDiets(prev => ({ ...prev, [name]: { targets, days, custom: true } }))
    const { error } = await supabase
      .from('diets')
      .upsert(
        { user_id: userId, name, targets, days, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,name' }
      )
    if (error) console.error('saveDiet:', error)
  }, [userId])

  // Elimina una dieta
  const deleteDiet = useCallback(async (name) => {
    setCustomDiets(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    const { error } = await supabase
      .from('diets')
      .delete()
      .eq('user_id', userId)
      .eq('name', name)
    if (error) console.error('deleteDiet:', error)
  }, [userId])

  // Draft: resta in localStorage (bozza temporanea editor, non sincronizzata)
  const saveDraft = useCallback((data) => {
    const withTs = { ...data, ts: Date.now() }
    setDraft(withTs)
    localStorage.setItem(LS_DRAFT, JSON.stringify(withTs))
  }, [])

  const clearDraft = useCallback(() => {
    setDraft(null)
    localStorage.removeItem(LS_DRAFT)
  }, [])

  // Esporta tutte le diete personali in un file JSON (backup locale)
  const exportDiets = useCallback(() => {
    const payload = {
      type: 'nutrition-planner-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      diets: customDiets,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diete-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    return Object.keys(customDiets).length
  }, [customDiets])

  // Importa diete da un file JSON: aggiunta ottimistica + upsert su Supabase
  const importDiets = useCallback((jsonText) => {
    let parsed
    try { parsed = JSON.parse(jsonText) } catch { return { ok: false, error: 'File non valido' } }
    const incoming = parsed && parsed.diets ? parsed.diets : parsed
    if (!incoming || typeof incoming !== 'object') return { ok: false, error: 'Formato non riconosciuto' }
    const valid = Object.entries(incoming).filter(([, v]) => v && v.targets && v.days)
    if (valid.length === 0) return { ok: false, error: 'Nessuna dieta valida nel file' }

    // Aggiornamento ottimistico
    setCustomDiets(prev => {
      const next = { ...prev }
      for (const [k, v] of valid) next[k] = { targets: v.targets, days: v.days, custom: true }
      return next
    })

    // Sync su Supabase in background
    const rows = valid.map(([name, v]) => ({
      user_id: userId,
      name,
      targets: v.targets,
      days: v.days,
      updated_at: new Date().toISOString(),
    }))
    supabase
      .from('diets')
      .upsert(rows, { onConflict: 'user_id,name' })
      .then(({ error }) => { if (error) console.error('importDiets:', error) })

    return { ok: true, count: valid.length }
  }, [userId])

  return { diets, dietNames, saveDiet, deleteDiet, draft, saveDraft, clearDraft, exportDiets, importDiets, loading }
}
