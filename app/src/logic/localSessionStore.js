import { getAgentOutputReviewAction } from "./agentOutputReview.js"

const CUSTOM_TASKS_KEY = "humanAgentOS.customTasks"
const HUMAN_REVIEW_DECISIONS_KEY = "humanAgentOS.humanReviewDecisions"
const AGENT_RUN_RESULTS_KEY = "humanAgentOS.agentRunResults"
const AGENT_OUTPUT_REVIEW_DECISIONS_KEY =
  "humanAgentOS.agentOutputReviewDecisions"

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const storage = window.localStorage
    const testKey = "humanAgentOS.storageCheck"

    storage.setItem(testKey, "1")
    storage.removeItem(testKey)

    return storage
  } catch {
    return null
  }
}

function readJson(key, fallback) {
  const storage = getLocalStorage()

  if (!storage) {
    return fallback
  }

  try {
    const rawValue = storage.getItem(key)

    if (!rawValue) {
      return fallback
    }

    return JSON.parse(rawValue)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Local persistence is a demo convenience. If the browser blocks it,
    // the app should still work for the current in-memory session.
  }
}

function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function normalizeText(value, fallback = "") {
  const normalized = String(value || "").trim()

  return normalized || fallback
}

function normalizeCustomTask(task) {
  if (!isObject(task)) {
    return null
  }

  const id = normalizeText(task.id)
  const title = normalizeText(task.title)
  const description = normalizeText(task.description)

  if (!id || !title || !description) {
    return null
  }

  return {
    id,
    title,
    description,
    expectedOutput: normalizeText(task.expectedOutput, "Work output"),
    deadline: normalizeText(task.deadline, "2026-07-15"),
    audience: normalizeText(task.audience, "internal"),
    sensitivity: normalizeText(task.sensitivity, "low"),
    urgency: normalizeText(task.urgency, "medium"),
    budgetRange: normalizeText(task.budgetRange, "low"),
    status: normalizeText(task.status, "submitted"),
    source: "local",
    createdAt: normalizeText(task.createdAt, new Date().toISOString()),
  }
}

function normalizeHumanReviewDecisions(value) {
  if (!isObject(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, decision]) => isObject(decision))
      .map(([taskId, decision]) => [
        taskId,
        {
          taskId: normalizeText(decision.taskId, taskId),
          action: normalizeText(decision.action),
        },
      ])
      .filter(([, decision]) => decision.taskId && decision.action),
  )
}

function normalizeTextList(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => normalizeText(item)).filter(Boolean)
}

function normalizeAgentRunSteps(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(isObject)
    .map((step) => ({
      id: normalizeText(step.id),
      label: normalizeText(step.label),
      detail: normalizeText(step.detail),
      status: normalizeText(step.status, "completed"),
    }))
    .filter((step) => step.id && step.label)
}

function normalizeAgentRunResult(value, fallbackTaskId = "") {
  if (!isObject(value)) {
    return null
  }

  const output = isObject(value.output) ? value.output : {}
  const taskId = normalizeText(value.taskId, fallbackTaskId)
  const id = normalizeText(value.id)

  if (!id || !taskId) {
    return null
  }

  return {
    id,
    taskId,
    executionId: normalizeText(value.executionId),
    optionId: normalizeText(value.optionId),
    runnerName: normalizeText(value.runnerName, "Demo Agent"),
    runMode: normalizeText(value.runMode, "local_deterministic"),
    provider: normalizeText(value.provider),
    providerRunId: normalizeText(value.providerRunId),
    model: normalizeText(value.model),
    status: normalizeText(value.status, "completed"),
    generatedAt: normalizeText(value.generatedAt),
    confidence: Number(value.confidence) || 0,
    steps: normalizeAgentRunSteps(value.steps),
    output: {
      title: normalizeText(output.title, "Agent output"),
      draft: normalizeText(output.draft),
      assumptions: normalizeTextList(output.assumptions),
      risks: normalizeTextList(output.risks),
      reviewChecklist: normalizeTextList(output.reviewChecklist),
      limitations: normalizeTextList(output.limitations),
    },
  }
}

