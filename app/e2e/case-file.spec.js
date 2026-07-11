import { expect, test } from "@playwright/test"

test("Case Files shows the full journey and evidence for the selected stage", async ({
  page,
}) => {
  await page.goto("/")

  const caseFile = await page.evaluate(async () => {
    const { buildCaseViewModel } = await import("/src/logic/caseViewModel.js")
    const { getCaseStageEvidence } = await import(
      "/src/logic/caseEvidence.js"
    )

    const flowResult = {
      task: {
        id: "case_001",
        title: "Prepare a board briefing",
        description: "Summarize current AI transformation risks.",
      },
      analysis: { taskType: "research", sensitivity: "internal" },
      recommendation: { recommendedPath: "hybrid" },
      explanation: { summary: "A reviewer should validate the final briefing." },
      governance: { status: "needs_human_review", approvalRequired: true },
      humanReview: { required: true, decision: null },
      selectedOption: { id: "hybrid_research", name: "Research copilot" },
      options: [{ id: "hybrid_research", eligible: true }],
      execution: { launchStatus: "pending_approval" },
    }
    const caseModel = buildCaseViewModel(flowResult)

    return {
      stages: caseModel.stages.map((stage) => stage.label),
      evidence: getCaseStageEvidence(flowResult, caseModel, "governance"),
    }
  })

  expect(caseFile.stages).toEqual([
    "Intake",
    "Analysis",
    "Decision",
    "Governance",
    "Selection",
    "Execution",
    "Outcome",
  ])
  expect(caseFile.evidence).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ label: "Governance status", value: "needs_human_review" }),
      expect.objectContaining({ label: "Approval required", value: "Yes" }),
    ]),
  )
})
