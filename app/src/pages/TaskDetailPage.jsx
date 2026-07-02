import { GovernanceStatusCard } from "../components/GovernanceStatusCard"
import { PageHeader } from "../components/PageHeader"
import { PrimaryButton } from "../components/PrimaryButton"
import { SectionCard } from "../components/SectionCard"
import { formatLabel } from "../components/formatLabel"
import { StatusBadge } from "../components/StatusBadge"
import { TaskSummaryCard } from "../components/TaskSummaryCard"

function LifecycleStepList({ lifecycle }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-500">
          Current stage
        </span>
        <StatusBadge value={lifecycle.currentStage} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {lifecycle.steps.map((step) => (
          <div
            key={step.id}
            className="rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge value={step.status} />
            </div>
            <h3 className="text-sm font-semibold text-slate-950">
              {step.label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditTrailList({ auditTrail }) {
  return (
    <ol className="space-y-3">
      {auditTrail.map((event) => (
        <li
          key={event.id}
          className="grid gap-3 rounded-md border border-slate-200 p-4 sm:grid-cols-[5rem_1fr]"
        >
          <div className="text-sm font-semibold text-slate-500">
            {event.relativeTimestamp}
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-950">
                {event.label}
              </h3>
              <StatusBadge value={event.status} />
              <StatusBadge
                value={event.actorType}
                label={formatLabel(event.actorType)}
              />
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {event.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function TaskDetailPage({ flowResult, onNavigate }) {
  const {
    task,
    analysis,
    recommendation,
    explanation,
    governance,
    selectedOption,
    execution,
    outcome,
    lifecycle,
    auditTrail,
  } = flowResult

  return (
    <>
      <PageHeader
        title="Task Detail / Execution Tracker"
        description="This page shows the full story: original request, recommendation, governance, selected option, launch status, and final outcome."
        action={
          <PrimaryButton
            variant="secondary"
            onClick={() => onNavigate("dashboard")}
          >
            Back to Dashboard
          </PrimaryButton>
        }
      />

      <div className="space-y-6">
        <TaskSummaryCard task={task} />

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Recommendation summary">
            {recommendation && explanation ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={recommendation.recommendedPath} />
                  <StatusBadge
                    value={recommendation.recommendedPath}
                    label={`${recommendation.confidence}% confidence`}
                  />
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="font-medium text-slate-500">Human</dt>
                    <dd className="mt-1 text-slate-900">
                      {recommendation.humanFitScore}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Agent</dt>
                    <dd className="mt-1 text-slate-900">
                      {recommendation.agentFitScore}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Hybrid</dt>
                    <dd className="mt-1 text-slate-900">
                      {recommendation.hybridFitScore}
                    </dd>
                  </div>
                </dl>
                <ul className="space-y-2 text-sm text-slate-700">
                  {explanation.topReasons.map((reason) => (
                    <li
                      key={reason}
                      className="rounded-md bg-slate-50 px-3 py-2"
                    >
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                No recommendation has been generated yet.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Analyzed attributes">
            {analysis ? (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {Object.entries(analysis).map(([key, value]) => {
                  if (key === "taskId") return null
                  return (
                    <div key={key} className="rounded-md bg-slate-50 p-3">
                      <dt className="font-medium text-slate-500">
                        {formatLabel(key)}
                      </dt>
                      <dd className="mt-1 text-slate-900">
                        {formatLabel(value)}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            ) : (
              <p className="text-sm text-slate-600">
                No task analysis has been generated yet.
              </p>
            )}
          </SectionCard>
        </div>

        <GovernanceStatusCard governance={governance} />

        <SectionCard
          title="Execution lifecycle"
          description="A simple state tracker for the route from recommendation through review."
        >
          <LifecycleStepList lifecycle={lifecycle} />
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Selected option">
            {selectedOption ? (
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-slate-950">
                    {selectedOption.displayName}
                  </h3>
                  <StatusBadge value={selectedOption.pathType} />
                  <StatusBadge value={selectedOption.trustTier} />
                </div>
                <p className="text-sm text-slate-600">
                  Fit score: {selectedOption.fitScore}. Selected path:{" "}
                  {formatLabel(execution.selectedPath)}.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                No execution option has been selected yet.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Execution status">
            {execution ? (
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={execution.launchStatus} />
                  <StatusBadge
                    value={
                      execution.approvalStatus === "not_required"
                        ? "approved_for_launch"
                        : execution.approvalStatus
                    }
                    label={formatLabel(execution.approvalStatus)}
                  />
                </div>
                <p className="text-slate-600">
                  Launched at: {execution.launchedAt || "Not launched yet"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                No execution record exists yet.
              </p>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Outcome summary">
          {outcome ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={outcome.status} />
                <StatusBadge value="completed" label={formatLabel(outcome.reviewOutcome)} />
              </div>
              <p className="text-sm font-medium text-slate-900">
                {outcome.outputSummary}
              </p>
              <p className="text-sm leading-6 text-slate-600">
                {outcome.reviewNotes}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No outcome review has been recorded yet.
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="Audit trail"
          description="Deterministic activity log for the task flow."
        >
          <AuditTrailList auditTrail={auditTrail} />
        </SectionCard>
      </div>
    </>
  )
}
