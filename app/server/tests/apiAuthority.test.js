import test from "node:test"
import assert from "node:assert/strict"
import { getConfig, requireAdmin, setClientFactoryForTests } from "../../api/_lib.js"

const original = { ...process.env }
function configured() {
  Object.assign(process.env, {
    SUPABASE_URL: "http://127.0.0.1:54321",
    SUPABASE_SECRET_KEY: "test-secret-placeholder",
    SUPABASE_PUBLISHABLE_KEY: "test-publishable-placeholder",
    ADMIN_USER_ID: "11111111-1111-1111-1111-111111111111",
  })
}
test.afterEach(() => { process.env = { ...original }; setClientFactoryForTests() })

test("authorization rejects a request without bearer token", async () => {
  configured()
  await assert.rejects(() => requireAdmin({ headers: {} }), (error) => error.status === 401 && error.code === "unauthenticated")
})

test("authorization rejects an invalid JWT", async () => {
  configured(); setClientFactoryForTests(() => ({ auth: { getUser: async () => ({ data: {}, error: new Error("invalid") }) } }))
  await assert.rejects(() => requireAdmin({ headers: { authorization: "Bearer invalid" } }), (error) => error.status === 401 && error.code === "invalid_session")
})

test("authorization rejects a valid non-Admin identity", async () => {
  configured(); setClientFactoryForTests(() => ({ auth: { getUser: async () => ({ data: { user: { id: "22222222-2222-2222-2222-222222222222" } }, error: null }) } }))
  await assert.rejects(() => requireAdmin({ headers: { authorization: "Bearer valid" } }), (error) => error.status === 403 && error.code === "forbidden")
})

test("authorization accepts the exact configured Admin identity", async () => {
  configured(); setClientFactoryForTests(() => ({ auth: { getUser: async () => ({ data: { user: { id: process.env.ADMIN_USER_ID } }, error: null }) } }))
  const user = await requireAdmin({ headers: { authorization: "Bearer valid" } })
  assert.equal(user.id, process.env.ADMIN_USER_ID)
})

test("invalid numeric execution configuration fails closed", () => {
  configured(); process.env.AGENT_DAILY_QUOTA = "not-a-number"
  assert.throws(() => getConfig(), (error) => error.status === 500 && error.code === "configuration_error")
})
