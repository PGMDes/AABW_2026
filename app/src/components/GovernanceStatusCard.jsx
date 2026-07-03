import { SectionCard } from "./SectionCard"
import { formatLabel } from "./formatLabel"
import { StatusBadge } from "./StatusBadge"

function getGovernanceActionLabel(governance) {
  if (governance.status === "blocked") return "Launch blocked"
  if (governance.approvalRequired) return "Human review required"
  return "No approval required"
}

function getGovernanceNextStep(governance) {
  if (governance.status === "blocked") {
    return "Do not launch. Use Human review to confirm the policy block."
  }

  if (governance.approvalRequired) {
    return "Select an eligible option, then record a Human review decision before launch."
  }

  return "Select an eligible option and launch the task."
}

export function GovernanceStatusCard({ governance }) {
  return (
    <SectionCard
      title="Governance status"
      description="Policy result for the recommended path before launch."
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Decision</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge value={governance.status} />
            <StatusBadge
              value={
                governance.status === "blocked"
                  ? "blocked"
                  : governance.approvalRequired
                    ? "needs_human_review"
                    : "approved_for_launch"
              }
              label={getGovernanceActionLabel(governance)}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {governance.policyReason}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">
            What happens next
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {getGovernanceNextStep(governance)}
          </p>
          {governance.approvalReasons?.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {governance.approvalReasons.map((reason) => (
                <li key={reason} className="rounded-md bg-amber-50 px-3 py-2">
                  {reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-4">
          <p className="mb-2 font-semibold text-slate-900">Allowed paths</p>
          <div className="flex flex-wrap gap-2">
            {governance.allowedPaths.length > 0 ? (
              governance.allowedPaths.map((path) => (
                <StatusBadge key={path} value={path} label={formatLabel(path)} />
              ))
            ) : (
              <span className="text-slate-500">No paths open</span>
            )}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 p-4">
          <p className="mb-2 font-semibold text-slate-900">Blocked paths</p>
          <div className="flex flex-wrap gap-2">
            {governance.blockedPaths.length > 0 ? (
              governance.blockedPaths.map((path) => (
                <StatusBadge
                  key={path}
                  value="blocked"
                  label={formatLabel(path)}
                />
              ))
            ) : (
              <span className="text-slate-500">None for this task</span>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
