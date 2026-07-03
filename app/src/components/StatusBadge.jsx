const badgeStyles = {
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  approved_for_launch: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  agent: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  hybrid: "bg-violet-50 text-violet-700 ring-violet-200",
  human: "bg-amber-50 text-amber-700 ring-amber-200",
  approval_required: "bg-amber-50 text-amber-700 ring-amber-200",
  needs_human_review: "bg-amber-50 text-amber-700 ring-amber-200",
  blocked: "bg-rose-50 text-rose-700 ring-rose-200",
  launched: "bg-blue-50 text-blue-700 ring-blue-200",
  selected: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
  reviewed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-slate-100 text-slate-600 ring-slate-200",
  not_started: "bg-slate-100 text-slate-600 ring-slate-200",
  not_launched: "bg-slate-100 text-slate-600 ring-slate-200",
  not_required: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  system: "bg-slate-100 text-slate-700 ring-slate-200",
  recommended: "bg-slate-100 text-slate-700 ring-slate-200",
  ready_to_launch: "bg-blue-50 text-blue-700 ring-blue-200",
  pending_approval: "bg-amber-50 text-amber-700 ring-amber-200",
  trusted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  review_required: "bg-amber-50 text-amber-700 ring-amber-200",
  human_review: "bg-amber-50 text-amber-700 ring-amber-200",
  human_role: "bg-amber-50 text-amber-700 ring-amber-200",
}

import { formatLabel } from "./formatLabel"

export function StatusBadge({ value, label }) {
  const style = badgeStyles[value] || "bg-slate-100 text-slate-700 ring-slate-200"

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {label || formatLabel(value)}
    </span>
  )
}
