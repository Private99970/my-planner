import { useState } from 'react'
import { Check } from 'lucide-react'
import Timer from './Timer'

export default function EsercizioDetail({ esercizio, prevEsercizio, onUpdate, onDelete }) {
  const [peso, setPeso] = useState('')
  const [reps, setReps] = useState('')
  const [nota, setNota] = useState('')
  const [editing, setEditing] = useState(false)
  const [nome, setNome] = useState(esercizio.nome)
  const [serieTarget, setSerieTarget] = useState(esercizio.serieTarget)
  const [repTarget, setRepTarget] = useState(esercizio.repTarget)
  const [recuperoSec, setRecuperoSec] = useState(esercizio.recuperoSec)
  const [noteEs, setNoteEs] = useState(esercizio.note || '')

  // Ultima esecuzione registrata come riferimento (prima serie della sessione precedente con dati)
  const lastSerie = prevEsercizio?.serieEseguite?.find(s => s.peso || s.reps)
  const serieEseguite = esercizio.serieEseguite || []

  const handleSerieCompletata = () => {
    if (!peso && !reps) return
    const nuovaSerie = { peso: peso || '', reps: reps || '', nota }
    onUpdate({ serieEseguite: [...serieEseguite, nuovaSerie] })
    setPeso('')
    setReps('')
    setNota('')
  }

  const handleSaveConfig = () => {
    onUpdate({ nome, serieTarget: parseInt(serieTarget) || 3, repTarget: parseInt(repTarget) || 8, recuperoSec: parseInt(recuperoSec) || 90, note: noteEs })
    setEditing(false)
  }

  return (
    <div className="px-4 pt-4 pb-8 flex flex-col gap-4">

      {/* Header esercizio */}
      {editing ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Nome esercizio" value={nome} onChange={e => setNome(e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            {[['Serie', serieTarget, setSerieTarget], ['Reps target', repTarget, setRepTarget], ['Recupero (s)', recuperoSec, setRecuperoSec]].map(([label, val, setter]) => (
              <div key={label}>
                <p className="text-[10px] text-slate-400 font-semibold mb-1">{label}</p>
                <input type="number" className="border border-slate-200 rounded-lg px-2 py-2 text-sm w-full" value={val} onChange={e => setter(e.target.value)} />
              </div>
            ))}
          </div>
          <textarea className="border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" rows={2} placeholder="Note tecniche..." value={noteEs} onChange={e => setNoteEs(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={handleSaveConfig} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold">Salva</button>
            <button onClick={() => { if (window.confirm('Eliminare questo esercizio?')) onDelete() }} className="flex-1 bg-red-50 text-red-500 border border-red-200 rounded-lg py-2 text-sm font-semibold">Elimina</button>
            <button onClick={() => setEditing(false)} className="flex-1 bg-slate-100 text-slate-500 rounded-lg py-2 text-sm font-semibold">Annulla</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 p-4 flex justify-between items-start">
          <div>
            <p className="font-bold text-slate-800">{esercizio.nome || 'Esercizio'}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {esercizio.serieTarget} serie × {esercizio.repTarget} reps · Recupero {esercizio.recuperoSec}s
            </p>
            {esercizio.note && <p className="text-xs text-indigo-500 mt-1 italic">{esercizio.note}</p>}
          </div>
          <button onClick={() => setEditing(true)} className="text-xs text-slate-400 border border-slate-200 rounded-lg px-2 py-1">Modifica</button>
        </div>
      )}

      {/* Riferimento ultima esecuzione */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Peso precedente</p>
          <p className="text-lg font-black text-slate-400">{lastSerie?.peso ? `${lastSerie.peso} kg` : '—'}</p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
          <p className="text-[10px] text-indigo-400 font-semibold uppercase mb-1">Nuovo peso (kg)</p>
          <input
            type="number"
            value={peso}
            onChange={e => setPeso(e.target.value)}
            placeholder={lastSerie?.peso || '0'}
            className="w-full bg-transparent text-lg font-black text-indigo-700 placeholder-indigo-300 outline-none"
          />
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Rep precedenti</p>
          <p className="text-lg font-black text-slate-400">{lastSerie?.reps || '—'}</p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
          <p className="text-[10px] text-indigo-400 font-semibold uppercase mb-1">Nuove rep</p>
          <input
            type="number"
            value={reps}
            onChange={e => setReps(e.target.value)}
            placeholder={lastSerie?.reps || '0'}
            className="w-full bg-transparent text-lg font-black text-indigo-700 placeholder-indigo-300 outline-none"
          />
        </div>
      </div>

      {/* Nota serie */}
      <textarea
        value={nota}
        onChange={e => setNota(e.target.value)}
        placeholder="Com'è andata questa serie? (facile, cedimento, dolore…)"
        className="w-full bg-white rounded-xl p-3 text-sm border border-slate-100 outline-none resize-none h-20"
      />

      {/* Timer */}
      <Timer recuperoSec={esercizio.recuperoSec} />

      {/* Bottone serie completata */}
      <button
        onClick={handleSerieCompletata}
        disabled={!peso && !reps}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-semibold text-sm"
      >
        <Check size={18} /> Serie completata
      </button>

      {/* Serie già registrate */}
      {serieEseguite.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 font-semibold mb-2">Serie registrate questa sessione</p>
          <div className="flex flex-col gap-1.5">
            {serieEseguite.map((s, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-100 px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">Serie {i + 1}</span>
                <span className="text-sm font-bold text-slate-700">{s.peso}kg × {s.reps} reps</span>
                {s.nota && <span className="text-xs text-slate-400 italic truncate ml-2 max-w-[100px]">{s.nota}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
