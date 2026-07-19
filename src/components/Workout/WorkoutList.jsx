import { useState } from 'react'
import { Plus, ChevronRight, Trash2 } from 'lucide-react'

export default function WorkoutList({ schede, loading, onSelect, onCreate, onDelete }) {
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = () => {
    if (!newName.trim()) return
    onCreate(newName.trim())
    setNewName('')
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#7d8590] text-sm">Caricamento schede…</p>
      </div>
    )
  }

  if (schede.length === 0 && !creating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 pb-8">
        <p className="text-5xl">🏋️</p>
        <p className="text-[#7d8590] text-sm text-center">Nessuna scheda ancora.<br />Crea la prima!</p>
        <button
          onClick={() => setCreating(true)}
          className="btn-ind px-8 py-3 text-sm"
        >
          + Nuova scheda
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-8 flex flex-col gap-3">

      {schede.map(scheda => (
        <div key={scheda.id} className="bg-[#161b22] rounded-xl border border-[#21262d] flex">
          <button
            onClick={() => onSelect(scheda.id)}
            className="flex-1 px-4 py-4 flex items-center justify-between text-left active:bg-[#21262d]"
          >
            <div>
              <p className="font-semibold text-[#e6edf3]">{scheda.nome}</p>
              <p className="text-xs text-[#7d8590] mt-0.5">
                {scheda.settimane?.length ?? 0} settim. ·{' '}
                {scheda.settimane?.reduce((t, s) => t + s.sedute.length, 0) ?? 0} sedute
              </p>
            </div>
            <ChevronRight size={18} className="text-[#30363d] flex-shrink-0" />
          </button>
          <button
            onClick={() => { if (window.confirm(`Eliminare "${scheda.nome}"?`)) onDelete(scheda.id) }}
            className="px-3 flex items-center text-[#30363d] active:text-[#f85149]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {creating ? (
        <div className="bg-[#161b22] rounded-xl border border-[#58a6ff]/40 p-3 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
            placeholder="Nome scheda…"
            className="flex-1 text-sm outline-none text-[#e6edf3] placeholder-[#484f58] bg-transparent"
          />
          <button onClick={handleCreate} className="text-sm text-[#0d1117] bg-[#58a6ff] rounded-lg px-3 py-1 font-semibold">Crea</button>
          <button onClick={() => setCreating(false)} className="text-sm text-[#7d8590]">✕</button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full py-4 rounded-xl border border-dashed border-[#30363d] text-sm text-[#7d8590] flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Nuova scheda
        </button>
      )}
    </div>
  )
}
