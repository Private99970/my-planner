import { useState } from 'react'
import { useWorkout } from '../../hooks/useWorkout'
import WorkoutList from './WorkoutList'
import SchedaDetail from './SchedaDetail'
import EsercizioDetail from './EsercizioDetail'

/**
 * Navigation stack:
 *   { view: 'list' }
 *   { view: 'scheda', schedaId }
 *   { view: 'esercizio', schedaId, settimanaNum, sedutaNum, esId }
 */
export default function WorkoutSection({ userId, externalNav, onNavChange }) {
  const {
    schede, loading,
    createScheda, deleteScheda,
    addGiorno, addEsercizio, updateEsercizio, deleteEsercizio, duplicateSettimana, deleteSettimana,
  } = useWorkout(userId)

  // If App.jsx controls nav externally (for back button), use that; otherwise local state
  const [localNav, setLocalNav] = useState({ view: 'list' })
  const nav = externalNav ?? localNav

  const push = (next) => {
    setLocalNav(next)
    onNavChange?.(next)
  }

  /* ---- LIST ---- */
  if (nav.view === 'list') {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <WorkoutList
          schede={schede}
          loading={loading}
          onSelect={id => push({ view: 'scheda', schedaId: id })}
          onCreate={nome => createScheda(nome)}
          onDelete={id => deleteScheda(id)}
        />
      </div>
    )
  }

  /* ---- SCHEDA DETAIL ---- */
  if (nav.view === 'scheda') {
    const scheda = schede.find(s => s.id === nav.schedaId)
    if (!scheda) { push({ view: 'list' }); return null }
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <SchedaDetail
          scheda={scheda}
          schede={schede}
          onEsercizioClick={(settimanaNum, sedutaNum, esId) =>
            push({ view: 'esercizio', schedaId: nav.schedaId, settimanaNum, sedutaNum, esId })
          }
          onAddEsercizio={(settimanaNum, sedutaNum) => addEsercizio(nav.schedaId, settimanaNum, sedutaNum)}
          onAddGiorno={(settimanaNum) => addGiorno(nav.schedaId, settimanaNum)}
          onDuplicaSettimana={(num) => duplicateSettimana(nav.schedaId, num)}
          onDeleteSettimana={(num) => deleteSettimana(nav.schedaId, num)}
        />
      </div>
    )
  }

  /* ---- ESERCIZIO DETAIL ---- */
  if (nav.view === 'esercizio') {
    const { schedaId, settimanaNum, sedutaNum, esId } = nav
    const scheda = schede.find(s => s.id === schedaId)
    const seduta = scheda?.settimane.find(s => s.numero === settimanaNum)?.sedute.find(sd => sd.numero === sedutaNum)
    const esercizio = seduta?.esercizi.find(e => e.id === esId)

    if (!esercizio) { push({ view: 'scheda', schedaId }); return null }

    const prevEsercizio = (() => {
      const records = []
      for (const s of (scheda?.settimane ?? [])) {
        for (const sd of s.sedute) {
          const es = sd.esercizi.find(e => e.nome === esercizio.nome && e.id !== esId)
          if (es?.serieEseguite?.length) records.push({ key: s.numero * 100 + sd.numero, es })
        }
      }
      records.sort((a, b) => b.key - a.key)
      return records[0]?.es ?? null
    })()

    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <EsercizioDetail
          esercizio={esercizio}
          prevEsercizio={prevEsercizio}
          onUpdate={(updates) => updateEsercizio(schedaId, settimanaNum, sedutaNum, esId, updates)}
          onDelete={() => { deleteEsercizio(schedaId, settimanaNum, sedutaNum, esId); push({ view: 'scheda', schedaId }) }}
        />
      </div>
    )
  }

  return null
}
