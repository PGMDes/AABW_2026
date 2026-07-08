import { PageHeader } from "../components/PageHeader"
import { PrimaryButton } from "../components/PrimaryButton"
import { SectionCard } from "../components/SectionCard"
import { formatLabel } from "../components/formatLabel"
import { StatusBadge } from "../components/StatusBadge"
import { buildTaskFlow } from "../logic/taskFlowEngine"

const decisionPaths = ["agent", "human", "hybrid"]

const demoPathCards = [
  {
    title: "Agent approved",
    status: "approved_for_launch",
    route: "agent",
    description: "Trusted agent can launch.",
  },
  {
    title: "Hybrid gated",
    status: "needs_human_review",
    route: "hybrid",
    description: "Human review unlocks the run.",
  },
  {
    title: "Blocked by policy",
    status: "blocked",
    route: "human",
    description: "No Agent run is exposed.",
  },
]

function SummaryMetric({ label, value, hint, status }) {
  return (
    <SectionCard className="metric-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {status ? <StatusBadge value={status} /> : null}
      </div>
      <p className="metric-value mt-2">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </SectionCard>
  )
}

function DecisionMix({ pathCounts, totalTasks }) {
  return (
    <SectionCard
      title="Human / Agent / Hybrid mix"
      description="Recommendation coverage across the sample tasks."
    >
      <div className="space-y-4">
        {decisionPaths.map((path) => {
          const count = pathCounts[path] || 0
          const percent = totalTasks > 0 ? (count / totalTasks) * 100 : 0

          return (
            <div key={path}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <StatusBadge value={path} />
                <span className="text-sm font-medium text-slate-600">
                  {count} of {totalTasks}
                </span>
              </div>
              <div
                aria-label={`${formatLabel(path)} recommendation share`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.round(percent)}
                className="score-track h-2 rounded-full"
                role="progressbar"
              >
                <div
                  className="score-fill h-2 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

function DemoPathPanel() {
  return (
    <SectionCard
      title="Demo paths"
      description="The three outcomes judges should notice first."
    >
      <div className="grid gap-3">
        {demoPathCards.map((path) => (
          <div key={path.title} className="info-tile p-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-950">{path.title}</p>
              <StatusBadge value={path.route} />
              <StatusBadge value={path.status} />
            </div>
            <p className="mt-1 text-slate-600">{path.description}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function getNextStepHint(flow) {
  if (flow.governance.status === "blocked") {
    return "Blocked by policy"
  }

  if (flow.governance.status === "needs_human_review") {
    return "Hybrid gated"
  }

  if (flow.execution.launchStatus === "launched") {
    return "Agent approved"
  }

  return "Ready"
}

function getSelectedOptionText(flow) {
  if (flow.selectedOption) {
    return `Option: ${flow.selectedOption.displayName}`
  }

  if (flow.governance.status === "blocked") {
    return "No option: governance blocks launch"
  }

  return "No eligible sample option"
}

export function DashboardPage({
  agentOutputReviewDecisionCount = 0,
  agentRunCount = 0,
  customTaskCount = 0,
  humanReviewDecisions = {},
  onNavigate,
  onResetLocalState,
  tasks,
}) {
  const taskFlows = tasks.map((task) =>
    buildTaskFlow(task, humanReviewDecisions[task.id]),
  )
  const totalTasks = taskFlows.length
  const demoTaskCount = taskFlows.filter(
    (flow) => flow.task.source !== "local",
  ).length
  const humanReviewDecisionCount = Object.keys(humanReviewDecisions).length
  const hasLocalSessionState =
    customTaskCount > 0 ||
    humanReviewDecisionCount > 0 ||
    agentRunCount > 0 ||
    agentOutputReviewDecisionCount > 0
  const approvedForLaunchCount = taskFlows.filter(
    (flow) => flow.governance.status === "approved_for_launch",
  ).length
  const needsHumanReviewCount = taskFlows.filter(
    (flow) => flow.governance.status === "needs_human_review",
  ).length
  const blockedCount = taskFlows.filter(
    (flow) => flow.governance.status === "blocked",
  ).length
  const launchedCount = taskFlows.filter(
    (flow) => flow.execution.launchStatus === "launched",
  ).length
  const pathCounts = decisionPaths.reduce(
    (counts, path) => ({
      ...counts,
      [path]: taskFlows.filter(
        (flow) => flow.recommendation.recommendedPath === path,
      ).length,
    }),
    {},
  )

  return (
    <>
      <PageHeader
        title="Human-AgentOS"
        description="Routes knowledge work to Human, Agent, or Hybrid with governance before launch."
        action={
          <PrimaryButton onClick={() => onNavigate("newTask")}>
            New Task
          </PrimaryButton>
        }
      />

      <div className="control-plane-banner mb-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-900">
              Decision-first workforce control plane
            </p>
            <p className="mt-1 text-cyan-800">
              Analyze the task, enforce policy, then launch only approved work.
            </p>
            <p className="mt-2 font-medium text-cyan-900">
              Local session: {customTaskCount} custom tasks,{" "}
              {humanReviewDecisionCount} Human reviews, {agentRunCount} Agent
              outputs, {agentOutputReviewDecisionCount} output reviews.
            </p>
          </div>
          <PrimaryButton
            disabled={!hasLocalSessionState}
            variant="secondary"
            onClick={onResetLocalState}
          >
            Reset local demo state
          </PrimaryButton>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryMetric
          label="Total tasks"
          value={totalTasks}
          hint={`${demoTaskCount} demo, ${customTaskCount} local`}
        />
        <SummaryMetric
          label="Approved for launch"
          value={approvedForLaunchCount}
          status="approved_for_launch"
        />
        <SummaryMetric
          label="Needs human review"
          value={needsHumanReviewCount}
          status="needs_human_review"
        />
        <SummaryMetric label="Blocked" value={blockedCount} status="blocked" />
        <SummaryMetric
          label="Launched"
          value={launchedCount}
          hint="Already tracked"
          status="launched"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Task queue"
          description="Built-in demo tasks plus any local tasks in this browser."
        >
          <div className="space-y-3">
            {taskFlows.map((taskFlow) => {
              const { task, recommendation, governance } = taskFlow

              return (
                <button
                  key={task.id}
                  type="button"
                  aria-label={`Open ${task.title} task detail`}
                  onClick={() => onNavigate("detail", task.id)}
                  className={`task-row task-row--${governance.status}`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="task-row__title">
                          {task.title}
                        </p>
                        <StatusBadge
                          value={task.source === "local" ? "local" : "demo"}
                        />
                      </div>
                      <p className="mt-1 text-slate-600">
                        {getSelectedOptionText(taskFlow)}
                      </p>
                      <p className="mt-1 font-medium text-slate-500">
                        {getNextStepHint(taskFlow)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <StatusBadge
                        value={recommendation.recommendedPath}
                        label={formatLabel(recommendation.recommendedPath)}
                      />
                      <StatusBadge value={governance.status} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <DemoPathPanel />
          <DecisionMix pathCounts={pathCounts} totalTasks={totalTasks} />
        </div>
      </div>
    </>
  )
}
