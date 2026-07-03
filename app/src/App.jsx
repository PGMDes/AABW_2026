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
  const [activeTaskId, setActiveTaskId] = useState("task_001")
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

  function navigate(pageName, taskId = activeTaskId) {
    setActiveTaskId(taskId)
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

    setActiveTaskId(task.id)
    setCurrentPage("recommendation")
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

    if (!demoTasks.some((task) => task.id === activeTaskId)) {
      setActiveTaskId("task_001")
    }

    setCurrentPage("dashboard")
  }

  const activeTask =
    allTasks.find((task) => task.id === activeTaskId) || demoTasksWithSource[0]
  const activeFlowResult = buildTaskFlow(
    activeTask,
    humanReviewDecisions[activeTaskId],
  )

  let page

  if (currentPage === "newTask") {
    page = (
      <NewTaskPage existingTaskIds={allTaskIds} onAnalyze={handleAnalyzeTask} />
    )
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
