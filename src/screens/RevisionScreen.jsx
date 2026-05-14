import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import useQuestions from '../data/useQuestions'
import { markAnswer, getStats, getProgress } from '../store/progressStore'
import NavBar from '../components/NavBar'
import ProgressBar from '../components/ProgressBar'
import QuestionPair from '../components/QuestionPair'
import FilterSheet from '../components/FilterSheet'

function seedAnswered(pair) {
  const progress = getProgress()
  return new Set(pair.filter(q => progress[q.id]?.attempted).map(q => q.id))
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function RevisionScreen({ setScreen, reviewIds, testIds, timeLimitSeconds, onGoHome }) {
  const { allQuestions, filteredQuestions, filters, setFilters, allSubtopics, allSuperCategories } = useQuestions()

  const displayQuestions = testIds
    ? testIds.map(id => allQuestions.find(q => q.id === id)).filter(Boolean)
    : reviewIds
      ? filteredQuestions.filter(q => reviewIds.has(q.id))
      : filteredQuestions

  const [pageIndex, setPageIndex] = useState(0)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [stats, setStats] = useState({ attempted: 0, correct: 0, total: 0 })
  const [testProgress, setTestProgress] = useState({})
  const answeredInPair = useRef(new Set())

  const testStats = testIds
    ? (() => {
        const vals = Object.values(testProgress)
        return { attempted: vals.length, correct: vals.filter(v => v.correct).length, total: testIds.length }
      })()
    : null

  const seedForPair = useCallback((pair) => {
    if (testIds) return new Set(pair.filter(q => testProgress[q.id]?.attempted).map(q => q.id))
    return seedAnswered(pair)
  }, [testIds, testProgress])

  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds)
  const [timeExpired, setTimeExpired] = useState(false)

  useEffect(() => {
    if (!timeLimitSeconds || timeExpired) return
    if (timeLeft <= 0) { setTimeExpired(true); return }
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setTimeExpired(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [timeLimitSeconds, timeLeft, timeExpired])

  useEffect(() => {
    setStats(getStats(allQuestions))
  }, [allQuestions])

  // Reset page when display list changes
  useEffect(() => {
    setPageIndex(0)
    answeredInPair.current = new Set()
  }, [filteredQuestions])

  const currentPair = displayQuestions.slice(pageIndex, pageIndex + 2)
  const pairSize = currentPair.length
  const isLastPair = pageIndex + 2 >= displayQuestions.length

  const handleAnswer = useCallback((id, isCorrect, selectedOption) => {
    if (timeExpired) return
    if (testIds) {
      setTestProgress(prev => ({ ...prev, [id]: { attempted: true, correct: isCorrect, selectedOption } }))
    } else {
      markAnswer(id, isCorrect, selectedOption)
      setStats(getStats(allQuestions))
    }
    answeredInPair.current.add(id)

    if (answeredInPair.current.size >= pairSize && !isLastPair) {
      setTimeout(() => {
        setPageIndex(prev => {
          const next = prev + 2
          answeredInPair.current = seedForPair(displayQuestions.slice(next, next + 2))
          return next
        })
      }, 1000)
    }
  }, [pairSize, isLastPair, allQuestions, displayQuestions, timeExpired, testIds, seedForPair])

  const lastAttemptedIndex = useMemo(() => {
    if (testIds) return -1
    const progress = getProgress()
    let last = -1
    displayQuestions.forEach((q, i) => {
      if (progress[q.id]?.attempted) last = i
    })
    return last
  }, [displayQuestions, testIds, stats])

  const goToLast = () => {
    const target = Math.floor(lastAttemptedIndex / 2) * 2
    setPageIndex(target)
    answeredInPair.current = seedForPair(displayQuestions.slice(target, target + 2))
  }

  const goNext = () => {
    if (!isLastPair) {
      setPageIndex(prev => {
        const next = prev + 2
        answeredInPair.current = seedForPair(displayQuestions.slice(next, next + 2))
        return next
      })
    }
  }

  const goPrev = () => {
    if (pageIndex > 0) {
      setPageIndex(prev => {
        const next = prev - 2
        answeredInPair.current = seedForPair(displayQuestions.slice(next, next + 2))
        return next
      })
    }
  }

  // Seed on first render after questions load
  useEffect(() => {
    if (currentPair.length > 0) {
      answeredInPair.current = testIds ? new Set() : seedAnswered(currentPair)
    }
  }, [filteredQuestions]) // eslint-disable-line

  const isEmpty = displayQuestions.length === 0

  return (
    <div className="flex flex-col h-full">
      <NavBar
        current={pageIndex}
        total={displayQuestions.length}
        onFilterOpen={testIds ? null : () => setFilterSheetOpen(true)}
        onSummary={() => setScreen('summary')}
        onJumpTo={n => {
          const target = Math.floor((n - 1) / 2) * 2
          const clamped = Math.min(target, displayQuestions.length - 1)
          setPageIndex(clamped)
          answeredInPair.current = seedForPair(displayQuestions.slice(clamped, clamped + 2))
        }}
      />
      <ProgressBar
        attempted={testStats ? testStats.attempted : stats.attempted}
        correct={testStats ? testStats.correct : stats.correct}
        total={testStats ? testStats.total : stats.total}
      />

      {/* Mode banners */}
      {testIds && (
        <div className={`px-4 py-2 border-b flex items-center justify-between
          ${timeExpired
            ? 'bg-red-500/15 border-red-500/30'
            : timeLeft !== null && timeLeft <= 60
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-indigo-500/10 border-indigo-500/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={timeExpired || (timeLeft !== null && timeLeft <= 60) ? '#f87171' : '#818cf8'} strokeWidth="2">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span className={`text-xs font-medium ${timeExpired || (timeLeft !== null && timeLeft <= 60) ? 'text-red-300' : 'text-indigo-300'}`}>
              {timeExpired ? 'Time\'s Up!' : `Test Mode — ${testIds.length} question${testIds.length !== 1 ? 's' : ''}`}
            </span>
          </div>
          {timeLimitSeconds && (
            <span className={`text-sm font-bold tabular-nums ${timeExpired ? 'text-red-400' : timeLeft <= 60 ? 'text-red-300' : 'text-indigo-300'}`}>
              {timeExpired ? '00:00' : formatTime(timeLeft)}
            </span>
          )}
        </div>
      )}
      {reviewIds && !testIds && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="text-xs text-amber-400 font-medium">
            Review Mode — {reviewIds.size} marked question{reviewIds.size !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Test stats bar */}
      {testIds && testStats && (
        <div className="px-4 py-2 bg-[#1e293b] border-b border-slate-700 flex items-center">
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-xs text-slate-500">Attempted</span>
            <span className="text-sm font-bold text-white">
              {testStats.attempted} <span className="text-xs font-normal text-slate-500">/ {testStats.total}</span>
            </span>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-xs text-slate-500">Correct</span>
            <span className="text-sm font-bold text-emerald-400">{testStats.correct}</span>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-xs text-slate-500">Wrong</span>
            <span className="text-sm font-bold text-red-400">{testStats.attempted - testStats.correct}</span>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            {reviewIds ? (
              <>
                <p className="text-sm text-center">No marked questions match the current filters.</p>
                <button
                  onClick={() => setFilters({ subtopics: [], superCategories: [], difficulty: '', priority: '', weakOnly: false })}
                  className="text-indigo-400 text-sm underline"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p className="text-sm">No questions match the current filters.</p>
                <button
                  onClick={() => setFilters({ subtopics: [], superCategories: [], difficulty: '', priority: '', weakOnly: false })}
                  className="text-indigo-400 text-sm underline"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <QuestionPair
            key={pageIndex}
            questions={currentPair}
            onAnswer={handleAnswer}
            fresh={!!testIds}
            shuffleOptions={!!testIds}
          />
        )}
      </div>

      {/* Sticky footer nav */}
      <div className="px-4 py-3 border-t border-slate-700 flex gap-3 bg-[#0f172a]">
        <button
          onClick={goPrev}
          disabled={pageIndex === 0}
          className="flex-1 h-11 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium disabled:opacity-30 active:bg-slate-700 transition-colors"
        >
          ← Prev
        </button>
        {testIds ? (
          <>
            <button
              onClick={onGoHome}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-600 text-slate-300 active:bg-slate-700 transition-colors"
              aria-label="Main menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </button>
            <button
              onClick={() => {
                setPageIndex(0)
                answeredInPair.current = seedForPair(displayQuestions.slice(0, 2))
              }}
              className="h-11 px-4 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium active:bg-slate-700 transition-colors"
            >
              Q 1
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onGoHome}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-600 text-slate-300 active:bg-slate-700 transition-colors"
              aria-label="Home"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </button>
            <button
              onClick={goToLast}
              disabled={lastAttemptedIndex < 0}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-600 text-slate-300 disabled:opacity-30 active:bg-slate-700 transition-colors"
              aria-label="Go to last attempted"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </button>
          </>
        )}
        <button
          onClick={goNext}
          disabled={isLastPair || isEmpty}
          className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-30 active:bg-indigo-700 transition-colors"
        >
          Next →
        </button>
      </div>

      {filterSheetOpen && (
        <FilterSheet
          filters={filters}
          allSubtopics={allSubtopics}
          allSuperCategories={allSuperCategories}
          onApply={setFilters}
          onClose={() => setFilterSheetOpen(false)}
        />
      )}
    </div>
  )
}
