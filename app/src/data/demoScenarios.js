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
    description: "Clear, low-risk research work that can launch with a trusted agent.",
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
    description: "Leadership-facing drafting where an agent can help but review stays human-led.",
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
    description: "Sensitive, high-risk external work that should not launch in the demo flow.",
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
    description: "Ambiguous strategy work with high judgment and accountability risk.",
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
    description: "Policy review work where automation can assist but human validation is required.",
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
