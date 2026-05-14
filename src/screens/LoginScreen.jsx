import { useState } from 'react'
import { supabase } from '../supabase'

export default function LoginScreen() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full px-5 items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">TA Revision</h1>
        <p className="text-sm text-slate-400">Territorial Army 2026</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoComplete="email"
          className="h-12 rounded-xl bg-slate-800 text-white px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          className="h-12 rounded-xl bg-slate-800 text-white px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
        />
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60 active:bg-indigo-700 transition-colors"
        >
          {loading ? '…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <button
        onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(null) }}
        className="text-sm text-slate-400"
      >
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <span className="text-indigo-400">{mode === 'signin' ? 'Sign up' : 'Sign in'}</span>
      </button>
    </div>
  )
}
