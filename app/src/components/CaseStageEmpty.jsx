export function CaseStageEmpty({ stage }) {
  const message = stage?.lockReason || "No evidence has been recorded for this stage yet."

  return (
    <div className="empty-state rounded-lg border border-dashed border-slate-300 p-5">
      <h3 className="text-sm font-semibold text-slate-950">
        {stage?.label || "Case stage"} evidence unavailable
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
    </div>
  )
}
