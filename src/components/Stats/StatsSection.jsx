import { useState } from 'react'
import { useBodyMeasurements, MEASUREMENT_FIELDS } from '../../hooks/useBodyMeasurements'
import { Trash2, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react'
import StatsChart from './StatsChart'

const EMPTY = Object.fromEntries([
  ['recorded_at', new Date().toISOString().slice(0, 10)],
  ...MEASUREMENT_FIELDS.map(f => [f.key, '']),
  ['note', ''],
])

function delta(records, key) {
  const vals = records
    .filter(r => r[key] != null && r[key] !== '')
    .slice(0, 2)
  if (vals.length < 2) return null
  return (parseFloat(vals[0][key]) - parseFloat(vals[1][key])).toFixed(1)
}

function DeltaBadge({ value, unit }) {
  if (value === null) return null
  const n = parseFloat(value)
  if (n === 0) return <span className="text-[10px] text-[#7d8590] ml-1">={unit}</span>
  const positive = n > 0
  return (
    <span className={`text-[10px] font-bold ml-1 ${positive ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>
      {positive ? '+' : ''}{value}{unit}
    </span>
  )
}

function RecordRow({ record, onDelete, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const filled = MEASUREMENT_FIELDS.filter(f => record[f.key] != null && record[f.key] !== '')
  const peso = record.peso

  const startEdit = () => {
    setForm({
      recorded_at: record.recorded_at,
      note: record.note || '',
      ...Object.fromEntries(MEASUREMENT_FIELDS.map(f => [f.key, record[f.key] != null ? String(record[f.key]) : ''])),
    })
    setEditing(true)
    setOpen(false)
  }

  const handleSave = async () => {
    const payload = {
      recorded_at: form.recorded_at,
      note: form.note || null,
    }
    MEASUREMENT_FIELDS.forEach(f => {
      payload[f.key] = form[f.key] !== '' ? parseFloat(form[f.key]) : null
    })
    await onUpdate(record.id, payload)
    setEditing(false)
  }

  if (editing && form) {
    const circonfFields = MEASUREMENT_FIELDS.filter(f => f.group === 'circonf')
    return (
      <div className="bg-[#161b22] rounded-2xl border border-[#58a6ff]/40 p-4 mb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-[#e6edf3]">Modifica misurazione</h3>
          <button onClick={() => setEditing(false)} className="text-[#7d8590] hover:text-[#e6edf3]"><X size={16} /></button>
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-semibold text-[#7d8590] block mb-1">Data</label>
          <input type="date" className="inp w-full" value={form.recorded_at} onChange={e => setForm(f => ({ ...f, recorded_at: e.target.value }))} />
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-semibold text-[#7d8590] block mb-1">Peso (kg)</label>
          <input type="number" step="0.1" min="0" className="inp w-full" value={form.peso} onChange={e => setForm(f => ({ ...f, peso: e.target.value }))} />
        </div>
        <div className="mb-3">
          <label className="text-[11px] font-semibold text-[#7d8590] block mb-2">Circonferenze (cm)</label>
          <div className="grid grid-cols-2 gap-2">
            {circonfFields.map(f => (
              <div key={f.key}>
                <label className="text-[10px] text-[#7d8590] block mb-0.5">{f.label}</label>
                <input type="number" step="0.5" min="0" placeholder="—" className="inp w-full text-sm"
                  value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-[#7d8590] block mb-1">Note</label>
          <textarea className="inp w-full text-sm resize-none" rows={2} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        </div>
        <button onClick={handleSave} className="btn-ind w-full py-2.5 text-sm flex items-center justify-center gap-2">
          <Check size={15} /> Salva modifiche
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#161b22] rounded-2xl border border-[#21262d] overflow-hidden mb-2">
      <div className="flex items-center px-4 py-3 gap-3">
        <div className="flex-1">
          <div className="text-[13px] font-bold text-[#e6edf3]">
            {new Date(record.recorded_at + 'T12:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-[11px] text-[#7d8590] mt-0.5">
            {peso != null && peso !== '' && <span className="text-[#e6edf3] font-semibold">{peso} kg</span>}
            {peso != null && peso !== '' && filled.length > 1 && <span className="mx-1">·</span>}
            {filled.length > (peso != null && peso !== '' ? 1 : 0)} valori registrati
          </div>
        </div>
        <button onClick={startEdit} className="p-2 text-[#30363d] hover:text-[#58a6ff] transition-colors">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(record.id)} className="p-2 text-[#30363d] hover:text-[#f85149] transition-colors">
          <Trash2 size={15} />
        </button>
        <button onClick={() => setOpen(v => !v)} className="p-2 text-[#7d8590] hover:text-[#e6edf3] transition-colors">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && filled.length > 0 && (
        <div className="border-t border-[#21262d] px-4 pb-3 pt-2 grid grid-cols-2 gap-x-4 gap-y-1">
          {filled.map(f => (
            <div key={f.key} className="flex items-baseline gap-1">
              <span className="text-[11px] text-[#7d8590] w-20">{f.label}</span>
              <span className="text-[12px] font-semibold text-[#e6edf3]">{record[f.key]} {f.unit}</span>
            </div>
          ))}
          {record.note && (
            <div className="col-span-2 mt-1 text-[11px] text-[#7d8590] italic">"{record.note}"</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function StatsSection({ userId }) {
  const { records, loading, addRecord, updateRecord, deleteRecord } = useBodyMeasurements(userId)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    const hasValue = MEASUREMENT_FIELDS.some(f => form[f.key] !== '')
    if (!hasValue) return
    setSaving(true)
    const payload = {
      recorded_at: form.recorded_at || new Date().toISOString().slice(0, 10),
      note: form.note || null,
    }
    MEASUREMENT_FIELDS.forEach(f => {
      payload[f.key] = form[f.key] !== '' ? parseFloat(form[f.key]) : null
    })
    await addRecord(payload)
    setForm({ ...EMPTY, recorded_at: new Date().toISOString().slice(0, 10) })
    setSaving(false)
    setFormOpen(false)
  }

  const pesoFields = MEASUREMENT_FIELDS.filter(f => f.group === 'peso')
  const circonfFields = MEASUREMENT_FIELDS.filter(f => f.group === 'circonf')

  return (
    <div className="flex-1 flex flex-col" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>

      {/* Summary strip */}
      {records.length > 0 && (
        <div className="bg-[#161b22] border-b border-[#21262d] px-4 py-3 flex gap-4 overflow-x-auto no-scrollbar">
          {MEASUREMENT_FIELDS.slice(0, 5).map(f => {
            const d = delta(records, f.key)
            const latest = records.find(r => r[f.key] != null && r[f.key] !== '')
            if (!latest) return null
            return (
              <div key={f.key} className="flex-shrink-0 text-center">
                <div className="text-[11px] text-[#7d8590]">{f.label}</div>
                <div className="text-[15px] font-bold text-[#e6edf3]">{latest[f.key]}<span className="text-[10px] text-[#7d8590] ml-0.5">{f.unit}</span></div>
                <DeltaBadge value={d} unit={f.unit} />
              </div>
            )
          })}
        </div>
      )}

      {/* Chart */}
      {records.length >= 2 && <StatsChart records={records} />}

      {/* Add measurement button / form */}
      <div className="px-4 pt-4">
        {!formOpen ? (
          records.length > 0 && (
            <button
              onClick={() => setFormOpen(true)}
              className="w-full btn-ind py-3 text-sm"
            >
              + Aggiungi misurazione
            </button>
          )
        ) : (
          <div className="bg-[#161b22] rounded-2xl border border-[#21262d] p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-[#e6edf3]">Nuova misurazione</h3>
              <button onClick={() => setFormOpen(false)} className="text-[#7d8590] hover:text-[#e6edf3] text-lg leading-none">✕</button>
            </div>

            {/* Data */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-[#7d8590] block mb-1">Data</label>
              <input
                type="date"
                className="inp w-full"
                value={form.recorded_at}
                onChange={e => set('recorded_at', e.target.value)}
              />
            </div>

            {/* Peso */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-[#7d8590] block mb-1">Peso (kg)</label>
              <input
                type="number" step="0.1" min="0" placeholder="es. 75.5"
                className="inp w-full"
                value={form.peso}
                onChange={e => set('peso', e.target.value)}
              />
            </div>

            {/* Circonferenze */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-[#7d8590] block mb-2">Circonferenze (cm)</label>
              <div className="grid grid-cols-2 gap-2">
                {circonfFields.map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] text-[#7d8590] block mb-0.5">{f.label}</label>
                    <input
                      type="number" step="0.5" min="0" placeholder="—"
                      className="inp w-full text-sm"
                      value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-[#7d8590] block mb-1">Note</label>
              <textarea
                className="inp w-full text-sm resize-none"
                rows={2}
                placeholder="Note opzionali…"
                value={form.note}
                onChange={e => set('note', e.target.value)}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-ind w-full py-2.5 text-sm disabled:opacity-60"
            >
              {saving ? 'Salvataggio…' : 'Salva misurazione'}
            </button>
          </div>
        )}
      </div>

      {/* History */}
      <div className="px-4 pt-3 flex-1 flex flex-col">
        {loading ? (
          <p className="text-center text-[#7d8590] text-sm py-8">Caricamento…</p>
        ) : records.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="text-5xl">📏</div>
            <p className="text-[#7d8590] text-sm text-center">Nessuna misurazione ancora.<br />Registra la prima per iniziare a tracciare i progressi.</p>
            <button onClick={() => setFormOpen(true)} className="btn-ind px-8 py-3 text-sm">
              + Aggiungi misurazione
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-[12px] font-bold text-[#7d8590] uppercase tracking-wide mb-2">Storico</h2>
            {records.map(r => (
              <RecordRow key={r.id} record={r} onDelete={deleteRecord} onUpdate={updateRecord} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
