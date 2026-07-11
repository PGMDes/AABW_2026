import { supabase } from "./supabaseClient.js"

function idempotencyKey() { return crypto.randomUUID() }

export async function apiRequest(path, { method = "GET", body, idempotent = false } = {}) {
  const { data } = await supabase.auth.getSession()
  const response = await fetch(`/api/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${data.session?.access_token || ""}`,
      "content-type": "application/json",
      ...(idempotent ? { "Idempotency-Key": idempotencyKey() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json()
  if (!response.ok) {
    const error = new Error(payload.error?.message || "Request failed")
    error.requestId = payload.requestId
    throw error
  }
  return payload
}

export async function uploadTaskAttachment(taskId, file) {
  const mimeType = file.name.toLowerCase().endsWith(".md") ? "text/markdown" : file.type || "text/plain"
  const signed = await apiRequest("attachments", { method: "POST", body: { action: "sign", taskId, fileName: file.name, mimeType, byteSize: file.size } })
  const { error } = await supabase.storage.from("task-attachments").uploadToSignedUrl(signed.upload.path, signed.upload.token, file, { contentType: mimeType })
  if (error) throw error
  return apiRequest("attachments", { method: "POST", body: { action: "confirm", taskId, fileName: file.name, mimeType, storagePath: signed.upload.path } })
}
