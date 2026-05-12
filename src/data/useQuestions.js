import { useState, useEffect, useCallback } from 'react'
import { getProgress } from '../store/progressStore'

const DEFAULT_FILTERS = { subtopic: '', difficulty: '', priority: '', weakOnly: false }

export default function useQuestions() {
  const [allQuestions, setAllQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS)

  useEffect(() => {
    fetch('/questions.json')
      .then(r => r.json())
      .then(data => setAllQuestions(data.questions || []))
  }, [])

  const applyFilters = useCallback((questions, f) => {
    const progress = getProgress()
    return questions.filter(q => {
      if (f.subtopic && q.subtopic !== f.subtopic) return false
      if (f.difficulty && q.difficulty !== f.difficulty) return false
      if (f.priority && q.priority !== f.priority) return false
      if (f.weakOnly) {
        const p = progress[q.id]
        if (!p || !p.attempted || p.correct) return false
      }
      return true
    })
  }, [])

  useEffect(() => {
    setFilteredQuestions(applyFilters(allQuestions, filters))
  }, [allQuestions, filters, applyFilters])

  const setFilters = useCallback((newFilters) => {
    setFiltersState(newFilters)
  }, [])

  const shuffle = useCallback(() => {
    setFilteredQuestions(prev => {
      const copy = [...prev]
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy
    })
  }, [])

  const refreshWeak = useCallback(() => {
    if (filters.weakOnly) {
      setFilteredQuestions(applyFilters(allQuestions, filters))
    }
  }, [filters, allQuestions, applyFilters])

  const allSubtopics = [...new Set(allQuestions.map(q => q.subtopic).filter(Boolean))].sort()

  return { allQuestions, filteredQuestions, filters, setFilters, shuffle, allSubtopics, refreshWeak }
}
