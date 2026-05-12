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

export default function RevisionScreen({ setScreen }) {
  const { allQuestions, filteredQuestions, filters, setFilters, allSubtopics } = useQuestions()
  const [pageIndex, setPageIndex] = useState(0)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [stats, setStats] = useState({ attempted: 0, correct: 0, total: 0 })
  const answeredInPair = useRef(new Set())

  useEffect(() => {
    setStats(getStats(allQuestions))
  }, [allQuestions])

  // Reset page when filtered list changes
  useEffect(() => {
    setPageIndex(0)
    answeredInPair.current = new Set()
  }, [filteredQuestions])

  const currentPair = filteredQuestions.slice(pageIndex, pageIndex + 2)
  const pairSize = currentPair.length
  const isLastPair = pageIndex + 2 >= filteredQuestions.length

  const handleAnswer = useCallback((id, isCorrect, selectedOption) => {
    markAnswer(id, isCorrect, selectedOption)
    setStats(getStats(allQuestions))
    answeredInPair.current.add(id)

    if (answeredInPair.current.size >= pairSize && !isLastPair) {
      setTimeout(() => {
        setPageIndex(prev => {
          const next = prev + 2
          answeredInPair.current = seedAnswered(filteredQuestions.slice(next, next + 2))
          return next
        })
      }, 1000)
    }
  }, [pairSize, isLastPair, allQuestions, filteredQuestions])

  const goNext = () => {
    if (!isLastPair) {
      setPageIndex(prev => {
        const next = prev + 2
        answeredInPair.current = seedAnswered(filteredQuestions.slice(next, next + 2))
        return next
      })
    }
  }

  const goPrev = () => {
    if (pageIndex > 0) {
      setPageIndex(prev => {
        const next = prev - 2
        answeredInPair.current = seedAnswered(filteredQuestions.slice(next, next + 2))
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

  return (
    <div className="flex flex-col h-full">
      <NavBar
        current={pageIndex}
        total={filteredQuestions.length}
        onFilterOpen={() => setFilterSheetOpen(true)}
        onSummary={() => setScreen('summary')}
      />
      <ProgressBar attempted={stats.attempted} correct={stats.correct} total={stats.total} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p className="text-sm">No questions match the current filters.</p>
            <button
              onClick={() => setFilters({ subtopic: '', difficulty: '', priority: '', weakOnly: false })}
              className="text-indigo-400 text-sm underline"
            >
              Clear filters
            </button>
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
          onClick={goNext}
          disabled={isLastPair || filteredQuestions.length === 0}
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
