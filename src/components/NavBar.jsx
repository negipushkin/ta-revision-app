import { useState, useRef, useEffect } from 'react'

export default function NavBar({ current, total, onFilterOpen, onSummary, onJumpTo }) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef(null)

  const display = total === 0
    ? 'No questions'
    : `Q ${current + 1}–${Math.min(current + 2, total)} / ${total}`

  const openEdit = () => {
    if (total === 0) return
    setInputVal(String(current + 1))
    setEditing(true)
  }

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = () => {
    const n = parseInt(inputVal, 10)
    if (!isNaN(n) && n >= 1 && n <= total) {
      onJumpTo(n)
    }
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className="flex items-center justify-between px-4 h-14 bg-[#1e293b] border-b border-slate-700">
      <button
        onClick={onSummary}
        className="flex items-center justify-center w-11 h-11 rounded-lg text-slate-300 hover:text-white active:bg-slate-700"
        aria-label="Summary"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </button>

      {editing ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">Q</span>
          <input
            ref={inputRef}
            type="number"
            min={1}
            max={total}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            className="w-16 text-center text-sm font-semibold text-white bg-slate-700 border border-indigo-500 rounded-lg px-2 py-1 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-slate-400">/ {total}</span>
        </div>
      ) : (
        <button
          onClick={openEdit}
          className="text-sm font-semibold text-slate-200 tracking-wide px-3 py-1.5 rounded-lg active:bg-slate-700 transition-colors"
        >
          {display}
        </button>
      )}

      <button
        onClick={onFilterOpen}
        className="flex items-center justify-center w-11 h-11 rounded-lg text-slate-300 hover:text-white active:bg-slate-700"
        aria-label="Filter"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </button>
    </div>
  )
}
