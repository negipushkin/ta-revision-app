import { useState, useEffect, useCallback, useRef } from 'react'
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

export default function RevisionScreen({ setScreen, reviewIds, onGoHome }) {
  const { allQuestions, filteredQuestions, filters, setFilters, allSubtopics } = useQuestions()

  const displayQuestions = reviewIds
    ? filteredQuestions.filter(q => reviewIds.has(q.id))
    : filteredQuestions

  const [pageIndex, setPageIndex] = useState(0)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [stats, setStats] = useState({ attempted: 0, correct: 0, total: 0 })
  const answeredInPair = useRef(new Set())

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
    markAnswer(id, isCorrect, selectedOption)
    setStats(getStats(allQuestions))
    answeredInPair.current.add(id)

    if (answeredInPair.current.size >= pairSize && !isLastPair) {
      setTimeout(() => {
        setPageIndex(prev => {
          const next = prev + 2
          answeredInPair.current = seedAnswered(displayQuestions.slice(next, next + 2))
          return next
        })
      }, 1000)
    }
  }, [pairSize, isLastPair, allQuestions, displayQuestions])

  const goNext = () => {
    if (!isLastPair) {
      setPageIndex(prev => {
        const next = prev + 2
        answeredInPair.current = seedAnswered(displayQuestions.slice(next, next + 2))
        return next
      })
    }
  }

  const goPrev = () => {
    if (pageIndex > 0) {
      setPageIndex(prev => {
        const next = prev - 2
        answeredInPair.current = seedAnswered(displayQuestions.slice(next, next + 2))
        return next
      })
    }
  }

  // Seed on first render after questions load
  useEffect(() => {
    if (currentPair.length > 0) {
      answeredInPair.current = seedAnswered(currentPair)
    }
  }, [filteredQuestions]) // eslint-disable-line

  const isEmpty = displayQuestions.length === 0

  return (
    <div className="flex flex-col h-full">
      <NavBar
        current={pageIndex}
        total={displayQuestions.length}
        onFilterOpen={() => setFilterSheetOpen(true)}
        onSummary={() => setScreen('summary')}
        onJumpTo={n => {
          const target = Math.floor((n - 1) / 2) * 2
          const clamped = Math.min(target, displayQuestions.length - 1)
          setPageIndex(clamped)
          answeredInPair.current = seedAnswered(displayQuestions.slice(clamped, clamped + 2))
        }}
      />
      <ProgressBar attempted={stats.attempted} correct={stats.correct} total={stats.total} />

      {/* Review mode banner */}
      {reviewIds && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="text-xs text-amber-400 font-medium">
            Review Mode — {reviewIds.size} marked question{reviewIds.size !== 1 ? 's' : ''}
          </span>
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
                  onClick={() => setFilters({ subtopic: '', difficulty: '', priority: '', weakOnly: false })}
                  className="text-indigo-400 text-sm underline"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p className="text-sm">No questions match the current filters.</p>
                <button
                  onClick={() => setFilters({ subtopic: '', difficulty: '', priority: '', weakOnly: false })}
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
        <button
          onClick={onGoHome}
          className="h-11 px-4 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium active:bg-slate-700 transition-colors"
        >
          Home
        </button>
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
          onApply={setFilters}
          onClose={() => setFilterSheetOpen(false)}
        />
      )}
    </div>
  )
}
