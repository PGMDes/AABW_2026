import { getServiceClient, requireAdmin, requireMethod, sendJson, withApi } from "./_lib.js"

export default withApi(async (req, res, traceId) => {
  requireMethod(req, "GET"); const user = await requireAdmin(req); const supabase = getServiceClient()
  const [{ data: tasks, error: taskError }, { data: executions, error: executionError }] = await Promise.all([
    supabase.from("tasks").select("workflow_status, selected_execution_option_snapshot").eq("owner_user_id", user.id),
    supabase.from("executions").select("status,satisfaction_score,option_snapshot").eq("owner_user_id", user.id),
  ]); if (taskError) throw taskError; if (executionError) throw executionError
  const byStatus = Object.groupBy(tasks, (task) => task.workflow_status); const byRoute = Object.groupBy(executions, (execution) => execution.option_snapshot?.route || "unknown"); const scores = executions.map((item) => item.satisfaction_score).filter(Number.isInteger)
  sendJson(res, 200, { ok: true, dashboard: { taskCount: tasks.length, tasksByStatus: Object.fromEntries(Object.entries(byStatus).map(([key, value]) => [key, value.length])), executionsByRoute: Object.fromEntries(Object.entries(byRoute).map(([key, value]) => [key, value.length])), completionCount: executions.filter((item) => item.status === "completed").length, averageSatisfaction: scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null } }, traceId)
})
