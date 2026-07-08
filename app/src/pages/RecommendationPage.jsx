import { GovernanceStatusCard } from "../components/GovernanceStatusCard"
import { PageHeader } from "../components/PageHeader"
import { PrimaryButton } from "../components/PrimaryButton"
import { RecommendationCard } from "../components/RecommendationCard"
import { SectionCard } from "../components/SectionCard"
import { formatLabel } from "../components/formatLabel"
import { StatusBadge } from "../components/StatusBadge"
import { TaskSummaryCard } from "../components/TaskSummaryCard"

export function RecommendationPage({ flowResult, onContinue, onNewTask }) {
  if (!flowResult) {
    return (
      <>
        <PageHeader
          title="Recommendation Result"
          description="Analyze a task to see its route, policy result, and option."
        />

        <SectionCard
          title="No recommendation yet"
          description="Create or select a task, then analyze it."
          className="empty-state"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-slate-600">
              No routing decision has been created in this session.
            </p>
            <PrimaryButton onClick={onNewTask}>Go to New Task</PrimaryButton>
          </div>
        </SectionCard>
      </>
    )
  }

  const {
    task,
    analysis,
    recommendation,
    explanation,
    governance,
    selectedOption,
  } = flowResult

  return (
    <>
      <PageHeader
        title="Recommendation Result"
        description="Route recommendation, scoring factors, governance, and selected option."
      />

      <div className="space-y-6">
        <TaskSummaryCard task={task} />

        <SectionCard title="Analyzed task attributes">
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(analysis).map(([key, value]) => {
              if (key === "taskId") return null
              return (
                <div key={key} className="info-tile p-3">
                  <dt className="font-medium text-slate-500">
                    {formatLabel(key)}
                  </dt>
                  <dd className="mt-1 text-slate-900">{formatLabel(value)}</dd>
                </div>
              )
            })}
          </dl>
        </SectionCard>

        <RecommendationCard
          recommendation={recommendation}
          explanation={explanation}
        />

        <GovernanceStatusCard governance={governance} />

        {selectedOption ? (
          <SectionCard title="Selected execution option">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-950">
                    {selectedOption.displayName}
                  </h3>
                  <StatusBadge value={selectedOption.pathType} />
                  <StatusBadge value={selectedOption.trustTier} />
                </div>
                <p className="text-sm text-slate-600">
                  Fit score: {selectedOption.fitScore}. Best eligible option
                  for this scenario.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {selectedOption.whyShown.map((reason) => (
                    <li
                      key={reason}
                      className="info-tile px-3 py-2"
                    >
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
              <PrimaryButton onClick={onContinue}>
                Continue to Detail
              </PrimaryButton>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Selected execution option"
            description="No eligible option is open for this task."
            className={governance.status === "blocked" ? "empty-state" : ""}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-slate-600">
                Continue to detail for lifecycle and audit evidence.
              </p>
              <PrimaryButton onClick={onContinue}>Continue to Detail</PrimaryButton>
            </div>
          </SectionCard>
        )}
      </div>
    </>
  )
}
