import {
  currentUser,
  executionRecords,
  governanceResults,
  recommendationRecords,
  tasks,
} from "../data"
import { PageHeader } from "../components/PageHeader"
import { PrimaryButton } from "../components/PrimaryButton"
import { SectionCard } from "../components/SectionCard"
import { formatLabel } from "../components/formatLabel"
import { StatusBadge } from "../components/StatusBadge"

function SummaryMetric({ label, value }) {
  return (
    <SectionCard>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </SectionCard>
  )
}

export function DashboardPage({ onNavigate }) {
  const agentRecommendations = recommendationRecords.filter(
    (record) => record.recommendedPath === "agent",
  ).length
  const approvalRequiredCount = governanceResults.filter(
    (result) => result.approvalRequired,
  ).length
  const completedCount = executionRecords.filter((execution) => {
    const task = tasks.find((item) => item.id === execution.taskId)
    return task?.status === "completed"
  }).length

  return (
    <>
      <PageHeader
        title="Human-AgentOS"
        description="A decision-first control plane that helps AI transformation leads choose whether knowledge work should go to a human, an AI agent, or a hybrid team."
        action={
          <PrimaryButton onClick={() => onNavigate("newTask")}>
            New Task
          </PrimaryButton>
        }
      />

      <div className="mb-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
        <p className="text-sm font-semibold text-cyan-900">
          Welcome back, {currentUser.name}
        </p>
        <p className="mt-1 text-sm text-cyan-800">
          Phase 0 uses sample data only. No backend, database, or authentication
          is connected.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryMetric label="Total sample tasks" value={tasks.length} />
        <SummaryMetric label="Agent recommendations" value={agentRecommendations} />
        <SummaryMetric label="Need approval" value={approvalRequiredCount} />
        <SummaryMetric label="Completed outcomes" value={completedCount} />
      </div>

      <SectionCard
        title="Recent sample tasks"
        description="These tasks show the first V1 paths: agent, hybrid, human, approval required, and blocked by policy."
        className="mt-6"
      >
        <div className="space-y-3">
          {tasks.map((task) => {
            const recommendation = recommendationRecords.find(
              (record) => record.taskId === task.id,
            )

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onNavigate("detail", task.id)}
                className="block w-full rounded-lg border border-slate-200 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {task.expectedOutput}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <StatusBadge value={task.status} />
                    {recommendation ? (
                      <StatusBadge
                        value={recommendation.recommendedPath}
                        label={formatLabel(recommendation.recommendedPath)}
                      />
                    ) : null}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </SectionCard>
    </>
  )
}
