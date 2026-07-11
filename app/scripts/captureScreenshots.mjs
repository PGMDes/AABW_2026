import { mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium, expect } from "@playwright/test"
import { createServer } from "vite"

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const repoRoot = resolve(appRoot, "..")
const screenshotsDir = resolve(repoRoot, "docs", "assets", "screenshots")
const host = "127.0.0.1"
const preferredPort = 4181
const preferredBaseURL = `http://${host}:${preferredPort}`
const storagePrefix = "humanAgentOS."
const viewport = { width: 1440, height: 1100 }

const screenshotFiles = {
  dashboard: "01_dashboard.png",
  recommendationAgent: "02_recommendation_agent_path.png",
  agentRunnerReview: "03_agent_runner_output_review.png",
  hybridHumanGate: "04_hybrid_human_gate.png",
  blockedPolicyPath: "05_blocked_policy_path.png",
  auditLifecycle: "06_audit_lifecycle.png",
}

function trimTrailingSlash(url) {
  return url.replace(/\/+$/, "")
}

async function canReuseAppServer(baseURL) {
  try {
    const response = await fetch(baseURL, {
      signal: AbortSignal.timeout(2_000),
    })

    if (!response.ok) {
      return false
    }

    const html = await response.text()

    return html.includes("<title>SymbiontOS</title>")
  } catch {
    return false
  }
}

async function getServerTarget() {
  const explicitBaseURL =
    process.env.SCREENSHOT_BASE_URL || process.env.PLAYWRIGHT_BASE_URL

  if (explicitBaseURL) {
    const baseURL = trimTrailingSlash(explicitBaseURL)

    if (await canReuseAppServer(baseURL)) {
      return { baseURL, server: null, reused: true }
    }

    throw new Error(
      `SCREENSHOT_BASE_URL/PLAYWRIGHT_BASE_URL did not serve SymbiontOS: ${baseURL}`,
    )
  }

  if (await canReuseAppServer(preferredBaseURL)) {
    return { baseURL: preferredBaseURL, server: null, reused: true }
  }

  const server = await createServer({
    root: appRoot,
    configFile: resolve(appRoot, "vite.config.js"),
    server: {
      host,
      port: preferredPort,
      strictPort: false,
    },
  })

  await server.listen()

  const resolvedBaseURL =
    server.resolvedUrls?.local?.find((url) => url.includes(host)) ||
    preferredBaseURL

  return {
    baseURL: trimTrailingSlash(resolvedBaseURL),
    server,
    reused: false,
  }
}

function primaryNav(page) {
  return page.getByRole("navigation", { name: "Primary navigation" })
}

async function stabilizePage(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready
    }
  })
  await page.waitForTimeout(150)
}

async function resetLocalDemoState(page, baseURL) {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" })
  await page.evaluate((prefix) => {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(prefix)) {
        window.localStorage.removeItem(key)
      }
    }
  }, storagePrefix)
  await page.goto(baseURL, { waitUntil: "networkidle" })
  await expect(page.getByRole("heading", { name: "SymbiontOS" })).toBeVisible()
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

async function capture(page, filename) {
  const path = resolve(screenshotsDir, filename)

  await stabilizePage(page)
  await page.screenshot({
    path,
    fullPage: true,
  })
  console.log(`Captured ${path}`)
}

async function captureDashboard(page, baseURL) {
  await resetLocalDemoState(page, baseURL)
  await expect(page.getByRole("heading", { name: "Task queue" })).toBeVisible()
  await expect(page.getByText("Approved for launch").first()).toBeVisible()
  await capture(page, screenshotFiles.dashboard)
}

async function captureAgentRecommendation(page, baseURL) {
  await resetLocalDemoState(page, baseURL)
  await analyzeScenario(page, "Agent path")
  await expect(page.getByText("85% confidence")).toBeVisible()
  await expect(page.getByText("Approved for launch").first()).toBeVisible()
  await expect(page.getByText("Research Analyst Agent")).toBeVisible()
  await capture(page, screenshotFiles.recommendationAgent)
}

async function captureAgentRunnerOutputReview(page, baseURL) {
  await resetLocalDemoState(page, baseURL)
  await analyzeScenario(page, "Agent path")
  await continueToDetail(page)
  await page.getByRole("button", { name: "Run demo agent" }).click()
  await expect(page.getByTestId("agent-runner")).toContainText("Agent output")
  await expect(page.getByTestId("agent-output-review")).toContainText(
    "Human decision pending",
  )
  await capture(page, screenshotFiles.agentRunnerReview)
}

async function captureHybridHumanGate(page, baseURL) {
  await resetLocalDemoState(page, baseURL)
  await analyzeScenario(page, "Hybrid path")
  await continueToDetail(page)
  await expect(page.getByTestId("agent-runner")).toContainText(
    "Waiting for Human review",
  )
  await expect(page.getByRole("button", { name: "Run demo agent" })).toHaveCount(0)
  await capture(page, screenshotFiles.hybridHumanGate)
}

async function captureBlockedPolicyPath(page, baseURL) {
  await resetLocalDemoState(page, baseURL)
  await analyzeScenario(page, "Blocked")
  await continueToDetail(page)
  await expect(page.getByText("No execution option is selected")).toBeVisible()
  await expect(page.getByTestId("agent-runner")).toContainText("Policy blocked")
  await expect(page.getByRole("button", { name: "Run demo agent" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Accept output" })).toHaveCount(0)
  await expect(page.getByTestId("agent-output-review")).toHaveCount(0)
  await capture(page, screenshotFiles.blockedPolicyPath)
}

async function captureAuditLifecycle(page, baseURL) {
  await resetLocalDemoState(page, baseURL)
  await analyzeScenario(page, "Agent path")
  await continueToDetail(page)
  await page.getByRole("button", { name: "Run demo agent" }).click()
  await page.getByRole("button", { name: "Accept output" }).click()
  await expect(page.getByTestId("agent-output-review")).toContainText(
    "Accepted for use",
  )
  await expect(page.getByText("Agent output review decision")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Execution lifecycle" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Audit trail" })).toBeVisible()
  await capture(page, screenshotFiles.auditLifecycle)
}

let server
let browser

try {
  const target = await getServerTarget()
  server = target.server

  console.log(
    target.reused
      ? `Reusing SymbiontOS server at ${target.baseURL}`
      : `Started SymbiontOS screenshot server at ${target.baseURL}`,
  )

  await mkdir(screenshotsDir, { recursive: true })

  browser = await chromium.launch()
  const page = await browser.newPage({ viewport })

  await captureDashboard(page, target.baseURL)
  await captureAgentRecommendation(page, target.baseURL)
  await captureAgentRunnerOutputReview(page, target.baseURL)
  await captureHybridHumanGate(page, target.baseURL)
  await captureBlockedPolicyPath(page, target.baseURL)
  await captureAuditLifecycle(page, target.baseURL)

  console.log("Screenshot capture complete.")
} finally {
  if (browser) {
    await browser.close()
  }

  if (server) {
    await server.close()
  }
}
