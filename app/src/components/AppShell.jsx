import { currentUser } from "../data"

function NavButton({ children, isActive, onClick }) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      className={`nav-button ${isActive ? "nav-button--active" : ""}`}
    >
      {children}
    </button>
  )
}

export function AppShell({ children, currentPage, onNavigate }) {
  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950 focus:ring-2 focus:ring-cyan-600"
      >
        Skip to main content
      </a>
      <header className="app-topbar">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="brand-lockup">
            <span aria-hidden="true" className="brand-mark" />
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Human-AgentOS
              </p>
              <p className="text-sm text-slate-500">
                {currentUser.name} - {currentUser.role}
              </p>
            </div>
          </div>
          <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
            <NavButton
              isActive={currentPage === "dashboard"}
              onClick={() => onNavigate("dashboard")}
            >
              Dashboard
            </NavButton>
            <NavButton
              isActive={currentPage === "newTask"}
              onClick={() => onNavigate("newTask")}
            >
              New Task
            </NavButton>
            <NavButton
              isActive={currentPage === "recommendation"}
              onClick={() => onNavigate("recommendation")}
            >
              Recommendation
            </NavButton>
            <NavButton
              isActive={currentPage === "detail"}
              onClick={() => onNavigate("detail")}
            >
              Task Detail
            </NavButton>
          </nav>
        </div>
      </header>
      <main
        id="main-content"
        aria-label="Primary content"
        className="app-content mx-auto max-w-6xl px-4 py-8"
      >
        {children}
      </main>
    </div>
  )
}
