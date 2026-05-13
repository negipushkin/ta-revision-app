import { useState, useEffect, useCallback } from 'react'
import { getProgress } from '../store/progressStore'

const DEFAULT_FILTERS = { subtopics: [], superCategories: [], difficulty: '', priority: '', weakOnly: false }
const PRIORITY_MAP = { P1: 'High', P2: 'Medium', P3: 'Low' }

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
      if (f.subtopics?.length && !f.subtopics.includes(q.subtopic)) return false
      if (f.superCategories?.length && !f.superCategories.includes(q.super_category)) return false
      if (f.difficulty && q.difficulty !== f.difficulty) return false
      if (f.priority && q.priority !== PRIORITY_MAP[f.priority]) return false
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
  const allSuperCategories = [...new Set(allQuestions.map(q => q.super_category).filter(Boolean))].sort()

  return { allQuestions, filteredQuestions, filters, setFilters, shuffle, allSubtopics, allSuperCategories, refreshWeak }
}
