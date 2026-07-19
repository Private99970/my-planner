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
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col gap-3">
          <input className="border border-[#30363d] rounded-lg px-3 py-2 text-sm bg-[#0d1117] text-[#e6edf3] outline-none focus:border-[#58a6ff]" placeholder="Nome esercizio" value={nome} onChange={e => setNome(e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            {[['Serie', serieTarget, setSerieTarget], ['Reps target', repTarget, setRepTarget], ['Recupero (s)', recuperoSec, setRecuperoSec]].map(([label, val, setter]) => (
              <div key={label}>
                <p className="text-[10px] text-[#7d8590] font-semibold mb-1">{label}</p>
                <input type="number" className="border border-[#30363d] rounded-lg px-2 py-2 text-sm w-full bg-[#0d1117] text-[#e6edf3] outline-none focus:border-[#58a6ff]" value={val} onChange={e => setter(e.target.value)} />
              </div>
            ))}
          </div>
          <textarea className="border border-[#30363d] rounded-lg px-3 py-2 text-sm resize-none bg-[#0d1117] text-[#e6edf3] outline-none focus:border-[#58a6ff]" rows={2} placeholder="Note tecniche..." value={noteEs} onChange={e => setNoteEs(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={handleSaveConfig} className="flex-1 bg-[#58a6ff] text-[#0d1117] rounded-lg py-2 text-sm font-semibold">Salva</button>
            <button onClick={() => { if (window.confirm('Eliminare questo esercizio?')) onDelete() }} className="flex-1 bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/30 rounded-lg py-2 text-sm font-semibold">Elimina</button>
            <button onClick={() => setEditing(false)} className="flex-1 bg-[#21262d] text-[#7d8590] rounded-lg py-2 text-sm font-semibold">Annulla</button>
          </div>
        </div>
      ) : (
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex justify-between items-start">
          <div>
            <p className="font-bold text-[#e6edf3]">{esercizio.nome || 'Esercizio'}</p>
            <p className="text-xs text-[#7d8590] mt-0.5">
              {esercizio.serieTarget} serie × {esercizio.repTarget} reps · Recupero {esercizio.recuperoSec}s
            </p>
            {esercizio.note && <p className="text-xs text-[#58a6ff] mt-1 italic">{esercizio.note}</p>}
          </div>
          <button onClick={() => setEditing(true)} className="text-xs text-[#7d8590] border border-[#30363d] rounded-lg px-2 py-1">Modifica</button>
        </div>
      )}

      {/* Riferimento ultima esecuzione */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0d1117] rounded-xl p-3 border border-[#21262d]">
          <p className="text-[10px] text-[#7d8590] font-semibold uppercase mb-1">Peso precedente</p>
          <p className="text-lg font-black text-[#7d8590]">{lastSerie?.peso ? `${lastSerie.peso} kg` : '—'}</p>
        </div>
        <div className="bg-[#58a6ff]/10 rounded-xl p-3 border border-[#58a6ff]/30">
          <p className="text-[10px] text-[#58a6ff] font-semibold uppercase mb-1">Nuovo peso (kg)</p>
          <input
            type="number"
            value={peso}
            onChange={e => setPeso(e.target.value)}
            placeholder={lastSerie?.peso || '0'}
            className="w-full bg-transparent text-lg font-black text-[#e6edf3] placeholder-[#30363d] outline-none"
          />
        </div>
        <div className="bg-[#0d1117] rounded-xl p-3 border border-[#21262d]">
          <p className="text-[10px] text-[#7d8590] font-semibold uppercase mb-1">Rep precedenti</p>
          <p className="text-lg font-black text-[#7d8590]">{lastSerie?.reps || '—'}</p>
        </div>
        <div className="bg-[#58a6ff]/10 rounded-xl p-3 border border-[#58a6ff]/30">
          <p className="text-[10px] text-[#58a6ff] font-semibold uppercase mb-1">Nuove rep</p>
          <input
            type="number"
            value={reps}
            onChange={e => setReps(e.target.value)}
            placeholder={lastSerie?.reps || '0'}
            className="w-full bg-transparent text-lg font-black text-[#e6edf3] placeholder-[#30363d] outline-none"
          />
        </div>
      </div>

      {/* Nota serie */}
      <textarea
        value={nota}
        onChange={e => setNota(e.target.value)}
        placeholder="Com'è andata questa serie? (facile, cedimento, dolore…)"
        className="w-full bg-[#161b22] rounded-xl p-3 text-sm text-[#e6edf3] border border-[#21262d] outline-none resize-none h-20 placeholder-[#484f58]"
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
          <p className="text-xs text-[#7d8590] font-semibold mb-2">Serie registrate questa sessione</p>
          <div className="flex flex-col gap-1.5">
            {serieEseguite.map((s, i) => (
              <div key={i} className="bg-[#161b22] rounded-lg border border-[#21262d] px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-[#7d8590]">Serie {i + 1}</span>
                <span className="text-sm font-bold text-[#e6edf3]">{s.peso}kg × {s.reps} reps</span>
                {s.nota && <span className="text-xs text-[#7d8590] italic truncate ml-2 max-w-[100px]">{s.nota}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
