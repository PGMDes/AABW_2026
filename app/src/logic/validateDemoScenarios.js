import { demoScenarios } from "../data/demoScenarios.js"
import { buildTaskFlow } from "./taskFlowEngine.js"

export const humanReviewDecisionScenarios = [
  {
    id: "review_task_002_approve_recommended",
    label: "task_002 approve recommended",
    taskId: "task_002",
    action: "approve_recommended",
    expected: {
      recommendedPath: "hybrid",
      governanceStatus: "needs_human_review",
      humanReviewStatus: "approved",
      humanReviewDecisionStatus: "approved",
      selectedOptionName: "Executive Memo Agent + Human Reviewer",
      selectedOptionPathType: "hybrid",
      selectedOptionSourceType: "agent",
      approvalStatus: "approved",
      launchStatus: "launched",
      executionLaunched: true,
      lifecycleFinalStage: "reviewed",
      humanReviewAuditStatus: "approved",
      outcomeStatus: "completed",
    },
  },
  {
    id: "review_task_002_switch_to_human",
    label: "task_002 switch to human-led",
    taskId: "task_002",
    action: "switch_to_human",
    expected: {
      recommendedPath: "hybrid",
      governanceStatus: "needs_human_review",
      humanReviewStatus: "approved",
      humanReviewDecisionStatus: "approved",
      selectedOptionName: "Strategy Lead",
      selectedOptionPathType: "human",
      selectedOptionSourceType: "human_role",
      approvalStatus: "approved",
      launchStatus: "launched",
      executionLaunched: true,
      lifecycleFinalStage: "reviewed",
      humanReviewAuditStatus: "approved",
      outcomeStatus: "completed",
    },
  },
  {
    id: "review_task_003_confirm_policy_block",
    label: "task_003 confirm policy block",
    taskId: "task_003",
    action: "confirm_policy_block",
    expected: {
      recommendedPath: "human",
      governanceStatus: "blocked",
      humanReviewStatus: "blocked",
      humanReviewDecisionStatus: "blocked",
      selectedOptionName: null,
      selectedOptionPathType: null,
      selectedOptionSourceType: null,
      approvalStatus: "blocked",
      launchStatus: "blocked",
      executionLaunched: false,
      lifecycleFinalStage: "blocked",
      humanReviewAuditStatus: "blocked",
      outcomeStatus: null,
    },
  },
  {
    id: "review_task_004_approve_recommended",
    label: "task_004 approve recommended",
    taskId: "task_004",
    action: "approve_recommended",
    expected: {
      recommendedPath: "human",
      governanceStatus: "needs_human_review",
      humanReviewStatus: "approved",
      humanReviewDecisionStatus: "approved",
      selectedOptionName: "Strategy Lead",
      selectedOptionPathType: "human",
      selectedOptionSourceType: "human_role",
      approvalStatus: "approved",
      launchStatus: "launched",
      executionLaunched: true,
      lifecycleFinalStage: "reviewed",
      humanReviewAuditStatus: "approved",
      outcomeStatus: "completed",
    },
  },
  {
    id: "review_task_005_approve_recommended",
    label: "task_005 approve recommended",
    taskId: "task_005",
    action: "approve_recommended",
    expected: {
      recommendedPath: "hybrid",
      governanceStatus: "needs_human_review",
      humanReviewStatus: "approved",
      humanReviewDecisionStatus: "approved",
      selectedOptionName: "Policy Review Agent + Human Reviewer",
      selectedOptionPathType: "hybrid",
      selectedOptionSourceType: "agent",
      approvalStatus: "approved",
      launchStatus: "launched",
      executionLaunched: true,
      lifecycleFinalStage: "reviewed",
      humanReviewAuditStatus: "approved",
      outcomeStatus: "completed",
    },
  },
  {
    id: "review_task_005_switch_to_human",
    label: "task_005 switch to human-led",
    taskId: "task_005",
    action: "switch_to_human",
    expected: {
      recommendedPath: "hybrid",
      governanceStatus: "needs_human_review",
      humanReviewStatus: "approved",
      humanReviewDecisionStatus: "approved",
      selectedOptionName: "Policy Owner",
      selectedOptionPathType: "human",
      selectedOptionSourceType: "human_role",
      approvalStatus: "approved",
      launchStatus: "launched",
      executionLaunched: true,
      lifecycleFinalStage: "reviewed",
      humanReviewAuditStatus: "approved",
      outcomeStatus: "completed",
    },
  },
]

