import { useState } from "react"
import { AppShell } from "./components/AppShell"
import { analyzeTask } from "./logic/analyzeTask"
import {
  buildRecommendation,
  buildRecommendationExplanation,
} from "./logic/recommendationEngine"
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
    const taskAnalysis = analyzeTask(task)
    const recommendation = buildRecommendation(taskAnalysis)
    const explanation = buildRecommendationExplanation(
      taskAnalysis,
      recommendation,
    )

    setGeneratedResult({
      task,
      analysis: taskAnalysis,
      recommendation,
      explanation,
    })
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
        generatedResult={generatedResult}
        onContinue={() => navigate("detail", activeTaskId)}
      />
    )
  } else if (currentPage === "detail") {
    page = (
      <TaskDetailPage
        activeTaskId={activeTaskId}
        generatedResult={generatedResult}
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
