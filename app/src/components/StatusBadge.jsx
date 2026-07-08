import { formatLabel } from "./formatLabel"

const badgeStyles = {
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  approved_for_launch: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  agent: "bg-teal-50 text-teal-800 ring-teal-200",
  hybrid: "bg-amber-50 text-amber-800 ring-amber-200",
  human: "bg-sky-50 text-sky-800 ring-sky-200",
  approval_required: "bg-amber-50 text-amber-800 ring-amber-200",
  needs_human_review: "bg-amber-50 text-amber-800 ring-amber-200",
  blocked: "bg-rose-100 text-rose-900 ring-rose-300",
  launched: "bg-sky-50 text-sky-800 ring-sky-200",
  selected: "bg-teal-50 text-teal-800 ring-teal-200",
  in_progress: "bg-sky-50 text-sky-800 ring-sky-200",
  reviewed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  pending: "bg-stone-100 text-stone-700 ring-stone-200",
  not_started: "bg-stone-100 text-stone-700 ring-stone-200",
  not_launched: "bg-stone-100 text-stone-700 ring-stone-200",
  not_required: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  system: "bg-stone-100 text-stone-700 ring-stone-200",
  recommended: "bg-stone-100 text-stone-700 ring-stone-200",
  ready_to_launch: "bg-sky-50 text-sky-800 ring-sky-200",
  pending_approval: "bg-amber-50 text-amber-800 ring-amber-200",
  trusted: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  review_required: "bg-amber-50 text-amber-800 ring-amber-200",
  human_review: "bg-amber-50 text-amber-800 ring-amber-200",
  human_role: "bg-sky-50 text-sky-800 ring-sky-200",
  demo: "bg-stone-100 text-stone-700 ring-stone-200",
  local: "bg-teal-50 text-teal-800 ring-teal-200",
  submitted: "bg-sky-50 text-sky-800 ring-sky-200",
  waiting_on_review: "bg-amber-50 text-amber-800 ring-amber-200",
  human_led: "bg-sky-50 text-sky-800 ring-sky-200",
  not_available: "bg-stone-100 text-stone-700 ring-stone-200",
  agent_output_ready: "bg-teal-50 text-teal-800 ring-teal-200",
  local_deterministic: "bg-stone-100 text-stone-700 ring-stone-200",
  live_ai_draft: "bg-sky-50 text-sky-800 ring-sky-200",
  agent_output_review: "bg-teal-50 text-teal-800 ring-teal-200",
  accepted_for_use: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  needs_revision: "bg-amber-50 text-amber-800 ring-amber-200",
  rerouted_to_human: "bg-sky-50 text-sky-800 ring-sky-200",
}

export function StatusBadge({ value, label }) {
  const style =
    badgeStyles[value] || "bg-stone-100 text-stone-700 ring-stone-200"

  return (
    <span
      className={`status-badge inline-flex w-fit items-center px-2.5 py-1 text-sm font-semibold ring-1 ring-inset ${style}`}
    >
      {label || formatLabel(value)}
    </span>
  )
}
