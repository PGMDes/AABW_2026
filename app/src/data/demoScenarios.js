import { tasks } from "./tasks.js"

function getTask(taskId) {
  return tasks.find((task) => task.id === taskId)
}

export const defaultDemoScenarioId = "scenario_agent_path"

export const demoScenarios = [
  {
    id: "scenario_agent_path",
    label: "Agent path",
    taskId: "task_001",
    description: "Clear, low-risk research work that proves trusted Agent launch.",
    demonstrates:
      "Trusted Agent launch for clear, low-sensitivity internal knowledge work.",
    task: getTask("task_001"),
    expected: {
      recommendedPath: "agent",
      confidence: 85,
      governanceStatus: "approved_for_launch",
      selectedOptionName: "Research Analyst Agent",
      selectedOptionPathType: "agent",
      selectedOptionSourceType: "agent",
      launchStatus: "launched",
      lifecycleFinalStage: "reviewed",
    },
  },
  {
    id: "scenario_hybrid_path",
    label: "Hybrid path",
    taskId: "task_002",
    description: "Leadership-facing drafting that proves Hybrid execution plus Human review.",
    demonstrates:
      "Hybrid + Human review: an Agent drafts, but a Human reviewer stays in control before launch.",
    task: getTask("task_002"),
    expected: {
      recommendedPath: "hybrid",
      governanceStatus: "needs_human_review",
      selectedOptionName: "Executive Memo Agent + Human Reviewer",
      selectedOptionPathType: "hybrid",
      selectedOptionSourceType: "agent",
      launchStatus: "pending_approval",
      lifecycleFinalStage: "selected",
    },
  },
  {
    id: "scenario_blocked",
    label: "Blocked",
    taskId: "task_003",
    description: "Sensitive, high-risk external work that proves governance can stop unsafe launch.",
    demonstrates:
      "Governance block: unsafe launch is stopped instead of forcing an Agent path.",
    task: getTask("task_003"),
    expected: {
      recommendedPath: "human",
      governanceStatus: "blocked",
      selectedOptionName: null,
      selectedOptionPathType: null,
      launchStatus: "not_launched",
      lifecycleFinalStage: "blocked",
    },
  },
  {
    id: "scenario_human_path",
    label: "Human path",
    taskId: "task_004",
    description: "Ambiguous strategy work that proves high-judgment tasks stay Human-led.",
    demonstrates:
      "High-judgment strategy work remains Human-led instead of being over-automated.",
    task: getTask("task_004"),
    expected: {
      recommendedPath: "human",
      governanceStatus: "needs_human_review",
      selectedOptionName: "Strategy Lead",
      selectedOptionPathType: "human",
      selectedOptionSourceType: "human_role",
      launchStatus: "pending_approval",
      lifecycleFinalStage: "selected",
    },
  },
  {
    id: "scenario_needs_human_review",
    label: "Needs human review",
    taskId: "task_005",
    description: "Policy review work that proves Agent assistance still needs Human validation.",
    demonstrates:
      "Policy work can be assisted by an Agent, but Human validation is required before launch.",
    task: getTask("task_005"),
    expected: {
      recommendedPath: "hybrid",
      governanceStatus: "needs_human_review",
      selectedOptionName: "Policy Review Agent + Human Reviewer",
      selectedOptionPathType: "hybrid",
      selectedOptionSourceType: "agent",
      launchStatus: "pending_approval",
      lifecycleFinalStage: "selected",
    },
  },
]

export const scenarioExpectations = demoScenarios.map(
  ({ id, label, taskId, expected }) => ({
    id,
    label,
    taskId,
    ...expected,
  }),
)

export function getDemoScenarioById(scenarioId) {
  return (
    demoScenarios.find((scenario) => scenario.id === scenarioId) ||
    demoScenarios[0]
  )
}
