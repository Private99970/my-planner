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

  const handleSendLink = async (e) => {
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
    else setStep('verify')
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError(null)
    const parsed = parseInput(input)
    if (!parsed) {
      setError('Non riconosciuto. Copia l\'intero link dall\'email e incollalo qui.')
      return
    }

    setLoading(true)
    let error
    if (parsed.kind === 'session') {
      ({ error } = await supabase.auth.setSession({
        access_token: parsed.access_token,
        refresh_token: parsed.refresh_token,
      }))
    } else if (parsed.kind === 'code') {
      ({ error } = await supabase.auth.verifyOtp({
        email, token: parsed.token, type: 'email',
      }))
    } else {
      // Prova prima come magiclink, poi come email (varia in base al tipo di utente)
      ({ error } = await supabase.auth.verifyOtp({
        token_hash: parsed.token, type: 'magiclink',
      }))
      if (error) {
        const retry = await supabase.auth.verifyOtp({
          token_hash: parsed.token, type: 'email',
        })
        error = retry.error
      }
    }
    setLoading(false)
    if (error) {
      console.error('verify error:', error)
      setError(error.message || 'Errore sconosciuto.')
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) { setInput(text); setError(null) }
    } catch {
      setError('Incolla manualmente nel campo qui sopra.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💪</div>
          <h1 className="text-xl font-bold text-[#e6edf3]">My Planner</h1>
          <p className="text-sm text-[#7d8590] mt-1">
            {step === 'email' ? 'Inserisci la tua email per accedere.' : `Email inviata a ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendLink} className="flex flex-col gap-3">
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
              {loading ? 'Invio in corso…' : 'Invia link di accesso'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-3 mb-1">
              <p className="text-[12px] text-[#7d8590] leading-relaxed">
                Apri l'email, <strong className="text-[#e6edf3]">tieni premuto sul link</strong> e scegli
                <strong className="text-[#e6edf3]"> Copia</strong>. Poi torna qui e incollalo sotto.
              </p>
            </div>

            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null) }}
              placeholder="Incolla qui il link…"
              rows={3}
              className="inp w-full py-3 px-4 text-xs resize-none break-all"
              autoFocus
            />

            <button
              type="button"
              onClick={handlePaste}
              className="btn-ghost py-2.5"
            >
              📋 Incolla dagli appunti
            </button>

            {error && <p className="text-[#f85149] text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !input.trim()}
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
