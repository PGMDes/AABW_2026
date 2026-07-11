import { expect,test } from "@playwright/test"
test("renders the approved five-item navigation baseline",async({page})=>{await page.goto("/");await expect(page.getByRole("navigation",{name:"Primary navigation"}).getByRole("button")).toHaveText(["Action Queue","Cases","Governance","Catalog","Activity"]);await expect(page.getByRole("heading",{name:"Action Queue"})).toBeVisible()})
test("renders the action queue without horizontal overflow",async({page})=>{await page.goto("/");expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)})
