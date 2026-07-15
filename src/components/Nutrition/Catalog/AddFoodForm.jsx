import { useState } from 'react'

export default function AddFoodForm({ catalog, onAdd, editingFood, onCancelEdit, onSaveEdit }) {
  const [name, setName] = useState(editingFood?.name || '')
  const [kcal, setKcal] = useState(editingFood ? editingFood.values[0] : '')
  const [prot, setProt] = useState(editingFood ? editingFood.values[1] : '')
  const [carbs, setCarbs] = useState(editingFood ? editingFood.values[2] : '')
  const [fat, setFat]   = useState(editingFood ? editingFood.values[3] : '')
  const [error, setError] = useState('')

  const isEdit = !!editingFood

  const validate = () => {
    if (!name.trim()) { setError('Il nome è obbligatorio.'); return false }
    if (!isEdit && catalog[name.trim()]) { setError('Nome già presente nel catalogo.'); return false }
    if ([kcal, prot, carbs, fat].some(v => v === '' || isNaN(v) || Number(v) < 0)) {
      setError('Tutti i valori nutrizionali devono essere numeri ≥ 0.'); return false
    }
    setError(''); return true
  }

  const handleSubmit = () => {
    if (!validate()) return
    const vals = [Number(kcal), Number(prot), Number(carbs), Number(fat)]
    if (isEdit) {
      onSaveEdit(editingFood.name, name.trim(), ...vals)
    } else {
      onAdd(name.trim(), ...vals)
      setName(''); setKcal(''); setProt(''); setCarbs(''); setFat('')
    }
  }

  const numField = (label, val, set) => (
    <div className="flex flex-col gap-1">
      <label className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
      <input
        className="inp w-20 text-center text-sm"
        type="number" min="0" step="0.1"
        value={val} onChange={e => set(e.target.value)} placeholder="0"
      />
    </div>
  )

  return (
    <div className="border-t-2 border-slate-100 pt-4 mt-2">
      <div className="text-[12px] font-bold text-slate-600 mb-3">
        {isEdit ? `Modifica: ${editingFood.name}` : 'Aggiungi alimento'}
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Nome</label>
          <input
            className="inp text-sm" style={{ width: 170 }}
            placeholder="es. Tofu" value={name} onChange={e => setName(e.target.value)}
          />
        </div>
        {numField('Kcal/100g', kcal, setKcal)}
        {numField('Prot. (g)', prot, setProt)}
        {numField('Carbo (g)', carbs, setCarbs)}
        {numField('Grassi (g)', fat, setFat)}
        <div className="flex gap-2">
          <button onClick={handleSubmit} className="btn-ind">
            {isEdit ? '💾 Salva' : '＋ Aggiungi'}
          </button>
          {isEdit && (
            <button onClick={onCancelEdit} className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition-colors">
              Annulla
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-[11px] text-red-600 mt-2">{error}</p>}
    </div>
  )
}
