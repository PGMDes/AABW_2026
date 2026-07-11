import { expect, test } from "@playwright/test"

const approvedNavigationItems = [
  "Dashboard",
  "Tasks",
  "Governance",
  "Marketplace",
  "Activity",
]

test("renders the approved five-item navigation baseline", async ({ page }) => {
  await page.goto("/")

  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation",
  })

  await expect(primaryNavigation.getByRole("button")).toHaveText(
    approvedNavigationItems,
  )
  await expect(
    primaryNavigation.getByRole("button", { name: "Dashboard" }),
  ).toHaveAttribute("aria-current", "page")
})

test("renders the dashboard without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")

  await expect(page.getByRole("main", { name: "Primary content" })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390)
})
