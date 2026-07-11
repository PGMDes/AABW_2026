import { expect, test } from "@playwright/test"
import { buildCaseViewModel } from "../src/logic/caseViewModel.js"

test("locks hybrid selection until governance approval", () => {
  const model = buildCaseViewModel({
    analysis: {}, recommendation: {},
    governance: { status: "needs_human_review", approvalRequired: true },
    humanReview: { required: true, decision: null },
    options: [{ id: "hybrid", eligible: true }], selectedOption: { id: "hybrid" },
    execution: { launchStatus: "pending_approval" }, outcome: null,
  }, null, null, null)
  const selection = model.stages.find((stage) => stage.id === "selection")
  expect(selection.available).toBe(false)
  expect(selection.lockReason).toBe("Available after governance approval")
})
