const transitions = {
  draft: new Set(["analyzed", "archived"]),
  analyzed: new Set(["draft", "approved", "archived"]),
  approved: new Set(["draft", "launched", "archived"]),
  launched: new Set(["completed"]),
  completed: new Set(["archived"]),
  archived: new Set([]),
}

export function canTransitionTask(currentStatus, nextStatus) {
  return transitions[currentStatus]?.has(nextStatus) || false
}
