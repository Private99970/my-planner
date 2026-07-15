import { useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { useSession } from './hooks/useSession'
import Login from './components/Auth/Login'
import BottomNav from './components/shared/BottomNav'
import Header from './components/shared/Header'
import WorkoutSection from './components/Workout/WorkoutSection'
import NutritionSection from './components/Nutrition/NutritionSection'
import StatsSection from './components/Stats/StatsSection'

export default function App() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Caricamento…</p>
      </div>
    )
  }

  if (!session) return <Login />

  return <AppContent userId={session.user.id} userEmail={session.user.email} />
}

function AppContent({ userId }) {
  const [tab, setTab] = useState('workout')
  // Workout nav state is mirrored here so Header can show back button / title
  const [workoutNav, setWorkoutNav] = useState({ view: 'list' })

  const workoutTitle = workoutNav.view === 'list' ? 'Workout' : workoutNav.view === 'scheda' ? 'Scheda' : 'Esercizio'
  const TITLES = { workout: workoutTitle, nutrition: 'Alimentazione', stats: 'Statistiche' }

  const backBtn = tab === 'workout' && workoutNav.view !== 'list' ? (
    <button
      onClick={() => {
        if (workoutNav.view === 'esercizio') setWorkoutNav({ view: 'scheda', schedaId: workoutNav.schedaId })
        else setWorkoutNav({ view: 'list' })
      }}
      className="text-sm text-white/70 flex items-center gap-1 pl-1"
    >
      ‹ Indietro
    </button>
  ) : null

  const logoutBtn = (
    <button
      onClick={() => supabase.auth.signOut()}
      className="text-xs text-white/50 border border-white/20 rounded-lg px-2 py-1 active:bg-white/10"
    >
      Esci
    </button>
  )

  const handleTabChange = (t) => {
    setTab(t)
    if (t === 'workout') setWorkoutNav({ view: 'list' })
  }

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col max-w-lg mx-auto">
      <Header title={TITLES[tab]} back={backBtn} action={!backBtn ? logoutBtn : null} />

      <div className="flex-1 overflow-y-auto flex flex-col">
        {tab === 'workout' && (
          <WorkoutSection
            userId={userId}
            externalNav={workoutNav}
            onNavChange={setWorkoutNav}
          />
        )}
        {tab === 'nutrition' && <NutritionSection userId={userId} />}
        {tab === 'stats'     && <StatsSection     userId={userId} />}
      </div>

      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  )
}
