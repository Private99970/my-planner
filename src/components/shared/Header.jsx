import { ChevronLeft } from 'lucide-react'

export default function Header({ title, back, onBack, action }) {
  return (
    <header
      className="bg-slate-800 text-white px-4 pb-4 flex items-center gap-3 sticky top-0 z-10"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
    >
      {/* back can be a JSX element (from App.jsx) or onBack callback (legacy) */}
      {back ?? (onBack ? (
        <button onClick={onBack} className="p-1 -ml-1 rounded-full active:bg-white/10">
          <ChevronLeft size={22} />
        </button>
      ) : null)}
      <h1 className="text-lg font-bold flex-1">{title}</h1>
      {action}
    </header>
  )
}
