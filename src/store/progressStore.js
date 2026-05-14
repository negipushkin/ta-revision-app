import { supabase } from '../supabase'

const KEY = 'ta_progress'
const REVIEW_KEY = 'ta_review'

let _uid = null

export function setUid(uid) {
  _uid = uid
}

async function pushToCloud() {
  if (!_uid) return
  const progress = JSON.parse(localStorage.getItem(KEY) || '{}')
  const review = JSON.parse(localStorage.getItem(REVIEW_KEY) || '[]')
  try {
    await supabase
      .from('user_progress')
      .upsert({ user_id: _uid, progress, review, updated_at: new Date().toISOString() })
  } catch (e) {
    console.error('Cloud sync failed', e)
  }
}

export async function loadFromCloud(uid) {
  _uid = uid
  try {
    const { data } = await supabase
      .from('user_progress')
      .select('progress, review')
      .eq('user_id', uid)
      .single()
    if (data) {
      if (data.progress) localStorage.setItem(KEY, JSON.stringify(data.progress))
      if (data.review) localStorage.setItem(REVIEW_KEY, JSON.stringify(data.review))
    }
  } catch (e) {
    console.error('Failed to load from cloud', e)
  }
}

export function clearLocal() {
  localStorage.removeItem(KEY)
  localStorage.removeItem(REVIEW_KEY)
  _uid = null
}

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
  pushToCloud()
}

export function resetProgress() {
  localStorage.removeItem(KEY)
  pushToCloud()
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
  pushToCloud()
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