function normalizeAgentRunResults(value) {
  if (!isObject(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([taskId, agentRun]) => [
        taskId,
        normalizeAgentRunResult(agentRun, taskId),
      ])
      .filter(([, agentRun]) => agentRun),
  )
}

function normalizeAgentOutputReviewDecisions(value) {
  if (!isObject(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, decision]) => isObject(decision))
      .map(([taskId, decision]) => {
        const action = normalizeText(decision.action)

        return [
          taskId,
          {
            taskId: normalizeText(decision.taskId, taskId),
            action,
            agentRunId: normalizeText(decision.agentRunId),
            actorName: normalizeText(decision.actorName, "Jordan Lee"),
            decidedAt: normalizeText(decision.decidedAt),
          },
        ]
      })
      .filter(
        ([, decision]) =>
          decision.taskId &&
          decision.agentRunId &&
          getAgentOutputReviewAction(decision.action),
      ),
  )
}

export function getStoredCustomTasks() {
  const storedTasks = readJson(CUSTOM_TASKS_KEY, [])

  if (!Array.isArray(storedTasks)) {
    return []
  }

  return storedTasks.map(normalizeCustomTask).filter(Boolean)
}

export function saveStoredCustomTasks(customTasks) {
  const normalizedTasks = Array.isArray(customTasks)
    ? customTasks.map(normalizeCustomTask).filter(Boolean)
    : []

  writeJson(CUSTOM_TASKS_KEY, normalizedTasks)
}

export function getStoredHumanReviewDecisions() {
  return normalizeHumanReviewDecisions(
    readJson(HUMAN_REVIEW_DECISIONS_KEY, {}),
  )
}

export function saveStoredHumanReviewDecisions(humanReviewDecisions) {
  writeJson(
    HUMAN_REVIEW_DECISIONS_KEY,
    normalizeHumanReviewDecisions(humanReviewDecisions),
  )
}

export function getStoredAgentRunResults() {
  return normalizeAgentRunResults(readJson(AGENT_RUN_RESULTS_KEY, {}))
}

export function saveStoredAgentRunResults(agentRunResults) {
  writeJson(AGENT_RUN_RESULTS_KEY, normalizeAgentRunResults(agentRunResults))
}

export function getStoredAgentOutputReviewDecisions() {
  return normalizeAgentOutputReviewDecisions(
    readJson(AGENT_OUTPUT_REVIEW_DECISIONS_KEY, {}),
  )
}

export function saveStoredAgentOutputReviewDecisions(outputReviewDecisions) {
  writeJson(
    AGENT_OUTPUT_REVIEW_DECISIONS_KEY,
    normalizeAgentOutputReviewDecisions(outputReviewDecisions),
  )
}

export function clearStoredLocalSession() {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.removeItem(CUSTOM_TASKS_KEY)
    storage.removeItem(HUMAN_REVIEW_DECISIONS_KEY)
    storage.removeItem(AGENT_RUN_RESULTS_KEY)
    storage.removeItem(AGENT_OUTPUT_REVIEW_DECISIONS_KEY)
  } catch {
    // Ignore storage failures so reset never blocks the app UI.
  }
}

export function generateCustomTaskId(existingIds = []) {
  const usedIds = new Set(existingIds)
  const timestamp = Date.now()
  let candidateId = `custom_task_${timestamp}`
  let suffix = 1

  while (usedIds.has(candidateId)) {
    candidateId = `custom_task_${timestamp}_${suffix}`
    suffix += 1
  }

  return candidateId
}

export function createLocalTaskFromFormData(formData, existingIds = []) {
  return normalizeCustomTask({
    ...formData,
    id: generateCustomTaskId(existingIds),
    status: "submitted",
    source: "local",
    createdAt: new Date().toISOString(),
  })
}
