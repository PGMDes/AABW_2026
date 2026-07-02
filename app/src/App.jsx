import { useState } from "react"
import { AppShell } from "./components/AppShell"
import { tasks } from "./data"
import { buildTaskFlow } from "./logic/taskFlowEngine"
import { DashboardPage } from "./pages/DashboardPage"
import { NewTaskPage } from "./pages/NewTaskPage"
import { RecommendationPage } from "./pages/RecommendationPage"
import { TaskDetailPage } from "./pages/TaskDetailPage"
import "./App.css"

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [activeTaskId, setActiveTaskId] = useState("task_001")
  const [generatedResult, setGeneratedResult] = useState(null)

  function navigate(pageName, taskId = activeTaskId) {
    setActiveTaskId(taskId)
    setCurrentPage(pageName)
  }

  function handleAnalyzeTask(task) {
    setGeneratedResult(buildTaskFlow(task))
    setActiveTaskId(task.id)
    setCurrentPage("recommendation")
  }

  const sampleTask = tasks.find((task) => task.id === activeTaskId) || tasks[0]
  const activeFlowResult =
    generatedResult?.task.id === activeTaskId
      ? generatedResult
      : buildTaskFlow(sampleTask)

  let page

  if (currentPage === "newTask") {
    page = <NewTaskPage onAnalyze={handleAnalyzeTask} />
  } else if (currentPage === "recommendation") {
    page = (
      <RecommendationPage
        flowResult={activeFlowResult}
        onContinue={() => navigate("detail", activeTaskId)}
      />
    )
  } else if (currentPage === "detail") {
    page = (
      <TaskDetailPage
        flowResult={activeFlowResult}
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
