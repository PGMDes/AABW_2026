import {
  governanceResults,
  marketplaceOptions,
  recommendationExplanations,
  recommendationRecords,
  taskAnalyses,
  tasks,
} from "../data"
import { GovernanceStatusCard } from "../components/GovernanceStatusCard"
import { PageHeader } from "../components/PageHeader"
import { PrimaryButton } from "../components/PrimaryButton"
import { RecommendationCard } from "../components/RecommendationCard"
import { SectionCard } from "../components/SectionCard"
import { formatLabel } from "../components/formatLabel"
import { StatusBadge } from "../components/StatusBadge"
import { TaskSummaryCard } from "../components/TaskSummaryCard"

export function RecommendationPage({ activeTaskId = "task_001", onContinue }) {
  const task = tasks.find((item) => item.id === activeTaskId) || tasks[0]
  const analysis = taskAnalyses.find((item) => item.taskId === task.id)
  const recommendation = recommendationRecords.find(
    (record) => record.taskId === task.id,
  )
  const explanation = recommendationExplanations.find(
    (item) => item.taskId === task.id,
  )
  const governance = governanceResults.find((item) => item.taskId === task.id)
  const options = marketplaceOptions.filter(
    (option) => option.taskId === task.id && option.eligible,
  )
  const selectedOption = options[0]

  return (
    <>
      <PageHeader
        title="Recommendation Result"
        description="The system scored the task, explains the recommended path, and applies the first governance check."
      />

      <div className="space-y-6">
        <TaskSummaryCard task={task} />

        <SectionCard title="Analyzed task attributes">
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(analysis).map(([key, value]) => {
              if (key === "taskId") return null
              return (
                <div key={key} className="rounded-md bg-slate-50 p-3">
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

        <SectionCard title="Selected execution option">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-slate-950">
                  {selectedOption.displayName}
                </h3>
                <StatusBadge value={selectedOption.pathType} />
                <StatusBadge value={selectedOption.trustTier} />
              </div>
              <p className="text-sm text-slate-600">
                Fit score: {selectedOption.fitScore}. This is the demo happy
                path option for the approved agent recommendation.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {selectedOption.whyShown.map((reason) => (
                  <li key={reason} className="rounded-md bg-slate-50 px-3 py-2">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
            <PrimaryButton onClick={onContinue}>Continue to Detail</PrimaryButton>
          </div>
        </SectionCard>
      </div>
    </>
  )
}
