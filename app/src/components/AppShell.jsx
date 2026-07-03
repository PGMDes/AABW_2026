import { currentUser } from "../data"

function NavButton({ children, isActive, onClick }) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 ${
        isActive
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  )
}

export function AppShell({ children, currentPage, onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950 focus:ring-2 focus:ring-cyan-600"
      >
        Skip to main content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-700">Human-AgentOS</p>
            <p className="text-xs text-slate-500">
              {currentUser.name} - {currentUser.role}
            </p>
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
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
