import { expect, test } from "@playwright/test"

async function openHybridCase(page) {
  await page.goto("/")
  await page.getByRole("button", { name: "New Task" }).click()
  await page.getByLabel("Load demo scenario").selectOption({
    label: "Hybrid path",
  })
  await page.getByRole("button", { name: "Analyze Task" }).click()
}

test("Hybrid Selection stays unavailable until governance approval", async ({
  page,
}) => {
  await openHybridCase(page)

  await expect(
    page.getByRole("button", { name: "Selection", exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByText("Available after governance approval", { exact: true }),
  ).toBeVisible()
})

test("case model keeps Hybrid Selection locked before approval", async ({
  page,
}) => {
  await page.goto("/")

  const caseModel = await page.evaluate(async () => {
    const { buildCaseViewModel } = await import(
      "/src/logic/caseViewModel.js"
    )

    return buildCaseViewModel({
      task: { id: "task_002" },
      analysis: { taskId: "task_002" },
      recommendation: { recommendedPath: "hybrid" },
      governance: {
        status: "needs_human_review",
        approvalRequired: true,
        allowedPaths: ["human", "hybrid"],
        blockedPaths: ["agent"],
      },
      humanReview: {
        required: true,
        decision: null,
      },
      options: [{ id: "hybrid_option", eligible: true }],
      execution: { launchStatus: "pending_approval" },
    })
  })

  expect(caseModel.stages.map((stage) => stage.id)).toEqual([
    "intake",
    "analysis",
    "decision",
    "governance",
    "selection",
    "execution",
    "outcome",
  ])
  expect(caseModel.stages.find((stage) => stage.id === "selection")).toEqual(
    expect.objectContaining({
      available: false,
      completed: false,
      lockReason: "Available after governance approval",
    }),
  )
  expect(caseModel.nextAction).toEqual(
    expect.objectContaining({
      stageId: "governance",
      label: "Review governance",
    }),
  )
})

test("case selections persist separately from engine recommendations", async ({
  page,
}) => {
  await page.goto("/")

  const selections = await page.evaluate(async () => {
    const {
      clearCaseSelection,
      loadCaseSelections,
      saveCaseSelection,
    } = await import("/src/logic/caseSelectionStore.js")

    localStorage.clear()
    saveCaseSelection("task_002", "hybrid_option")
    const saved = loadCaseSelections()
    clearCaseSelection("task_002")

    return {
      saved,
      cleared: loadCaseSelections(),
    }
  })

  expect(selections.saved).toEqual({ task_002: "hybrid_option" })
  expect(selections.cleared).toEqual({})
})
