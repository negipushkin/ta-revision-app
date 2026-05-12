const KEY = 'ta_progress'

export function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function markAnswer(id, isCorrect) {
  const progress = getProgress()
  progress[id] = { attempted: true, correct: isCorrect }
  localStorage.setItem(KEY, JSON.stringify(progress))
}

export function resetProgress() {
  localStorage.removeItem(KEY)
}

export function getStats(allQuestions = []) {
  const progress = getProgress()
  const ids = Object.keys(progress)
  const attempted = ids.length
  const correct = ids.filter(id => progress[id].correct).length
  const wrong = attempted - correct
  const total = allQuestions.length

  const bySubtopic = {}
  for (const q of allQuestions) {
    const st = q.subtopic || 'Unknown'
    if (!bySubtopic[st]) bySubtopic[st] = { total: 0, attempted: 0, correct: 0 }
    bySubtopic[st].total++
    const entry = progress[q.id]
    if (entry?.attempted) {
      bySubtopic[st].attempted++
      if (entry.correct) bySubtopic[st].correct++
    }
  }

  return { total, attempted, correct, wrong, bySubtopic }
}
