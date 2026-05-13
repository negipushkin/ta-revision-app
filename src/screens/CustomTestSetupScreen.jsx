import { useState } from 'react'

const MIN_Q = 1
const MAX_Q = 763

export default function CustomTestSetupScreen({ allQuestions, onStart, onBack }) {
  const [from, setFrom] = useState('1')
  const [to, setTo] = useState(String(MAX_Q))
  const [count, setCount] = useState('')

  const fromNum = Math.max(MIN_Q, Math.min(parseInt(from) || MIN_Q, MAX_Q))
  const toNum = Math.max(fromNum, Math.min(parseInt(to) || MAX_Q, MAX_Q))

  const questionsInRange = allQuestions.filter(q => q.id >= fromNum && q.id <= toNum)
  const available = questionsInRange.length

  const countNum = parseInt(count)
  const pickCount = count && countNum > 0 ? Math.min(countNum, available) : available

  const handleStart = () => {
    const shuffled = [...questionsInRange].sort(() => Math.random() - 0.5)
    onStart(shuffled.slice(0, pickCount).map(q => q.id))
  }

  return (
    <div className="flex flex-col h-full px-5 py-8 gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-6">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-600 text-slate-300 active:bg-slate-700 transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Custom Test</h1>
          <p className="text-sm text-slate-400">Pick a range and randomize</p>
        </div>
      </div>

      {/* Range */}
      <div className="bg-[#1e293b] rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider">Question Range</p>
        <div className="flex gap-3 items-center">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-slate-500 text-center">From</label>
            <input
              type="number"
              min={MIN_Q}
              max={MAX_Q}
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full h-12 rounded-xl bg-slate-700 border border-slate-600 text-white text-center text-xl font-bold outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <span className="text-slate-500 text-lg mt-4">–</span>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-slate-500 text-center">To</label>
            <input
              type="number"
              min={MIN_Q}
              max={MAX_Q}
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full h-12 rounded-xl bg-slate-700 border border-slate-600 text-white text-center text-xl font-bold outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center">{available} question{available !== 1 ? 's' : ''} in this range</p>
      </div>

      {/* Count */}
      <div className="bg-[#1e293b] rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs text-slate-400 uppercase tracking-wider">Number of Questions</p>
        <input
          type="number"
          min={1}
          max={available}
          placeholder={`All (${available})`}
          value={count}
          onChange={e => setCount(e.target.value)}
          className="w-full h-12 rounded-xl bg-slate-700 border border-slate-600 text-white text-center text-xl font-bold outline-none focus:border-indigo-500 placeholder:text-slate-500 placeholder:text-base placeholder:font-normal transition-colors"
        />
        <p className="text-xs text-slate-500 text-center">Leave blank to include all {available}</p>
      </div>

      {/* Summary pill */}
      <div className="bg-indigo-600/15 border border-indigo-500/30 rounded-xl py-3 text-center">
        <span className="text-indigo-300 text-sm font-semibold">{pickCount} randomized question{pickCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="mt-auto">
        <button
          onClick={handleStart}
          disabled={available === 0}
          className="w-full h-12 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-30 active:bg-indigo-700 transition-colors"
        >
          Start Test
        </button>
      </div>
    </div>
  )
}
