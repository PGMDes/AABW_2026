import { useEffect, useState } from "react"
import { currentUser } from "../data"
import { ThemeToggle } from "./ThemeToggle"

const navigationItems = [
  { id: "dashboard", label: "Action Queue" },
  { id: "cases", label: "Cases" },
  { id: "governance", label: "Governance" },
  { id: "marketplace", label: "Catalog" },
  { id: "activity", label: "Activity" },
]

function NavButton({ item, currentPage, onNavigate }) {
  return (
    <button
      type="button"
      aria-current={currentPage === item.id ? "page" : undefined}
      className={`sidebar-nav__item ${currentPage === item.id ? "sidebar-nav__item--active" : ""}`}
      onClick={() => onNavigate(item.id)}
    >
      <span aria-hidden="true" className="sidebar-nav__dot" />
      {item.label}
    </button>
  )
}

export function AppShell({ children, currentPage, onNavigate }) {
  const [navigationOpen, setNavigationOpen] = useState(false)

  useEffect(() => {
    function closeNavigation(event) {
      if (event.key === "Escape") {
        setNavigationOpen(false)
      }
    }

    window.addEventListener("keydown", closeNavigation)
    return () => window.removeEventListener("keydown", closeNavigation)
  }, [])

  function navigate(page) {
    onNavigate(page)
    setNavigationOpen(false)
  }

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <button
        type="button"
        aria-expanded={navigationOpen}
        aria-label={navigationOpen ? "Close navigation" : "Open navigation"}
        className="mobile-nav-toggle"
        onClick={() => setNavigationOpen((value) => !value)}
      >
        Menu
      </button>
      <button
        type="button"
        aria-label="Close navigation"
        className={`mobile-nav-backdrop ${navigationOpen ? "mobile-nav-backdrop--visible" : ""}`}
        onClick={() => setNavigationOpen(false)}
      />
      <header className={`app-sidebar ${navigationOpen ? "app-sidebar--open" : ""}`}>
        <div className="sidebar-brand">
          <span aria-hidden="true" className="sidebar-brand__mark">S</span>
          <div>
            <p>SymbiontOS</p>
            <span>Workforce control plane</span>
          </div>
        </div>
        <nav aria-label="Primary navigation" className="sidebar-nav">
          {navigationItems.map((item) => (
            <NavButton key={item.id} item={item} currentPage={currentPage} onNavigate={navigate} />
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="system-status"><span aria-hidden="true" />All systems operational</p>
          <ThemeToggle />
          <div className="sidebar-account">
            <span aria-hidden="true" className="sidebar-account__avatar">WA</span>
            <div>
              <strong>{currentUser.role || "Workspace administrator"}</strong>
              <span>{currentUser.context}</span>
            </div>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex="-1" aria-label="Primary content" className="app-content">
        {children}
      </main>
    </div>
  )
}
