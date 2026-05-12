const KEY = 'ta_progress'
const REVIEW_KEY = 'ta_review'

export function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function markAnswer(id, isCorrect, selectedOption) {
  const progress = getProgress()
  progress[id] = { attempted: true, correct: isCorrect, selectedOption }
  localStorage.setItem(KEY, JSON.stringify(progress))
}

export function resetProgress() {
  localStorage.removeItem(KEY)
}

export function getMarkedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(REVIEW_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

export function toggleReview(id) {
  const marked = getMarkedIds()
  marked.has(id) ? marked.delete(id) : marked.add(id)
  localStorage.setItem(REVIEW_KEY, JSON.stringify([...marked]))
  return marked.has(id)
}

export function getMarkedCount() {
  return getMarkedIds().size
}

function computeBreakdown(allQuestions, progress, field) {
  const groups = {}
  for (const q of allQuestions) {
    const key = q[field] || 'Unknown'
    if (!groups[key]) groups[key] = { total: 0, attempted: 0 }
    groups[key].total++
    if (progress[q.id]?.attempted) groups[key].attempted++
  }
  return groups
}

export function getStats(allQuestions = []) {
  const progress = getProgress()
  const ids = Object.keys(progress)
  const attempted = ids.length
  const correct = ids.filter(id => progress[id].correct).length
  const wrong = attempted - correct
  const total = allQuestions.length

  return {
    total, attempted, correct, wrong,
    byCategory: computeBreakdown(allQuestions, progress, 'category'),
    bySubtopic: computeBreakdown(allQuestions, progress, 'subtopic'),
    byDifficulty: computeBreakdown(allQuestions, progress, 'difficulty'),
    byPriority: computeBreakdown(allQuestions, progress, 'priority'),
  }
}
