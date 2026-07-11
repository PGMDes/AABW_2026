import { SectionCard } from "./SectionCard"
import { formatLabel } from "./formatLabel"
import { StatusBadge } from "./StatusBadge"

export function TaskSummaryCard({ task, compact = false }) {
  return (
    <SectionCard title={compact ? undefined : "Task summary"}>
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-950">
              {task.title}
            </h1>
            <StatusBadge value={task.source === "local" ? "local" : "demo"} />
            <StatusBadge value={task.status} />
          </div>
          <p className="text-sm leading-6 text-slate-600">{task.description}</p>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="info-tile p-3">
            <dt className="font-medium text-slate-500">Expected output</dt>
            <dd className="mt-1 text-slate-900">{task.expectedOutput}</dd>
          </div>
          <div className="info-tile p-3">
            <dt className="font-medium text-slate-500">Deadline</dt>
            <dd className="mt-1 text-slate-900">{task.deadline}</dd>
          </div>
          <div className="info-tile p-3">
            <dt className="font-medium text-slate-500">Audience</dt>
            <dd className="mt-1 text-slate-900">{formatLabel(task.audience)}</dd>
          </div>
          <div className="info-tile p-3">
            <dt className="font-medium text-slate-500">Sensitivity</dt>
            <dd className="mt-1 text-slate-900">
              {formatLabel(task.sensitivity)}
            </dd>
          </div>
        </dl>
      </div>
    </SectionCard>
  )
}
