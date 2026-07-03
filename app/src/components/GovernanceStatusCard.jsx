import { SectionCard } from "./SectionCard"
import { formatLabel } from "./formatLabel"
import { StatusBadge } from "./StatusBadge"

function getGovernanceActionLabel(governance) {
  if (governance.status === "blocked") return "Launch blocked"
  if (governance.approvalRequired) return "Human review required"
  return "No approval required"
}

export function GovernanceStatusCard({ governance }) {
  return (
    <SectionCard title="Governance summary">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
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
        <p className="text-sm leading-6 text-slate-700">
          {governance.policyReason}
        </p>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="mb-2 font-semibold text-slate-900">Allowed paths</p>
            <div className="flex flex-wrap gap-2">
              {governance.allowedPaths.map((path) => (
                <StatusBadge key={path} value={path} label={formatLabel(path)} />
              ))}
            </div>
          </div>
          <div>
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
      </div>
    </SectionCard>
  )
}