function getActualScenarioResult(flowResult) {
  const humanReviewAuditEvent = flowResult.auditTrail.find(
    (event) => event.label === "Human review decision",
  )

  return {
    recommendedPath: flowResult.recommendation.recommendedPath,
    confidence: flowResult.recommendation.confidence,
    governanceStatus: flowResult.governance.status,
    humanReviewStatus: flowResult.humanReview.status,
    humanReviewDecisionStatus:
      flowResult.humanReview.decision?.decisionStatus || null,
    selectedOptionName: flowResult.selectedOption?.displayName || null,
    selectedOptionPathType: flowResult.selectedOption?.pathType || null,
    selectedOptionSourceType: flowResult.selectedOption?.sourceType || null,
    approvalStatus: flowResult.execution.approvalStatus,
    launchStatus: flowResult.execution.launchStatus,
    executionLaunched: flowResult.execution.launchStatus === "launched",
    lifecycleFinalStage: flowResult.lifecycle.currentStage,
    humanReviewAuditStatus: humanReviewAuditEvent?.status || null,
    outcomeStatus: flowResult.outcome?.status || null,
  }
}

function matchesExpectedValue(actual, expected) {
  if (expected === undefined) return true

  return actual === expected
}

function buildChecks(actual, expected) {
  return Object.fromEntries(
    Object.entries(expected).map(([key, expectedValue]) => [
      key,
      matchesExpectedValue(actual[key], expectedValue),
    ]),
  )
}

function buildCheckDetails(actual, expected) {
  return Object.entries(expected).map(([key, expectedValue]) => ({
    field: key,
    expected: expectedValue,
    actual: actual[key],
    passed: matchesExpectedValue(actual[key], expectedValue),
  }))
}

function getScenarioByTaskId(taskId) {
  return demoScenarios.find((scenario) => scenario.taskId === taskId)
}

export function validateDemoScenario(scenario) {
  const flowResult = buildTaskFlow(scenario.task)
  const actual = getActualScenarioResult(flowResult)
  const checks = buildChecks(actual, scenario.expected)

  return {
    id: scenario.id,
    label: scenario.label,
    group: "baseline",
    taskId: scenario.taskId,
    expected: scenario.expected,
    actual,
    passed: Object.values(checks).every(Boolean),
    checks,
    checkDetails: buildCheckDetails(actual, scenario.expected),
  }
}

export function validateDemoScenarios() {
  return demoScenarios.map(validateDemoScenario)
}

export function validateHumanReviewDecisionScenario(decisionScenario) {
  const scenario = getScenarioByTaskId(decisionScenario.taskId)

  if (!scenario) {
    return {
      id: decisionScenario.id,
      label: decisionScenario.label,
      group: "human_review",
      taskId: decisionScenario.taskId,
      action: decisionScenario.action,
      expected: decisionScenario.expected,
      actual: {},
      passed: false,
      checks: {
        taskFound: false,
      },
      checkDetails: [
        {
          field: "taskFound",
          expected: true,
          actual: false,
          passed: false,
        },
      ],
    }
  }

  const flowResult = buildTaskFlow(scenario.task, {
    taskId: decisionScenario.taskId,
    action: decisionScenario.action,
  })
  const actual = getActualScenarioResult(flowResult)
  const checks = buildChecks(actual, decisionScenario.expected)

  return {
    id: decisionScenario.id,
    label: decisionScenario.label,
    group: "human_review",
    taskId: decisionScenario.taskId,
    action: decisionScenario.action,
    expected: decisionScenario.expected,
    actual,
    passed: Object.values(checks).every(Boolean),
    checks,
    checkDetails: buildCheckDetails(actual, decisionScenario.expected),
  }
}

export function validateHumanReviewDecisionScenarios() {
  return humanReviewDecisionScenarios.map(validateHumanReviewDecisionScenario)
}

export function validateAllDemoScenarios() {
  const baseline = validateDemoScenarios()
  const humanReview = validateHumanReviewDecisionScenarios()
  const results = [...baseline, ...humanReview]
  const passedCount = results.filter((result) => result.passed).length

  return {
    baseline,
    humanReview,
    results,
    passed: passedCount === results.length,
    passedCount,
    failedCount: results.length - passedCount,
    totalCount: results.length,
  }
}
