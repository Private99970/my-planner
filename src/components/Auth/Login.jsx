import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSend = async (e) => {
    e.preventDefault()
    setError(null)
    const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL?.toLowerCase()
    if (!allowedEmail || email.trim().toLowerCase() !== allowedEmail) {
      setError('Accesso non autorizzato.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Controlla la tua email</h1>
          <p className="text-sm text-slate-500 mb-6">
            Abbiamo inviato un link di accesso a <strong>{email}</strong>.
            <br />Clicca il link nell'email per entrare.
          </p>
          <button
            onClick={() => { setSent(false); setError(null) }}
            className="text-sm text-slate-400 underline"
          >
            Usa un'altra email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">💪</div>
          <h1 className="text-xl font-bold text-slate-800">My Planner</h1>
          <p className="text-sm text-slate-500 mt-1">Inserisci la tua email per accedere.</p>
        </div>
        <form onSubmit={handleSend} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@esempio.com"
            className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Invio in corso…' : 'Invia link di accesso'}
          </button>
        </form>
      </div>
    </div>
  )
}
