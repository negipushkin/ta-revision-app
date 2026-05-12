import { useState, useEffect } from 'react'
import { getStats, resetProgress } from '../store/progressStore'

export default function SummaryScreen({ setScreen, allQuestions }) {
  const [stats, setStats] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    setStats(getStats(allQuestions))
  }, [allQuestions])

  const handleReset = () => {
    resetProgress()
    setStats(getStats(allQuestions))
    setConfirmReset(false)
  }

  if (!stats) return null

  const pct = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0
  const subtopics = Object.entries(stats.bySubtopic).filter(([, v]) => v.attempted > 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 bg-[#1e293b] border-b border-slate-700">
        <button
          onClick={() => setScreen('revision')}
          className="flex items-center justify-center w-11 h-11 rounded-lg text-slate-300 active:bg-slate-700"
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-white font-semibold">Progress Summary</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Overall card */}
        <div className="bg-[#1e293b] rounded-2xl p-5">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Overall</p>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-bold text-white">{pct}%</span>
            <span className="text-slate-400 text-sm pb-1 mb-1">accuracy</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-2xl font-bold text-white">{stats.attempted}</p>
              <p className="text-xs text-slate-400 mt-0.5">Attempted</p>
            </div>
            <div className="bg-emerald-900/40 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-400">{stats.correct}</p>
              <p className="text-xs text-slate-400 mt-0.5">Correct</p>
            </div>
            <div className="bg-red-900/30 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-400">{stats.wrong}</p>
              <p className="text-xs text-slate-400 mt-0.5">Wrong</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">{stats.total} total questions in bank</p>
        </div>

        {/* Subtopic breakdown */}
        {subtopics.length > 0 && (
          <div className="bg-[#1e293b] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-slate-400 text-xs uppercase tracking-wider">By Subtopic</p>
            </div>
            <div className="divide-y divide-slate-700/60">
              {subtopics
                .sort((a, b) => {
                  const pctA = a[1].attempted > 0 ? a[1].correct / a[1].attempted : 1
                  const pctB = b[1].attempted > 0 ? b[1].correct / b[1].attempted : 1
                  return pctA - pctB
                })
                .map(([subtopic, data]) => {
                  const p = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0
                  return (
                    <div key={subtopic} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 font-medium truncate">{subtopic}</p>
                        <p className="text-xs text-slate-500">{data.correct}/{data.attempted} correct</p>
                      </div>
                      <span className={`text-sm font-bold tabular-nums ${p >= 70 ? 'text-emerald-400' : p >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                        {p}%
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {subtopics.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No questions attempted yet. Start revising!
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700 space-y-2">
        <button
          onClick={() => setConfirmReset(true)}
          className="w-full h-11 rounded-xl border border-red-800 text-red-400 text-sm font-medium active:bg-red-900/30"
        >
          Reset Progress
        </button>
      </div>

      {/* Confirm dialog */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="bg-[#1e293b] rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-white font-semibold text-base">Reset all progress?</h3>
            <p className="text-slate-400 text-sm">This will clear all your answered questions. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 h-11 rounded-xl border border-slate-600 text-slate-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
