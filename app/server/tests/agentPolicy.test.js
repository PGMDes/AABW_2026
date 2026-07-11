import test from "node:test"
import assert from "node:assert/strict"
import {
  buildBoundedAttachmentContext,
  classifySensitivity,
  validateAgentOutput,
} from "../agentPolicy.js"
import { canTransitionTask } from "../workflow.js"

const validOutput = {
  draft: "A useful draft",
  summary: "Short summary",
  warnings: [],
  limitations: ["Human review required"],
  sources: [{ fileName: "context.md", excerpt: "Relevant source text" }],
}

test("high sensitivity always blocks provider use", () => {
  assert.equal(classifySensitivity({ declaredSensitivity: "high", text: "ordinary" }).blocked, true)
  assert.equal(classifySensitivity({ declaredSensitivity: "low", text: "OPENAI_API_KEY=secret" }).blocked, true)
})

test("agent output must match the production schema", () => {
  assert.deepEqual(validateAgentOutput(validOutput), validOutput)
  assert.throws(() => validateAgentOutput({ draft: "missing fields" }), /invalid agent output/i)
})

test("attachment context stays within the configured bound", () => {
  const context = buildBoundedAttachmentContext([
    { fileName: "a.md", extractedText: "a".repeat(80) },
    { fileName: "b.txt", extractedText: "b".repeat(80) },
  ], 100)

  assert.equal(context.length <= 100, true)
  assert.match(context, /a\.md/)
})

test("task lifecycle permits only explicit transitions", () => {
  assert.equal(canTransitionTask("draft", "analyzed"), true)
  assert.equal(canTransitionTask("draft", "completed"), false)
  assert.equal(canTransitionTask("completed", "archived"), true)
})
