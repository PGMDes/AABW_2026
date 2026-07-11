const TASK_DRAFT_KEY = "symbiontos.taskDraft"

export function loadTaskDraft() {
  try {
    const storedDraft = globalThis.localStorage?.getItem(TASK_DRAFT_KEY)
    return storedDraft ? JSON.parse(storedDraft) : null
  } catch {
    return null
  }
}

export function saveTaskDraft(draft) {
  globalThis.localStorage?.setItem(TASK_DRAFT_KEY, JSON.stringify(draft))
}

export function clearTaskDraft() {
  globalThis.localStorage?.removeItem(TASK_DRAFT_KEY)
}
