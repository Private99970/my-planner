import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { BASE_CAT } from '../data/catalog'

/**
 * Gestisce il catalogo alimenti personalizzati su Supabase.
 * I cibi di base (BASE_CAT) restano hardcoded nel codice.
 *
 * Schema tabella custom_foods:
 *   name text, kcal numeric, protein numeric, carbs numeric, fat numeric
 *
 * L'array locale per ogni cibo è [kcal, protein, carbs, fat] (ordine storico)
 */
export function useCatalog(userId) {
  const [customFoods, setCustomFoods] = useState({})

  // Carica i cibi custom dell'utente da Supabase al mount
  useEffect(() => {
    if (!userId) return
    supabase
      .from('custom_foods')
      .select('name, kcal, protein, carbs, fat')
      .then(({ data, error }) => {
        if (error) {
          console.error('useCatalog load:', error)
          return
        }
        const obj = {}
        for (const row of data) {
          obj[row.name] = [row.kcal, row.protein, row.carbs, row.fat]
        }
        setCustomFoods(obj)
      })
  }, [userId])

  const catalog = { ...BASE_CAT, ...customFoods }

  // Aggiunge un nuovo alimento (o sovrascrive se esiste già con lo stesso nome)
  const addFood = useCallback(async (name, kcal, prot, carbs, fat) => {
    setCustomFoods(prev => ({ ...prev, [name]: [kcal, prot, carbs, fat] }))
    const { error } = await supabase
      .from('custom_foods')
      .upsert(
        { user_id: userId, name, kcal, protein: prot, carbs, fat },
        { onConflict: 'user_id,name' }
      )
    if (error) console.error('addFood:', error)
  }, [userId])

  // Modifica un alimento esistente (gestisce anche il cambio di nome)
  const editFood = useCallback(async (oldName, name, kcal, prot, carbs, fat) => {
    setCustomFoods(prev => {
      const next = { ...prev }
      if (oldName !== name) delete next[oldName]
      next[name] = [kcal, prot, carbs, fat]
      return next
    })
    if (oldName !== name) {
      // Elimina la vecchia riga, ne inserisce una nuova
      const { error: delError } = await supabase
        .from('custom_foods')
        .delete()
        .eq('user_id', userId)
        .eq('name', oldName)
      if (delError) console.error('editFood delete:', delError)
    }
    const { error } = await supabase
      .from('custom_foods')
      .upsert(
        { user_id: userId, name, kcal, protein: prot, carbs, fat },
        { onConflict: 'user_id,name' }
      )
    if (error) console.error('editFood upsert:', error)
  }, [userId])

  // Elimina un alimento dal catalogo custom
  const deleteFood = useCallback(async (name) => {
    setCustomFoods(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    const { error } = await supabase
      .from('custom_foods')
      .delete()
      .eq('user_id', userId)
      .eq('name', name)
    if (error) console.error('deleteFood:', error)
  }, [userId])

  return { catalog, customFoods, baseFoods: BASE_CAT, addFood, editFood, deleteFood }
}
