const CASE_SELECTIONS_KEY = "symbiontos_case_selections"

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage
}

function normalizeSelections(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([taskId, optionId]) =>
        typeof taskId === "string" &&
        taskId.trim() &&
        typeof optionId === "string" &&
        optionId.trim(),
    ),
  )
}

export function loadCaseSelections() {
  const storage = getLocalStorage()

  if (!storage) {
    return {}
  }

  try {
    return normalizeSelections(JSON.parse(storage.getItem(CASE_SELECTIONS_KEY)))
  } catch {
    return {}
  }
}

export function saveCaseSelection(taskId, optionId) {
  const storage = getLocalStorage()

  if (!storage || !taskId?.trim() || !optionId?.trim()) {
    return loadCaseSelections()
  }

  const selections = {
    ...loadCaseSelections(),
    [taskId]: optionId,
  }

  try {
    storage.setItem(CASE_SELECTIONS_KEY, JSON.stringify(selections))
  } catch {
    return loadCaseSelections()
  }

  return selections
}

export function clearCaseSelection(taskId) {
  const storage = getLocalStorage()
  const selections = loadCaseSelections()

  if (!storage || !taskId?.trim() || !(taskId in selections)) {
    return selections
  }

  delete selections[taskId]

  try {
    storage.setItem(CASE_SELECTIONS_KEY, JSON.stringify(selections))
  } catch {
    return loadCaseSelections()
  }

  return selections
}
