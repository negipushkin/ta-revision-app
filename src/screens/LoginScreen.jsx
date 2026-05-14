import { useState } from 'react'
import { supabase } from '../supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col h-full px-5 items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white">Check your email</h2>
        <p className="text-sm text-slate-400 text-center">
          We sent a login link to <span className="text-white font-medium">{email}</span>. Tap it to sign in.
        </p>
        <button onClick={() => setSent(false)} className="text-indigo-400 text-sm mt-2">
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full px-5 items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">TA Revision</h1>
        <p className="text-sm text-slate-400">Territorial Army 2026</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
        <p className="text-sm text-slate-400 text-center">
          Enter your email — we'll send you a sign-in link
        </p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="h-12 rounded-xl bg-slate-800 text-white px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60 active:bg-indigo-700 transition-colors"
        >
          {loading ? 'Sending…' : 'Send login link'}
        </button>
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      </form>
    </div>
  )
}
