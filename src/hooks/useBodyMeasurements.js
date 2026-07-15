import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export const MEASUREMENT_FIELDS = [
  { key: 'peso',     label: 'Peso',      unit: 'kg', group: 'peso' },
  { key: 'collo',    label: 'Collo',     unit: 'cm', group: 'circonf' },
  { key: 'spalle',   label: 'Spalle',    unit: 'cm', group: 'circonf' },
  { key: 'petto',    label: 'Petto',     unit: 'cm', group: 'circonf' },
  { key: 'vita',     label: 'Vita',      unit: 'cm', group: 'circonf' },
  { key: 'fianchi',  label: 'Fianchi',   unit: 'cm', group: 'circonf' },
  { key: 'coscia',   label: 'Coscia',    unit: 'cm', group: 'circonf' },
  { key: 'polpaccio',label: 'Polpaccio', unit: 'cm', group: 'circonf' },
  { key: 'braccio',  label: 'Braccio',   unit: 'cm', group: 'circonf' },
]

export function useBodyMeasurements(userId) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setRecords(data || [])
        else console.error('useBodyMeasurements load:', error)
        setLoading(false)
      })
  }, [userId])

  const addRecord = useCallback(async (values) => {
    const payload = { ...values, user_id: userId }
    const tempId = crypto.randomUUID()
    const tempRecord = { id: tempId, ...payload, created_at: new Date().toISOString() }
    setRecords(prev => [tempRecord, ...prev].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at)))

    const { data, error } = await supabase
      .from('body_measurements')
      .insert(payload)
      .select()
      .single()

    if (!error && data) {
      setRecords(prev => prev.map(r => r.id === tempId ? data : r))
    } else {
      console.error('addRecord:', error)
      setRecords(prev => prev.filter(r => r.id !== tempId))
    }
  }, [userId])

  const updateRecord = useCallback(async (id, values) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...values } : r))
    const { error } = await supabase
      .from('body_measurements')
      .update(values)
      .eq('id', id)
      .eq('user_id', userId)
    if (error) console.error('updateRecord:', error)
  }, [userId])

  const deleteRecord = useCallback(async (id) => {
    setRecords(prev => prev.filter(r => r.id !== id))
    const { error } = await supabase
      .from('body_measurements')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) console.error('deleteRecord:', error)
  }, [userId])

  return { records, loading, addRecord, updateRecord, deleteRecord }
}
