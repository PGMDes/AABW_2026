import { getServiceClient, requireAdmin, requireMethod, sendJson, withApi } from "./_lib.js"

export default withApi(async (req, res, traceId) => {
  requireMethod(req, "GET"); await requireAdmin(req); const supabase = getServiceClient(); const { data, error } = await supabase.from("execution_options").select("*").eq("is_active", true).order("route"); if (error) throw error; sendJson(res, 200, { ok: true, options: data }, traceId)
})
