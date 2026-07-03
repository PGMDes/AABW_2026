import { demoScenarios } from "../data/demoScenarios.js"
import { buildTaskFlow } from "./taskFlowEngine.js"

function getActualScenarioResult(flowResult) {
  return {
    recommendedPath: flowResult.recommendation.recommendedPath,
    confidence: flowResult.recommendation.confidence,
    governanceStatus: flowResult.governance.status,
    selectedOptionName: flowResult.selectedOption?.displayName || null,
    selectedOptionPathType: flowResult.selectedOption?.pathType || null,
    selectedOptionSourceType: flowResult.selectedOption?.sourceType || null,
    launchStatus: flowResult.execution.launchStatus,
    lifecycleFinalStage: flowResult.lifecycle.currentStage,
  }
}

function matchesExpectedValue(actual, expected) {
  if (expected === undefined) return true

  return actual === expected
}

export function validateDemoScenario(scenario) {
  const flowResult = buildTaskFlow(scenario.task)
  const actual = getActualScenarioResult(flowResult)
  const checks = Object.fromEntries(
    Object.entries(scenario.expected).map(([key, expectedValue]) => [
      key,
      matchesExpectedValue(actual[key], expectedValue),
    ]),
  )

  return {
    id: scenario.id,
    label: scenario.label,
    taskId: scenario.taskId,
    expected: scenario.expected,
    actual,
    passed: Object.values(checks).every(Boolean),
    checks,
  }
}

export function validateDemoScenarios() {
  return demoScenarios.map(validateDemoScenario)
}
