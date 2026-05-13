import { useState } from 'react'

const DIFFICULTIES = ['Easy', 'Moderate', 'Hard']
const PRIORITIES = ['P1', 'P2', 'P3']

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
        ${active
          ? 'bg-indigo-600 border-indigo-500 text-white'
          : 'bg-slate-700 border-slate-600 text-slate-300 active:bg-slate-600'
        }`}
    >
      {label}
    </button>
  )
}

function MultiSelectDropdown({ label, options, selected, onChange, placeholder }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = options.filter(o =>
    o.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o)
  )

  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val])
  }

  const handleBlur = () => {
    setTimeout(() => setOpen(false), 150)
  }

  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{label}</p>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(s => (
            <span key={s} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-indigo-600/25 border border-indigo-500/50 text-xs text-indigo-300">
              {s}
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => toggle(s)}
                className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-indigo-500/40 text-indigo-400 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full h-10 rounded-xl bg-slate-700 border border-slate-600 text-white text-sm px-3 outline-none focus:border-indigo-500 placeholder:text-slate-500 transition-colors"
        />

        {open && (filtered.length > 0 || search) && (
          <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-xl overflow-hidden shadow-xl max-h-44 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-500 px-3 py-2.5">No matches</p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { toggle(opt); setSearch('') }}
                  className="w-full text-left text-sm text-slate-300 px-3 py-2.5 hover:bg-slate-700 active:bg-slate-600 transition-colors"
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const DEFAULT_LOCAL = { subtopics: [], superCategories: [], difficulty: '', priority: '', weakOnly: false }

export default function FilterSheet({ filters, allSubtopics, allSuperCategories, onApply, onClose }) {
  const [local, setLocal] = useState({ ...DEFAULT_LOCAL, ...filters })

  const toggle = (field, value) => {
    setLocal(prev => ({ ...prev, [field]: prev[field] === value ? '' : value }))
  }

  const reset = () => setLocal(DEFAULT_LOCAL)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ maxWidth: 390, margin: '0 auto' }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative bg-[#1e293b] rounded-t-2xl flex flex-col"
        style={{ animation: 'slideUp 0.25s ease-out', maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        <div className="px-4 pb-2 flex items-center justify-between">
          <h2 className="text-white font-semibold text-base">Filter Questions</h2>
          <button onClick={onClose} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 space-y-5 pb-4">
          {/* Category */}
          <MultiSelectDropdown
            label="Category"
            options={allSuperCategories}
            selected={local.superCategories}
            onChange={val => setLocal(prev => ({ ...prev, superCategories: val }))}
            placeholder="Search categories…"
          />

          {/* Subtopic */}
          <MultiSelectDropdown
            label="Subtopic"
            options={allSubtopics}
            selected={local.subtopics}
            onChange={val => setLocal(prev => ({ ...prev, subtopics: val }))}
            placeholder="Search subtopics…"
          />

          {/* Difficulty */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Difficulty</p>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTIES.map(d => (
                <Chip key={d} label={d} active={local.difficulty === d} onClick={() => toggle('difficulty', d)} />
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Priority</p>
            <div className="flex gap-2 flex-wrap">
              {PRIORITIES.map(p => (
                <Chip key={p} label={p} active={local.priority === p} onClick={() => toggle('priority', p)} />
              ))}
            </div>
          </div>

          {/* Weak Only */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm text-slate-200 font-medium">Weak Only</p>
              <p className="text-xs text-slate-400">Questions you got wrong</p>
            </div>
            <button
              role="switch"
              aria-checked={local.weakOnly}
              onClick={() => setLocal(prev => ({ ...prev, weakOnly: !prev.weakOnly }))}
              className={`relative w-12 h-7 rounded-full transition-colors ${local.weakOnly ? 'bg-indigo-600' : 'bg-slate-600'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${local.weakOnly ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-700 flex gap-3">
          <button
            onClick={reset}
            className="flex-1 h-11 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium active:bg-slate-700"
          >
            Reset
          </button>
          <button
            onClick={() => { onApply(local); onClose() }}
            className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:bg-indigo-700"
          >
            Apply
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
