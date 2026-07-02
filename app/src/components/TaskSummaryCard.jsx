import { SectionCard } from "./SectionCard"
import { formatLabel } from "./formatLabel"
import { StatusBadge } from "./StatusBadge"

export function TaskSummaryCard({ task }) {
  return (
    <SectionCard title="Task summary">
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-slate-950">
              {task.title}
            </h3>
            <StatusBadge value={task.status} />
          </div>
          <p className="text-sm leading-6 text-slate-600">{task.description}</p>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-medium text-slate-500">Expected output</dt>
            <dd className="mt-1 text-slate-900">{task.expectedOutput}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Deadline</dt>
            <dd className="mt-1 text-slate-900">{task.deadline}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Audience</dt>
            <dd className="mt-1 text-slate-900">{formatLabel(task.audience)}</dd>
          </div>
          <div>
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
