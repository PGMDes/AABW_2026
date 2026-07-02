import { analyzeTask } from "./analyzeTask.js"
import {
  createDemoOutcomeReview,
  createExecutionRecord,
  getTaskStatusFromExecution,
} from "./executionEngine.js"
import { evaluateGovernance } from "./governanceEngine.js"
import { getExecutionOptions } from "./marketplaceEngine.js"
import {
  buildRecommendation,
  buildRecommendationExplanation,
} from "./recommendationEngine.js"

export function buildTaskFlow(task) {
  const analysis = analyzeTask(task)
  const recommendation = buildRecommendation(analysis)
  const explanation = buildRecommendationExplanation(analysis, recommendation)
  const governance = evaluateGovernance(analysis, recommendation)
  const options = getExecutionOptions(analysis, recommendation, governance)
  const selectedOption = options.find((option) => option.eligible) || null
  const execution = createExecutionRecord(task, recommendation, selectedOption)
  const outcome = createDemoOutcomeReview(execution, analysis)
  const taskStatus = getTaskStatusFromExecution(governance, execution)

  return {
    task: {
      ...task,
      status: taskStatus,
    },
    analysis,
    recommendation,
    explanation,
    governance,
    options,
    selectedOption,
    execution,
    outcome,
  }
}
