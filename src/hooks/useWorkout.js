import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export const emptyExercise = () => ({
  id: Date.now() + Math.random(),
  nome: '',
  serieTarget: 3,
  repTarget: 8,
  recuperoSec: 90,
  note: '',
  serieEseguite: [],
})

const emptyScheda = (nome) => ({
  id: crypto.randomUUID(),
  nome: nome || 'Nuova Scheda',
  createdAt: new Date().toISOString(),
  settimane: [{ numero: 1, sedute: [{ numero: 1, esercizi: [] }] }],
})

/** Stima 1RM con formula di Epley: peso × (1 + reps/30) */
export function epley1RM(peso, reps) {
  const p = parseFloat(peso) || 0
  const r = parseInt(reps) || 0
  return p > 0 && r > 0 ? p * (1 + r / 30) : 0
}

/** Calcola la migliore stima 1RM da un array di serieEseguite */
export function best1RM(serieEseguite) {
  if (!serieEseguite?.length) return 0
  return Math.max(...serieEseguite.map(s => epley1RM(s.peso, s.reps)))
}

/**
 * Indicatore di progressione per un dato nome esercizio su tutte le schede.
 * Restituisce 'up' | 'down' | 'stable' | null (se meno di 2 sedute con dati)
 */
export function progressIndicator(schede, nomeEsercizio) {
  const records = []
  for (const scheda of schede) {
    for (const sett of scheda.settimane) {
      for (const seduta of sett.sedute) {
        const es = seduta.esercizi.find(e => e.nome === nomeEsercizio)
        if (es?.serieEseguite?.length) {
          const rm = best1RM(es.serieEseguite)
          if (rm > 0) records.push({ key: sett.numero * 100 + seduta.numero, rm })
        }
      }
    }
  }
  if (records.length < 2) return null
  records.sort((a, b) => a.key - b.key)
  const last = records[records.length - 1].rm
  const prev = records[records.length - 2].rm
  const delta = (last - prev) / prev
  if (delta > 0.01)  return 'up'
  if (delta < -0.01) return 'down'
  return 'stable'
}

