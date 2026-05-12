export default function NavBar({ current, total, onFilterOpen, onSummary }) {
  const display = total === 0
    ? 'No questions'
    : `Q ${current + 1}–${Math.min(current + 2, total)} / ${total}`

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

      <span className="text-sm font-semibold text-slate-200 tracking-wide">{display}</span>

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
