export default function ProgressBar({ attempted, correct, total }) {
  const correctPct = total > 0 ? (correct / total) * 100 : 0
  const wrongPct = total > 0 ? ((attempted - correct) / total) * 100 : 0

  return (
    <div className="w-full h-1 bg-slate-700 flex">
      <div
        className="h-full bg-emerald-500 transition-all duration-300"
        style={{ width: `${correctPct}%` }}
      />
      <div
        className="h-full bg-red-500 transition-all duration-300"
        style={{ width: `${wrongPct}%` }}
      />
    </div>
  )
}
