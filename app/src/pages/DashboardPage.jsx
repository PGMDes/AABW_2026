import {
  currentUser,
} from "../data"
import { PageHeader } from "../components/PageHeader"
import { PrimaryButton } from "../components/PrimaryButton"
import { SectionCard } from "../components/SectionCard"
import { formatLabel } from "../components/formatLabel"
import { StatusBadge } from "../components/StatusBadge"
import { buildTaskFlow } from "../logic/taskFlowEngine"

const decisionPaths = ["agent", "human", "hybrid"]

const walkthroughSteps = [
  "Open New Task and show the scenario picker.",
  "Run task_001 to show the approved Agent path.",
  "Run task_002 to show Hybrid plus Human review.",
  "Run task_003 to show the Blocked policy stop.",
  "Use Task Detail to show lifecycle and audit trail.",
]

const demoProofPoints = [
  "Routes work to Human, Agent, or Hybrid execution paths.",
  "Checks governance before any launch decision.",
  "Supports Human review to approve, reroute, or block work.",
  "Records lifecycle and audit trail evidence for every scenario.",
  "Supports local custom tasks without adding backend infrastructure.",
]

function SummaryMetric({ label, value, hint, status }) {
  return (
    <SectionCard>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {status ? <StatusBadge value={status} /> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
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
                className="h-2 rounded-full bg-slate-100"
                role="progressbar"
              >
                <div
                  className="h-2 rounded-full bg-cyan-600"
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

function WalkthroughOrder() {
  return (
    <SectionCard
      title="Walkthrough order"
      description="Compact guide for the live demo sequence."
    >
      <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700">
        {walkthroughSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </SectionCard>
  )
}

function DemoProofPanel() {
  return (
    <SectionCard
      title="What this demo proves"
      description="The focused control layer before connecting real agent integrations."
    >
      <ul className="space-y-2 text-sm leading-6 text-slate-700">
        {demoProofPoints.map((point) => (
          <li key={point} className="rounded-md bg-slate-50 px-3 py-2">
            {point}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

function getNextStepHint(flow) {
  if (flow.governance.status === "blocked") {
    return "Policy stop - no launch option"
  }

  if (flow.governance.status === "needs_human_review") {
    return "Review before launch"
  }

  if (flow.execution.launchStatus === "launched") {
    return "Launched and tracked"
  }

  return "Ready for walkthrough"
}

function getSelectedOptionText(flow) {
  if (flow.selectedOption) {
    return `Selected option: ${flow.selectedOption.displayName}`
  }

  if (flow.governance.status === "blocked") {
    return "Selected option: none because governance blocks launch"
  }

  return "Selected option: no eligible sample option yet"
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
        description="Founder Mode demo: a control plane for agentic work that routes tasks, checks governance, and records audit evidence before teams scale real agent execution."
        action={
          <PrimaryButton onClick={() => onNavigate("newTask")}>
            New Task
          </PrimaryButton>
        }
      />

      <div className="mb-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-900">
              Control plane for agentic work
            </p>
            <p className="mt-1 text-sm text-cyan-800">
              {currentUser.name} can test the wedge workflow: route work to
              Human / Agent / Hybrid, apply governance, record Human review,
              and keep an audit trail. Built-in scenarios stay fixed; local
              custom tasks, review choices, Agent outputs, and output review
              decisions are saved only in this browser.
            </p>
            <p className="mt-2 text-xs font-medium text-cyan-900">
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <DecisionMix pathCounts={pathCounts} totalTasks={totalTasks} />
          <DemoProofPanel />
          <WalkthroughOrder />
        </div>

        <SectionCard
          title="Task queue"
          description="Demo scenarios are built in. Local tasks are saved in this browser."
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
                  className="block w-full rounded-lg border border-slate-200 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">
                          {task.title}
                        </p>
                        <StatusBadge
                          value={task.source === "local" ? "local" : "demo"}
                        />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {getSelectedOptionText(taskFlow)}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
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
      </div>
    </>
  )
}
