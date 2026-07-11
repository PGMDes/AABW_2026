import { expect, test } from "@playwright/test"

test("uses the approved sidebar and neutral demo identity", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("banner").getByText("SymbiontOS")).toBeVisible()
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button"),
  ).toHaveText(["Action Queue", "Cases", "Governance", "Catalog", "Activity"])
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", {
      name: "New case",
    }),
  ).toHaveCount(0)
  await expect(page.getByText("Workspace administrator")).toBeVisible()
  await expect(page.getByText("All systems operational")).toBeVisible()
})
test("keeps the desktop sidebar fixed and offsets the content canvas", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")

  const layout = await page.evaluate(() => {
    const sidebar = document.querySelector(".app-sidebar")
    const content = document.querySelector(".app-content")
    const sidebarRect = sidebar.getBoundingClientRect()
    const contentRect = content.getBoundingClientRect()

    return {
      sidebarPosition: getComputedStyle(sidebar).position,
      sidebarLeft: sidebarRect.left,
      contentLeft: contentRect.left,
      sidebarRight: sidebarRect.right,
    }
  })

  expect(layout.sidebarPosition).toBe("fixed")
  expect(layout.sidebarLeft).toBe(0)
  expect(layout.contentLeft).toBeGreaterThanOrEqual(layout.sidebarRight)
})

test("supports keyboard navigation and a skip link", async ({ page }) => {
  await page.goto("/")

  await page.keyboard.press("Tab")
  const skipLink = page.getByRole("link", { name: "Skip to main content" })
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeInViewport()
  await page.keyboard.press("Enter")
  await expect(page.locator("#main-content")).toBeFocused()

  await page.getByRole("button", { name: "Action Queue" }).focus()
  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "Cases" })).toBeFocused()
})

test("persists dark mode locally", async ({ page }) => {
  await page.goto("/")

  await page.getByRole("button", { name: "Dark mode" }).click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")

  await page.reload()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
})

test("collapses navigation on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")

  await page.getByRole("button", { name: "Open navigation" }).click()
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible()

  await page.getByRole("button", { name: "Cases" }).click()
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible()
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeHidden()
})

test("closes the confirmation dialog on Escape and traps focus", async ({ page }) => {
  await page.goto("/confirm-dialog-test.html")
  const openButton = page.getByRole("button", { name: "Open launch dialog" })
  await openButton.click()

  const dialog = page.getByRole("dialog", { name: "Launch this option?" })
  const cancelButton = page.getByRole("button", { name: "Cancel" })
  const confirmButton = page.getByRole("button", { name: "Launch", exact: true })
  await expect(dialog).toBeVisible()
  await expect(cancelButton).toBeFocused()

  await page.keyboard.press("Shift+Tab")
  await expect(confirmButton).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(cancelButton).toBeFocused()

  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(openButton).toBeFocused()
})

test("honors reduced motion styling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const reducedMotion = await page.evaluate(() => {
    const skeleton = document.createElement("span")
    skeleton.className = "reduced-motion-probe"
    document.body.append(skeleton)
    const styles = getComputedStyle(skeleton)

    return {
      animationDuration: styles.animationDuration,
      transitionDuration: styles.transitionDuration,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    }
  })

  expect(reducedMotion.animationDuration).toBe("1e-05s")
  expect(reducedMotion.transitionDuration).toBe("1e-05s")
  expect(reducedMotion.scrollBehavior).toBe("auto")
})

test("keeps dark theme tokens and shell contrast distinct", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Dark mode" }).click()

  const themeContract = await page.evaluate(() => {
    function contrastRatio(foreground, background) {
      const channels = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number)
      const luminance = (color) => {
        const [red, green, blue] = channels(color).map((channel) => {
          const value = channel / 255
          return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * red + 0.7152 * green + 0.0722 * blue
      }
      const lighter = Math.max(luminance(foreground), luminance(background))
      const darker = Math.min(luminance(foreground), luminance(background))
      return (lighter + 0.05) / (darker + 0.05)
    }

    const rootStyles = getComputedStyle(document.documentElement)
    const sidebarStyles = getComputedStyle(document.querySelector(".app-sidebar"))
    const navStyles = getComputedStyle(document.querySelector(".sidebar-nav__item"))
    const shellStyles = getComputedStyle(document.querySelector(".app-shell"))
    const contentStyles = getComputedStyle(document.querySelector(".app-content"))
    const semanticTokens = [
      "--route-dashboard",
      "--route-tasks",
      "--route-marketplace",
      "--governance-review",
      "--governance-blocked",
      "--governance-approved",
    ].map((token) => rootStyles.getPropertyValue(token).trim())

    return {
      theme: document.documentElement.dataset.theme,
      semanticTokens,
      sidebarContrast: contrastRatio(navStyles.color, sidebarStyles.backgroundColor),
      canvasContrast: contrastRatio(contentStyles.color, shellStyles.backgroundColor),
    }
  })

  expect(themeContract.theme).toBe("dark")
  expect(new Set(themeContract.semanticTokens).size).toBe(themeContract.semanticTokens.length)
  expect(themeContract.sidebarContrast).toBeGreaterThanOrEqual(4.5)
  expect(themeContract.canvasContrast).toBeGreaterThanOrEqual(4.5)
})

