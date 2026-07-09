import { expect, test } from "@playwright/test"

function primaryNav(page) {
  return page.getByRole("navigation", { name: "Primary navigation" })
}

async function openNewTask(page) {
  await primaryNav(page).getByRole("button", { name: "New Task" }).click()
  await expect(page.getByRole("heading", { name: "New Task" })).toBeVisible()
}

async function analyzeScenario(page, scenarioLabel) {
  await openNewTask(page)
  await page.getByLabel("Load demo scenario").selectOption({ label: scenarioLabel })
  await page.getByRole("button", { name: "Analyze Task" }).click()
  await expect(
    page.getByRole("heading", { name: "Recommendation Result", exact: true }),
  ).toBeVisible()
}

async function continueToDetail(page) {
  await page.getByRole("button", { name: "Continue to Detail" }).click()
  await expect(
    page.getByRole("heading", { name: "Task Detail", exact: true }),
  ).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("fresh load opens Dashboard and keeps Recommendation and Task Detail empty", async ({
  page,
}) => {
  await expect(page.getByRole("heading", { name: "Human-AgentOS" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Task queue" })).toBeVisible()

  await primaryNav(page).getByRole("button", { name: "Recommendation" }).click()
  await expect(
    page.getByRole("heading", { name: "No recommendation yet" }),
  ).toBeVisible()

  await primaryNav(page).getByRole("button", { name: "Task Detail" }).click()
  await expect(page.getByRole("heading", { name: "No task selected" })).toBeVisible()
})

test("task_001 runs the approved Agent path through output acceptance", async ({
  page,
}) => {
  await analyzeScenario(page, "Agent path")

  await expect(
    page.getByRole("heading", { name: "Recommendation result", exact: true }),
  ).toBeVisible()
  await expect(page.getByText("85% confidence")).toBeVisible()
  await expect(page.getByText("Approved for launch").first()).toBeVisible()
  await expect(page.getByText("Research Analyst Agent")).toBeVisible()

  await continueToDetail(page)

  await expect(page.getByTestId("agent-runner")).toContainText(
    "Ready to run demo agent",
  )
  await expect(page.getByLabel(/Deterministic demo runner/)).toBeChecked()
  await expect(page.getByLabel(/Optional live AI draft/)).toBeVisible()
  await page.getByRole("button", { name: "Run demo agent" }).click()
  await expect(page.getByTestId("agent-runner")).toContainText("Agent output")
  await expect(page.getByLabel("Router-Worker workflow")).toContainText(
    "Router decision",
  )
  await expect(page.getByLabel("Router-Worker workflow")).toContainText(
    "analysisWorker",
  )
  await expect(page.getByTestId("agent-output-review")).toContainText(
    "Human decision pending",
  )

  await page.getByRole("button", { name: "Accept output" }).click()
  await expect(page.getByTestId("agent-output-review")).toContainText(
    "Accepted for use",
  )
  await expect(page.getByText("Agent output review decision")).toBeVisible()
})

test("optional live draft falls back to deterministic output without network", async ({
  page,
}) => {
  await page.route("https://api.openai.com/v1/responses", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          message: "Mock provider unavailable",
        },
      }),
    })
  })

  await analyzeScenario(page, "Agent path")
  await continueToDetail(page)

  await page.getByLabel(/Optional live AI draft/).check()
  await page
    .getByLabel("Session API key for optional live AI draft")
    .fill("sk-test-key")
  await page.getByRole("button", { name: "Run live AI draft" }).click()

  await expect(page.getByText("Live AI draft did not complete.")).toBeVisible()
  await expect(
    page.getByText("Mock provider unavailable", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText("Deterministic demo output was saved as the fallback."),
  ).toBeVisible()
  await expect(page.getByTestId("agent-runner")).toContainText("Agent output")
  await expect(page.getByTestId("agent-output-review")).toContainText(
    "Human decision pending",
  )
})

test("task_002 waits for Human review before Agent run, then runs after approval", async ({
  page,
}) => {
  await analyzeScenario(page, "Hybrid path")

  await expect(page.getByText("Needs human review").first()).toBeVisible()
  await expect(
    page.getByText("Executive Memo Agent + Human Reviewer"),
  ).toBeVisible()

  await continueToDetail(page)

  await expect(page.getByTestId("agent-runner")).toContainText(
    "Waiting for Human review",
  )
  await expect(page.getByRole("button", { name: "Run demo agent" })).toHaveCount(0)
  await expect(page.getByLabel(/Optional live AI draft/)).toHaveCount(0)
  await expect(page.getByTestId("agent-output-review")).toHaveCount(0)

  await page.getByRole("button", { name: "Approve recommended option" }).click()
  await expect(page.getByTestId("agent-runner")).toContainText(
    "Ready to run demo agent",
  )
  await expect(page.getByLabel(/Optional live AI draft/)).toBeVisible()

  await page.getByRole("button", { name: "Run demo agent" }).click()
  await expect(page.getByTestId("agent-runner")).toContainText("Agent output")
  await expect(page.getByTestId("agent-output-review")).toContainText(
    "Human decision pending",
  )
})

test("task_003 blocks launch without Agent run or output review controls", async ({
  page,
}) => {
  await analyzeScenario(page, "Blocked")

  await expect(page.getByText("Blocked").first()).toBeVisible()
  await continueToDetail(page)

  await expect(page.getByText("No execution option is selected")).toBeVisible()
  await expect(page.getByTestId("agent-runner")).toContainText("Policy blocked")
  await expect(page.getByLabel(/Deterministic demo runner/)).toHaveCount(0)
  await expect(page.getByLabel(/Optional live AI draft/)).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Run demo agent" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Run live AI draft" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Accept output" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Request revision" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Reroute to Human" })).toHaveCount(0)
  await expect(page.getByTestId("agent-output-review")).toHaveCount(0)
  await expect(page.getByLabel("Router-Worker workflow")).toHaveCount(0)
})

test("reset local demo state clears saved Agent output and output review", async ({
  page,
}) => {
  await analyzeScenario(page, "Agent path")
  await continueToDetail(page)

  await page.getByRole("button", { name: "Run demo agent" }).click()
  await page.getByRole("button", { name: "Accept output" }).click()
  await expect(page.getByTestId("agent-output-review")).toContainText(
    "Accepted for use",
  )

  await page.getByRole("button", { name: "Back to Dashboard" }).click()
  await expect(
    page.getByText(
      "Local session: 0 custom tasks, 0 Human reviews, 1 Agent outputs, 1 output reviews.",
    ),
  ).toBeVisible()

  await page.getByRole("button", { name: "Reset local demo state" }).click()
  await expect(
    page.getByText(
      "Local session: 0 custom tasks, 0 Human reviews, 0 Agent outputs, 0 output reviews.",
    ),
  ).toBeVisible()

  await page
    .getByRole("button", {
      name: /Open Create internal market research brief about AI competitors task detail/,
    })
    .click()
  await expect(page.getByTestId("agent-runner")).toContainText(
    "Ready to run demo agent",
  )
  await expect(page.getByTestId("agent-output-review")).toHaveCount(0)
})
