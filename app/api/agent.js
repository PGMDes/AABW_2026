import { buildBoundedAttachmentContext, validateAgentOutput } from "../server/agentPolicy.js"
import { ApiError, getConfig, getServiceClient, hashBody, readBody, requireAdmin, requireIdempotencyKey, requireMethod, rpc, sendJson, withApi } from "./_lib.js"

const schema = { type: "object", additionalProperties: false, required: ["draft", "summary", "warnings", "limitations", "sources"], properties: { draft: { type: "string" }, summary: { type: "string" }, warnings: { type: "array", items: { type: "string" } }, limitations: { type: "array", items: { type: "string" } }, sources: { type: "array", items: { type: "object", additionalProperties: false, required: ["fileName", "excerpt"], properties: { fileName: { type: "string" }, excerpt: { type: "string" } } } } } }

function safeRun(run) {
  return { id: run.id, task_id: run.task_id, task_flow_id: run.task_flow_id, task_version: run.task_version, flow_version: run.flow_version, attempt_number: run.attempt_number, status: run.status, provider: run.provider, requested_model: run.requested_model, returned_model: run.returned_model, normalized_output: run.normalized_output, normalized_error: run.normalized_error, started_at: run.started_at, completed_at: run.completed_at }
}

export async function callProvider(config, snapshot) {
  if (!config.openaiApiKey) throw new ApiError(503, "Live Agent is not configured on this deployment.", "agent_unavailable")
  if (!snapshot?.task || !Array.isArray(snapshot.attachments)) throw new ApiError(409, "The authorized Agent input snapshot is unavailable.", "invalid_agent_snapshot")
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.agentTimeoutMs)
  try {
    const task = snapshot.task
    const context = buildBoundedAttachmentContext(snapshot.attachments.map((item) => ({ fileName: item.fileName, extractedText: item.extractedText })), 100000)
    const prompt = `You are a governed drafting assistant for SymbiontOS. Produce draft content only. Never change routing, governance, policy, Human approval, or launch eligibility.

Task: ${task.title}
${task.description}
Expected output: ${task.expectedOutput}

Approved sources:
${context || "No attachments."}`
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", signal: controller.signal, headers: { Authorization: `Bearer ${config.openaiApiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model: config.openaiModel, input: prompt, text: { format: { type: "json_schema", name: "symbiont_agent_output", strict: true, schema } } }) })
    const payload = await response.json()
    if (!response.ok) throw new ApiError(502, "The AI provider could not complete this draft.", "provider_error")
    return { providerRunId: payload.id || null, returnedModel: payload.model || config.openaiModel, output: validateAgentOutput(JSON.parse(payload.output_text || "{}")) }
  } catch (error) {
    if (error.name === "AbortError") throw new ApiError(504, "Live Agent timed out.", "agent_timeout")
    if (!(error instanceof ApiError) && error instanceof SyntaxError) throw new ApiError(502, "The AI provider returned invalid output.", "invalid_provider_output")
    throw error
  } finally { clearTimeout(timer) }
}

export async function executeAgentRun({ user, body, key, traceId, supabase = getServiceClient(), config = getConfig() }) {
  const claim = await rpc(supabase, "phase22_claim_agent_run", { p_owner_user_id: user.id, p_task_id: body.taskId, p_idempotency_key: key, p_request_hash: hashBody(body), p_provider: "openai", p_model: config.openaiModel, p_trace_id: traceId, p_daily_quota: config.agentDailyQuota, p_cooldown_seconds: config.agentCooldownSeconds, p_stale_seconds: Math.max(120, Math.ceil(config.agentTimeoutMs / 1000) * 2) })
  const runId = claim.resource_id || claim.response_body?.run_id
  const { data: run, error: runError } = await supabase.from("agent_runs").select("*").eq("id", runId).eq("owner_user_id", user.id).single()
  if (runError) throw runError
  if (claim.claimed === false || run.status !== "running") {
    const status = claim.response_status || ({ completed: 200, failed: 502, timed_out: 504 }[run.status] || 202)
    return { status, body: { ok: run.status === "completed", status: run.status, agentRun: safeRun(run) } }
  }
  try {
    const result = await callProvider(config, run.input_snapshot)
    await rpc(supabase, "phase22_complete_agent_run", { p_owner_user_id: user.id, p_run_id: run.id, p_idempotency_key: key, p_status: "completed", p_provider_run_id: result.providerRunId, p_returned_model: result.returnedModel, p_output: result.output, p_error: null })
    const { data: completed, error } = await supabase.from("agent_runs").select("*").eq("id", run.id).single()
    if (error) throw error
    return { status: 200, body: { ok: true, agentRun: safeRun(completed) } }
  } catch (error) {
    await rpc(supabase, "phase22_complete_agent_run", { p_owner_user_id: user.id, p_run_id: run.id, p_idempotency_key: key, p_status: error.code === "agent_timeout" ? "timed_out" : "failed", p_provider_run_id: null, p_returned_model: null, p_output: null, p_error: { code: error.code || "provider_error", requestId: traceId } })
    throw error
  }
}

export default withApi(async (req, res, traceId) => { requireMethod(req, "POST"); const user = await requireAdmin(req); const body = await readBody(req); const key = requireIdempotencyKey(req); const result = await executeAgentRun({ user, body, key, traceId }); sendJson(res, result.status, result.body, traceId) })
