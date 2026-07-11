import { createHash, randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

export class ApiError extends Error {
  constructor(status, message, code = "request_failed") { super(message); this.status = status; this.code = code }
}

function positiveInteger(name, fallback) {
  const raw = process.env[name]
  if (raw == null || raw === "") return fallback
  const value = Number(raw)
  if (!Number.isSafeInteger(value) || value <= 0) throw new ApiError(500, "Server configuration is incomplete.", "configuration_error")
  return value
}

export function getConfig() {
  const required = ["SUPABASE_URL", "SUPABASE_SECRET_KEY", "SUPABASE_PUBLISHABLE_KEY", "ADMIN_USER_ID"]
  if (required.some((name) => !process.env[name])) throw new ApiError(500, "Server configuration is incomplete.", "configuration_error")
  return {
    supabaseUrl: process.env.SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    adminUserId: process.env.ADMIN_USER_ID,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    agentDailyQuota: positiveInteger("AGENT_DAILY_QUOTA", 25),
    agentCooldownSeconds: positiveInteger("AGENT_COOLDOWN_SECONDS", 10),
    agentTimeoutMs: positiveInteger("AGENT_TIMEOUT_MS", 60000),
  }
}

let clientFactory = createClient
export function setClientFactoryForTests(factory) { clientFactory = factory || createClient }
export function getServiceClient() { const c = getConfig(); return clientFactory(c.supabaseUrl, c.secretKey, { auth: { persistSession: false } }) }
export async function requireAdmin(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "")
  if (!token) throw new ApiError(401, "Please sign in before using this action.", "unauthenticated")
  const c = getConfig(); const client = clientFactory(c.supabaseUrl, c.publishableKey, { auth: { persistSession: false } }); const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) throw new ApiError(401, "Your session is no longer valid. Please sign in again.", "invalid_session")
  if (data.user.id !== c.adminUserId) throw new ApiError(403, "This pilot is available only to the configured workspace administrator.", "forbidden")
  return data.user
}
export async function readBody(req) { if (req.body && typeof req.body === "object") return req.body; if (typeof req.body === "string") { try { return JSON.parse(req.body) } catch { throw new ApiError(400, "Request body must be valid JSON.", "invalid_json") } } return {} }
export function requestId(req) { const value = req.headers["x-request-id"]; return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value) ? value : randomUUID() }
export function requireIdempotencyKey(req) { const key = req.headers["idempotency-key"]; if (!key || typeof key !== "string" || key.length > 200) throw new ApiError(400, "This action needs a valid Idempotency-Key header.", "missing_idempotency_key"); return key }
export function hashBody(body) { return createHash("sha256").update(JSON.stringify(body)).digest("hex") }
export function sendJson(res, status, body, traceId) { res.setHeader("content-type", "application/json"); res.setHeader("x-request-id", traceId); res.status(status).json({ ...body, requestId: traceId }) }
export function requireMethod(req, method) { if (req.method !== method) throw new ApiError(405, "This endpoint does not support that method.", "method_not_allowed") }

const databaseErrors = {
  idempotency_conflict: [409, "This idempotency key was already used for a different request."],
  version_conflict: [409, "This task changed or can no longer be edited. Reload and try again."],
  analysis_conflict: [409, "This task cannot be analyzed in its current state."], approval_conflict: [409, "Only an analyzed task can be approved."],
  governance_blocked: [409, "Governance blocked this action."], launch_conflict: [409, "Only an approved task can be launched."],
  launch_requires_accepted_output: [409, "Agent and Hybrid launch requires accepted Agent output."], attachment_conflict: [409, "This task cannot receive attachments."],
  attachment_count_limit: [409, "A task can have at most five attachments."], attachment_character_limit: [409, "Attachments exceed the task character limit."],
  agent_requires_approved_task: [409, "Live Agent requires an approved task."], agent_requires_human_approval: [409, "Live Agent requires Human approval."],
  agent_route_ineligible: [409, "This deterministic route is not eligible for Live Agent."], sensitivity_blocked: [409, "High-sensitivity data must use Human or Hybrid execution."],
  daily_quota_reached: [429, "Daily Live Agent quota reached."], agent_cooldown: [429, "Wait before starting another Live Agent run."],
  active_run_conflict: [409, "A Live Agent run is already active."], active_or_attempt_conflict: [409, "An Agent run conflict occurred. Reload and try again."], attempts_exhausted: [409, "Live Agent attempts are exhausted."],
  outcome_conflict: [409, "No launched execution is waiting for an outcome."], archive_conflict: [409, "This task cannot be archived."], delete_conflict: [409, "Only an archived task can be deleted permanently."],
  review_requires_completed_run: [409, "Post-output review requires a completed Agent run."], invalid_post_output_action: [400, "Invalid post-output review action."],
}
export function mapDatabaseError(error) { const entry = databaseErrors[error?.message]; if (entry) return new ApiError(entry[0], entry[1], error.message); if (error?.code === "23505") return new ApiError(409, "A conflicting command already completed.", "conflict"); return error }
export async function rpc(supabase, name, params) { const { data, error } = await supabase.rpc(name, params); if (error) throw mapDatabaseError(error); return data }
export function withApi(handler) { return async (req, res) => { const traceId = requestId(req); try { await handler(req, res, traceId) } catch (error) { const safe = error instanceof ApiError ? error : new ApiError(500, "We could not complete that request. Try again or use the request ID when asking for help.", "internal_error"); console.error(`[${traceId}] ${safe.code}`); sendJson(res, safe.status, { ok: false, error: { code: safe.code, message: safe.message } }, traceId) } } }
