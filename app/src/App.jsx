import { useState } from "react"
import { AppShell } from "./components/AppShell"
import { tasks as demoTasks } from "./data"
import {
  clearStoredLocalSession,
  getStoredCustomTasks,
  getStoredHumanReviewDecisions,
  saveStoredCustomTasks,
  saveStoredHumanReviewDecisions,
} from "./logic/localSessionStore"
import { buildTaskFlow } from "./logic/taskFlowEngine"
import { DashboardPage } from "./pages/DashboardPage"
import { NewTaskPage } from "./pages/NewTaskPage"
import { RecommendationPage } from "./pages/RecommendationPage"
import { TaskDetailPage } from "./pages/TaskDetailPage"
import "./App.css"

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [analyzedTaskId, setAnalyzedTaskId] = useState(null)
  const [customTasks, setCustomTasks] = useState(() => getStoredCustomTasks())
  const [humanReviewDecisions, setHumanReviewDecisions] = useState(() =>
    getStoredHumanReviewDecisions(),
  )

  const demoTasksWithSource = demoTasks.map((task) => ({
    ...task,
    source: "demo",
  }))
  const allTasks = [...demoTasksWithSource, ...customTasks]
  const allTaskIds = allTasks.map((task) => task.id)

  function getTaskById(taskId) {
    if (!taskId) return null

    return allTasks.find((task) => task.id === taskId) || null
  }

  function navigate(pageName, taskId = null) {
    if (pageName === "detail" && taskId) {
      setSelectedTaskId(taskId)
    }

    setCurrentPage(pageName)
  }

  function handleAnalyzeTask(task) {
    if (task.source === "local") {
      setCustomTasks((currentTasks) => {
        const nextTasks = [
          ...currentTasks.filter((currentTask) => currentTask.id !== task.id),
          task,
        ]

        saveStoredCustomTasks(nextTasks)

        return nextTasks
      })
    }

    setAnalyzedTaskId(task.id)
    setSelectedTaskId(null)
    setCurrentPage("recommendation")
  }

  function handleContinueToDetail() {
    if (analyzedTaskId) {
      setSelectedTaskId(analyzedTaskId)
    }

    setCurrentPage("detail")
  }

  function handleHumanReviewDecision(taskId, action) {
    setHumanReviewDecisions((currentDecisions) => {
      const nextDecisions = {
        ...currentDecisions,
        [taskId]: {
          taskId,
          action,
        },
      }

      saveStoredHumanReviewDecisions(nextDecisions)

      return nextDecisions
    })
  }

  function handleResetLocalState() {
    clearStoredLocalSession()
    setCustomTasks([])
    setHumanReviewDecisions({})
    setSelectedTaskId(null)
    setAnalyzedTaskId(null)
    setCurrentPage("dashboard")
  }

  const analyzedTask = getTaskById(analyzedTaskId)
  const analyzedFlowResult = analyzedTask
    ? buildTaskFlow(analyzedTask, humanReviewDecisions[analyzedTask.id])
    : null
  const detailTaskId = selectedTaskId || analyzedTaskId
  const detailTask = getTaskById(detailTaskId)
  const detailFlowResult = detailTask
    ? buildTaskFlow(detailTask, humanReviewDecisions[detailTask.id])
    : null

  let page

  if (currentPage === "newTask") {
    page = (
      <NewTaskPage existingTaskIds={allTaskIds} onAnalyze={handleAnalyzeTask} />
    )
  } else if (currentPage === "recommendation") {
    page = (
      <RecommendationPage
        flowResult={analyzedFlowResult}
        onContinue={handleContinueToDetail}
        onNewTask={() => navigate("newTask")}
      />
    )
  } else if (currentPage === "detail") {
    page = (
      <TaskDetailPage
        flowResult={detailFlowResult}
        onNavigate={navigate}
        onHumanReviewDecision={handleHumanReviewDecision}
      />
    )
  } else {
    page = (
      <DashboardPage
        customTaskCount={customTasks.length}
        humanReviewDecisions={humanReviewDecisions}
        onNavigate={navigate}
        onResetLocalState={handleResetLocalState}
        tasks={allTasks}
      />
    )
  }

  return (
    <AppShell currentPage={currentPage} onNavigate={navigate}>
      {page}
    </AppShell>
  )
}

export default App
