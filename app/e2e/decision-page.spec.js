import { expect, test } from "@playwright/test"

async function analyzeScenario(page, scenarioLabel) {
  await page.goto("/")
  await page.getByRole("button", { name: "New Task" }).click()
  await page
    .getByLabel("Load demo scenario")
    .selectOption({ label: scenarioLabel })
  await page.getByRole("button", { name: "Analyze Task" }).click()
}

test("shows the Agent decision hierarchy without launching work", async ({ page }) => {
  await analyzeScenario(page, "Agent path")

  await expect(page.getByRole("status", { name: "Analyzing task" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Create internal market research brief about AI competitors" }),
  ).toBeVisible()
  await expect(page.getByLabel("Task progress")).toContainText(
    "1Intake2Analysis3Decision4Governance5Selection6Execution7Outcome",
  )
  await expect(page.getByLabel("Task progress").getByText("Decision")).toHaveAttribute(
    "aria-current",
    "step",
  )
  await expect(page.getByRole("heading", { name: "Agent recommendation" })).toBeVisible()
  await expect(page.getByText("85% confidence")).toBeVisible()
  await expect(page.getByLabel("Human fit score")).toHaveAttribute("aria-valuenow", "45")
  await expect(page.getByLabel("Agent fit score")).toHaveAttribute("aria-valuenow", "82")
  await expect(page.getByLabel("Hybrid fit score")).toHaveAttribute("aria-valuenow", "67")
  await expect(page.getByRole("heading", { name: "Why Agent" })).toBeVisible()
  await expect(page.getByText("Task is clearly defined")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Alternatives" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Route-changing conditions" })).toBeVisible()
  await expect(page.getByText("Use a trusted research agent")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Governance snapshot" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Eligible execution options" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Research Analyst Agent" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Continue to Detail" })).toBeVisible()
  await expect(page.getByRole("button", { name: /Run demo agent|Run live AI draft/ })).toHaveCount(0)
  await expect(page.getByTestId("agent-runner")).toHaveCount(0)
})

test("describes hybrid responsibilities from the selected option", async ({ page }) => {
  await analyzeScenario(page, "Hybrid path")

  await expect(page.getByRole("heading", { name: "Hybrid recommendation" })).toBeVisible()
  await expect(page.getByText("Agent prepares the first draft")).toBeVisible()
  await expect(page.getByText("Human reviewer validates the draft")).toBeVisible()
  await expect(page.getByText("Human review required").first()).toBeVisible()
})
