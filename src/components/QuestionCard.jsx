import { useState } from 'react'
import { getProgress } from '../store/progressStore'

const DIFFICULTY_COLORS = {
  Easy: 'text-emerald-400 bg-emerald-400/10',
  Moderate: 'text-amber-400 bg-amber-400/10',
  Hard: 'text-red-400 bg-red-400/10',
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuestionCard({ question, onAnswer }) {
  const saved = getProgress()[question.id]
  const [selected, setSelected] = useState(saved?.selectedOption ?? null)
  const [revealed, setRevealed] = useState(!!saved?.attempted)

  const handleCheck = () => {
    if (!selected || revealed) return
    setRevealed(true)
    const isCorrect = selected === question.answer
    onAnswer(isCorrect, selected)
  }

  const optionStyle = (label) => {
    if (!revealed) {
      return selected === label
        ? 'border-indigo-500 bg-indigo-500/10 text-white'
        : 'border-slate-600 text-slate-300 active:bg-slate-700'
    }
    if (label === question.answer) return 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
    if (label === selected) return 'border-red-500 bg-red-500/10 text-red-300'
    return 'border-slate-700 text-slate-500'
  }

  const diffClass = DIFFICULTY_COLORS[question.difficulty] || 'text-slate-400 bg-slate-700'

  return (
    <div className="bg-[#1e293b] rounded-2xl p-4 flex flex-col gap-3">
      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full font-medium truncate max-w-[180px]">
          {question.subtopic}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffClass}`}>
          {question.difficulty}
        </span>
        <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full font-medium">
          {question.priority}
        </span>
      </div>

      {/* Question */}
      <p className="text-slate-100 text-sm leading-relaxed font-medium">{question.question}</p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {OPTION_LABELS.map(label => (
          <button
            key={label}
            disabled={revealed}
            onClick={() => !revealed && setSelected(label)}
            className={`min-h-[44px] w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors flex gap-2 items-start ${optionStyle(label)}`}
          >
            <span className="font-bold shrink-0">{label}.</span>
            <span>{question.options[label]}</span>
          </button>
        ))}
      </div>

      {/* Check button */}
      {!revealed && (
        <button
          disabled={!selected}
          onClick={handleCheck}
          className="mt-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:bg-indigo-700 transition-colors"
        >
          Check Answer
        </button>
      )}

      {/* Explanation */}
      {revealed && (
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 mt-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Explanation</p>
          <p className="text-sm text-slate-300 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
