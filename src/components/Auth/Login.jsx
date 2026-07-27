import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

/**
 * Estrae le credenziali da quello che l'utente incolla.
 * Supporta:
 *  - link di verifica            → ?token=…&type=magiclink
 *  - link già redirezionato      → #access_token=…&refresh_token=…
 *  - codice OTP a 6 cifre        → 123456
 */
function parseInput(raw) {
  const s = raw.trim()
  if (!s) return null

  // Codice OTP a 6 cifre
  if (/^\d{6}$/.test(s)) return { kind: 'code', token: s }

  let url
  try { url = new URL(s) } catch { return null }

  const hash = new URLSearchParams(url.hash.replace(/^#/, ''))
  const access_token = hash.get('access_token')
  const refresh_token = hash.get('refresh_token')
  if (access_token && refresh_token) return { kind: 'session', access_token, refresh_token }

  const q = url.searchParams
  const token = q.get('token') || q.get('token_hash') || hash.get('token') || hash.get('token_hash')
  const type = q.get('type') || hash.get('type') || 'magiclink'
  if (token) return { kind: 'hash', token, type }

  return null
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [input, setInput] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'verify'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError(null)
    const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL?.toLowerCase()
    if (!allowedEmail || email.trim().toLowerCase() !== allowedEmail) {
      setError('Accesso non autorizzato.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (error) setError(error.message)
    else setStep('verify')
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError(null)
    const val = input.trim()

    setLoading(true)
    let error
    // Codice numerico (6-10 cifre a seconda della config Supabase)
    if (/^\d{6,10}$/.test(val)) {
      ({ error } = await supabase.auth.verifyOtp({
        email, token: val, type: 'email',
      }))
    } else {
      // Fallback: l'utente ha incollato un link intero
      const parsed = parseInput(val)
      if (!parsed) {
        setLoading(false)
        setError('Inserisci il codice a 6 cifre ricevuto via email.')
        return
      }
      if (parsed.kind === 'session') {
        ({ error } = await supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        }))
      } else {
        ({ error } = await supabase.auth.verifyOtp({
          token_hash: parsed.token, type: 'magiclink',
        }))
        if (error) {
          const retry = await supabase.auth.verifyOtp({ token_hash: parsed.token, type: 'email' })
          error = retry.error
        }
      }
    }
    setLoading(false)
    if (error) {
      console.error('verify error:', error)
      setError('Codice non valido o scaduto. Richiedine uno nuovo.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💪</div>
          <h1 className="text-xl font-bold text-[#e6edf3]">My Planner</h1>
          <p className="text-sm text-[#7d8590] mt-1">
            {step === 'email' ? 'Inserisci la tua email per accedere.' : `Codice inviato a ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@esempio.com"
              className="inp w-full py-3 px-4"
              required
              autoFocus
            />
            {error && <p className="text-[#f85149] text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-ind disabled:opacity-50 py-3 font-semibold"
            >
              {loading ? 'Invio in corso…' : 'Invia codice'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-3 mb-1">
              <p className="text-[12px] text-[#7d8590] leading-relaxed">
                Controlla la tua email e inserisci il <strong className="text-[#e6edf3]">codice</strong> qui sotto.
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={input}
              onChange={(e) => { setInput(e.target.value.replace(/\D/g, '')); setError(null) }}
              placeholder="Codice"
              className="inp w-full py-3 px-4 text-center text-2xl tracking-[0.3em] font-bold"
              autoFocus
            />

            {error && <p className="text-[#f85149] text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || input.trim().length < 6}
              className="btn-ind disabled:opacity-50 py-3 font-semibold"
            >
              {loading ? 'Verifica in corso…' : 'Entra'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setInput(''); setError(null) }}
              className="text-sm text-[#7d8590] text-center"
            >
              ← Cambia email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
