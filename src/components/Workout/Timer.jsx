import { useState, useEffect, useRef } from 'react'

export default function Timer({ recuperoSec, onStart }) {
  const [remaining, setRemaining] = useState(recuperoSec)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => { setRemaining(recuperoSec); setRunning(false) }, [recuperoSec])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) { clearInterval(intervalRef.current); setRunning(false); return 0 }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const reset = () => { setRunning(false); setRemaining(recuperoSec) }
  const mins = Math.floor(remaining / 60).toString().padStart(2, '0')
  const secs = (remaining % 60).toString().padStart(2, '0')
  const progress = recuperoSec > 0 ? remaining / recuperoSec : 0
  const done = remaining === 0

  const r = 38
  const circ = 2 * Math.PI * r
  const dash = circ * progress

  return (
    <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#21262d" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={done ? '#f85149' : '#58a6ff'}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: running ? 'stroke-dasharray 0.95s linear' : 'none' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-[#e6edf3] tabular-nums">{mins}:{secs}</span>
        </div>
      </div>
      <div className="flex-1 flex gap-2">
        <button
          onClick={() => { setRunning(r => !r); if (!running && onStart) onStart() }}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            running ? 'bg-[#21262d] text-[#7d8590]' : 'bg-[#58a6ff] text-[#0d1117] hover:bg-[#79b8ff]'
          }`}
        >
          {running ? '⏸ Pausa' : done ? '✓ Finito' : '▶ Avvia recupero'}
        </button>
        <button onClick={reset} className="w-10 flex items-center justify-center text-[#7d8590] hover:text-[#e6edf3] rounded-lg bg-[#21262d] text-base">
          ↺
        </button>
      </div>
    </div>
  )
}
