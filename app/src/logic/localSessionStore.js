const CUSTOM_TASKS_KEY = "humanAgentOS.customTasks"
const HUMAN_REVIEW_DECISIONS_KEY = "humanAgentOS.humanReviewDecisions"

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

export function clearStoredLocalSession() {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.removeItem(CUSTOM_TASKS_KEY)
    storage.removeItem(HUMAN_REVIEW_DECISIONS_KEY)
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
