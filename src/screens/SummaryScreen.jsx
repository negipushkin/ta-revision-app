import { useState, useEffect } from 'react'
import { getStats, resetProgress } from '../store/progressStore'

const DIFFICULTY_ORDER = ['Hard', 'Moderate', 'Easy']
const PRIORITY_ORDER = ['High', 'Medium', 'Low']

const TABS = [
  { key: 'category',   label: 'Topic' },
  { key: 'subtopic',   label: 'Subtopic' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'priority',   label: 'Priority' },
]

function sortedEntries(breakdown, tabKey) {
  const entries = Object.entries(breakdown).filter(([, v]) => v.attempted > 0)
  if (tabKey === 'difficulty') {
    return entries.sort((a, b) => DIFFICULTY_ORDER.indexOf(a[0]) - DIFFICULTY_ORDER.indexOf(b[0]))
  }
  if (tabKey === 'priority') {
    return entries.sort((a, b) => PRIORITY_ORDER.indexOf(a[0]) - PRIORITY_ORDER.indexOf(b[0]))
  }
  return entries.sort((a, b) => (a[1].attempted / a[1].total) - (b[1].attempted / b[1].total))
}

export default function SummaryScreen({ setScreen, allQuestions, onGoHome }) {
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('category')
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

  const overallPct = stats.total > 0 ? Math.round((stats.attempted / stats.total) * 100) : 0
  const breakdownMap = {
    category:   stats.byCategory,
    subtopic:   stats.bySubtopic,
    difficulty: stats.byDifficulty,
    priority:   stats.byPriority,
  }
  const rows = sortedEntries(breakdownMap[tab], tab)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 bg-[#1e293b] border-b border-slate-700 shrink-0">
        <button
          onClick={onGoHome}
          className="flex items-center justify-center w-11 h-11 rounded-lg text-slate-300 active:bg-slate-700"
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-white font-semibold">Progress Summary</h1>
      </div>

      {/* Overall card */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="bg-[#1e293b] rounded-2xl p-4">
          <div className="flex items-end gap-2 mb-1">
            <span className="text-3xl font-bold text-white tabular-nums">{stats.attempted}</span>
            <span className="text-slate-400 text-base pb-0.5">/ {stats.total}</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">questions attempted ({overallPct}% of bank)</p>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-4 shrink-0">
        <div className="flex border-b border-slate-700">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                tab === t.key
                  ? 'text-white border-b-2 border-indigo-500'
                  : 'text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Breakdown list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {rows.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No questions attempted yet. Start revising!
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map(([name, data]) => {
              const pct = Math.round((data.attempted / data.total) * 100)
              return (
                <div key={name} className="bg-[#1e293b] rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-200 font-medium flex-1 mr-3 truncate">{name}</p>
                    <span className="text-sm font-bold tabular-nums text-indigo-400 shrink-0">
                      {data.attempted} / {data.total}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700 shrink-0">
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
