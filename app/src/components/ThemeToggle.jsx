import { useEffect, useState } from "react"

const storageKey = "symbiontos-theme"

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || "light")

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(storageKey, theme)
  }, [theme])

  const nextTheme = theme === "dark" ? "light" : "dark"

  return (
    <button type="button" className="theme-toggle" aria-label={`${nextTheme === "dark" ? "Dark" : "Light"} mode`} onClick={() => setTheme(nextTheme)}>
      {nextTheme === "dark" ? "Dark mode" : "Light mode"}
    </button>
  )
}