export function useWorkout(userId) {
  const [schede, setSchede] = useState([])
  const [mobilita, setMobilita] = useState([])
  const [stretching, setStretching] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      supabase.from('schede').select('id, nome, settimane, created_at').eq('user_id', userId).order('created_at'),
      supabase.from('workout_settings').select('mobilita, stretching').eq('user_id', userId).single(),
    ]).then(([schedeRes, settingsRes]) => {
      if (!schedeRes.error)
        setSchede(schedeRes.data.map(r => ({ id: r.id, nome: r.nome, createdAt: r.created_at, settimane: r.settimane })))
      if (!settingsRes.error && settingsRes.data) {
        setMobilita(settingsRes.data.mobilita || [])
        setStretching(settingsRes.data.stretching || [])
      }
      setLoading(false)
    })
  }, [userId])

  const syncScheda = useCallback(async (schedaId, newSchede) => {
    const s = newSchede.find(s => s.id === schedaId)
    if (!s) return
    const { error } = await supabase.from('schede').upsert(
      { id: s.id, user_id: userId, nome: s.nome, settimane: s.settimane, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    if (error) console.error('syncScheda:', error)
  }, [userId])

  const syncSettings = useCallback(async (newMob, newStr) => {
    const { error } = await supabase.from('workout_settings').upsert(
      { user_id: userId, mobilita: newMob, stretching: newStr },
      { onConflict: 'user_id' }
    )
    if (error) console.error('syncSettings:', error)
  }, [userId])

  const createScheda = useCallback(async (nome) => {
    const s = emptyScheda(nome)
    setSchede(prev => [...prev, s])
    await supabase.from('schede').insert({ id: s.id, user_id: userId, nome: s.nome, settimane: s.settimane })
    return s.id
  }, [userId])

  const deleteScheda = useCallback(async (id) => {
    setSchede(prev => prev.filter(s => s.id !== id))
    await supabase.from('schede').delete().eq('id', id).eq('user_id', userId)
  }, [userId])

  const updateScheda = useCallback((schedaId, updaterFn) => {
    setSchede(prev => {
      const next = prev.map(s => s.id === schedaId ? updaterFn(s) : s)
      syncScheda(schedaId, next)
      return next
    })
  }, [syncScheda])

  const addGiorno = useCallback((schedaId, settimanaNum) => {
    updateScheda(schedaId, s => ({
      ...s,
      settimane: s.settimane.map(sett => {
        if (sett.numero !== settimanaNum) return sett
        const nextNum = Math.max(...sett.sedute.map(sd => sd.numero)) + 1
        return { ...sett, sedute: [...sett.sedute, { numero: nextNum, esercizi: [] }] }
      }),
    }))
  }, [updateScheda])

  const addEsercizio = useCallback((schedaId, settimanaNum, sedutaNum) => {
    updateScheda(schedaId, s => ({
      ...s,
      settimane: s.settimane.map(sett => {
        if (sett.numero !== settimanaNum) return sett
        return {
          ...sett,
          sedute: sett.sedute.map(sd => {
            if (sd.numero !== sedutaNum) return sd
            return { ...sd, esercizi: [...sd.esercizi, emptyExercise()] }
          }),
        }
      }),
    }))
  }, [updateScheda])

  const updateEsercizio = useCallback((schedaId, settimanaNum, sedutaNum, esId, updates) => {
    updateScheda(schedaId, s => ({
      ...s,
      settimane: s.settimane.map(sett => {
        if (sett.numero !== settimanaNum) return sett
        return {
          ...sett,
          sedute: sett.sedute.map(sd => {
            if (sd.numero !== sedutaNum) return sd
            return { ...sd, esercizi: sd.esercizi.map(e => e.id === esId ? { ...e, ...updates } : e) }
          }),
        }
      }),
    }))
  }, [updateScheda])

  const deleteEsercizio = useCallback((schedaId, settimanaNum, sedutaNum, esId) => {
    updateScheda(schedaId, s => ({
      ...s,
      settimane: s.settimane.map(sett => {
        if (sett.numero !== settimanaNum) return sett
        return {
          ...sett,
          sedute: sett.sedute.map(sd => {
            if (sd.numero !== sedutaNum) return sd
            return { ...sd, esercizi: sd.esercizi.filter(e => e.id !== esId) }
          }),
        }
      }),
    }))
  }, [updateScheda])

  const deleteSettimana = useCallback((schedaId, settimanaNum) => {
    updateScheda(schedaId, s => ({
      ...s,
      settimane: s.settimane.filter(sett => sett.numero !== settimanaNum),
    }))
  }, [updateScheda])

  const duplicateSettimana = useCallback((schedaId, fromNum) => {
    let newNum = 2
    setSchede(prev => {
      const next = prev.map(s => {
        if (s.id !== schedaId) return s
        const src = s.settimane.find(sett => sett.numero === fromNum)
        if (!src) return s
        newNum = Math.max(...s.settimane.map(sett => sett.numero)) + 1
        const newSett = {
          numero: newNum,
          sedute: src.sedute.map(sd => ({
            numero: sd.numero,
            esercizi: sd.esercizi.map(e => ({ ...e, id: Date.now() + Math.random(), serieEseguite: [] })),
          })),
        }
        return { ...s, settimane: [...s.settimane, newSett] }
      })
      syncScheda(schedaId, next)
      return next
    })
    return newNum
  }, [syncScheda])

  const addMobilita = useCallback((nome, quantita) => {
    setMobilita(prev => { const next = [...prev, { nome, quantita }]; syncSettings(next, stretching); return next })
  }, [stretching, syncSettings])

  const removeMobilita = useCallback((i) => {
    setMobilita(prev => { const next = prev.filter((_, idx) => idx !== i); syncSettings(next, stretching); return next })
  }, [stretching, syncSettings])

  const addStretching = useCallback((nome, quantita) => {
    setStretching(prev => { const next = [...prev, { nome, quantita }]; syncSettings(mobilita, next); return next })
  }, [mobilita, syncSettings])

  const removeStretching = useCallback((i) => {
    setStretching(prev => { const next = prev.filter((_, idx) => idx !== i); syncSettings(mobilita, next); return next })
  }, [mobilita, syncSettings])

  return {
    schede, mobilita, stretching, loading,
    createScheda, deleteScheda,
    addGiorno, addEsercizio, updateEsercizio, deleteEsercizio, duplicateSettimana, deleteSettimana,
    addMobilita, removeMobilita, addStretching, removeStretching,
  }
}
