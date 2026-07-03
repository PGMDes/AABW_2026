import { analyzeTask } from "./analyzeTask.js"
import { buildAuditTrail } from "./auditTrailEngine.js"
import {
  createDemoOutcomeReview,
  createExecutionRecord,
  getTaskStatusFromExecution,
} from "./executionEngine.js"
import { evaluateGovernance } from "./governanceEngine.js"
import {
  buildHumanReviewState,
  resolveSelectedOptionAfterHumanReview,
} from "./humanReviewEngine.js"
import { buildLifecycleState } from "./lifecycleEngine.js"
import { getExecutionOptions } from "./marketplaceEngine.js"
import {
  buildRecommendation,
  buildRecommendationExplanation,
} from "./recommendationEngine.js"

export function buildTaskFlow(task, humanReviewDecision = null) {
  const analysis = analyzeTask(task)
  const recommendation = buildRecommendation(analysis)
  const explanation = buildRecommendationExplanation(analysis, recommendation)
  const governance = evaluateGovernance(analysis, recommendation)
  const options = getExecutionOptions(analysis, recommendation, governance)
  const selectedOption = resolveSelectedOptionAfterHumanReview({
    governance,
    recommendation,
    options,
    humanReviewDecision,
  })
  const humanReview = buildHumanReviewState({
    task,
    recommendation,
    governance,
    options,
    selectedOption,
    humanReviewDecision,
  })
  const execution = createExecutionRecord(
    task,
    recommendation,
    selectedOption,
    humanReview,
  )
  const outcome = createDemoOutcomeReview(execution, analysis)
  const lifecycle = buildLifecycleState({
    task,
    recommendation,
    governance,
    humanReview,
    selectedOption,
    execution,
    outcome,
  })
  const auditTrail = buildAuditTrail({
    task,
    analysis,
    recommendation,
    governance,
    humanReview,
    selectedOption,
    execution,
    outcome,
  })
  const taskStatus = getTaskStatusFromExecution(
    governance,
    execution,
    humanReview,
  )

  return {
    task: {
      ...task,
      status: taskStatus,
    },
    analysis,
    recommendation,
    explanation,
    governance,
    humanReview,
    options,
    selectedOption,
    execution,
    outcome,
    lifecycle,
    auditTrail,
  }
}
