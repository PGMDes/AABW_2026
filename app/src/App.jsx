import { useState } from "react"
import { AppShell } from "./components/AppShell"
import { DashboardPage } from "./pages/DashboardPage"
import { NewTaskPage } from "./pages/NewTaskPage"
import { RecommendationPage } from "./pages/RecommendationPage"
import { TaskDetailPage } from "./pages/TaskDetailPage"
import "./App.css"

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [activeTaskId, setActiveTaskId] = useState("task_001")

  function navigate(pageName, taskId = activeTaskId) {
    setActiveTaskId(taskId)
    setCurrentPage(pageName)
  }

  function handleAnalyzeTask(task) {
    setActiveTaskId(task.id)
    setCurrentPage("recommendation")
  }

  let page

  if (currentPage === "newTask") {
    page = <NewTaskPage onAnalyze={handleAnalyzeTask} />
  } else if (currentPage === "recommendation") {
    page = (
      <RecommendationPage
        activeTaskId={activeTaskId}
        onContinue={() => navigate("detail", activeTaskId)}
      />
    )
  } else if (currentPage === "detail") {
    page = (
      <TaskDetailPage
        activeTaskId={activeTaskId}
        onNavigate={navigate}
      />
    )
  } else {
    page = <DashboardPage onNavigate={navigate} />
  }

  return (
    <AppShell currentPage={currentPage} onNavigate={navigate}>
      {page}
    </AppShell>
  )
}

export default App
