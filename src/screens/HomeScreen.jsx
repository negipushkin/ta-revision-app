import { getStats, getMarkedCount } from '../store/progressStore'

export default function HomeScreen({ allQuestions, user, onRevise, onReview, onCustomTest, onSummary, onSignOut }) {
  const { attempted, correct, total } = getStats(allQuestions)
  const markedCount = getMarkedCount()

  return (
    <div className="flex flex-col h-full px-5 py-8 gap-6">
      {/* Title + user */}
      <div className="flex items-start justify-between pt-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">TA Revision</h1>
          <p className="text-sm text-slate-400">Territorial Army 2026</p>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 py-1 pl-1 pr-3 rounded-full bg-slate-800 active:bg-slate-700 transition-colors"
          title="Sign out"
        >
          {user?.photoURL
            ? <img src={user.photoURL} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
            : <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">{user?.displayName?.[0] ?? '?'}</div>
          }
          <span className="text-xs text-slate-400">Sign out</span>
        </button>
      </div>

      {/* Stats */}
      <div className="bg-[#1e293b] rounded-2xl p-4 flex gap-4">
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="text-xs text-slate-400 font-medium">Attempted</span>
          <span className="text-lg font-bold text-white">{attempted} <span className="text-sm font-normal text-slate-500">/ {total}</span></span>
        </div>
        <div className="w-px bg-slate-700" />
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="text-xs text-slate-400 font-medium">Correct</span>
          <span className="text-lg font-bold text-emerald-400">{correct}</span>
        </div>
        <div className="w-px bg-slate-700" />
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="text-xs text-slate-400 font-medium">Marked</span>
          <span className="text-lg font-bold text-amber-400">{markedCount}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-2">
        <button
          onClick={onRevise}
          className="h-12 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:bg-indigo-700 transition-colors"
        >
          {attempted === 0 ? 'Start Revision' : 'Continue Revision'}
        </button>

        <button
          onClick={onReview}
          disabled={markedCount === 0}
          className="h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed active:bg-amber-500/30 transition-colors"
        >
          Review Marked{markedCount > 0 ? ` (${markedCount})` : ''}
        </button>

        <button
          onClick={onCustomTest}
          className="h-12 rounded-xl border border-indigo-500/50 text-indigo-300 text-sm font-semibold active:bg-indigo-600/20 transition-colors"
        >
          Custom Test
        </button>
      </div>

      {/* Summary link */}
      <button
        onClick={onSummary}
        className="text-sm text-slate-400 underline underline-offset-2 self-center mt-auto"
      >
        View Summary
      </button>
    </div>
  )
}
