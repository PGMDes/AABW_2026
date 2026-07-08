import { useState } from "react"
import { AppShell } from "./components/AppShell"
import { tasks as demoTasks } from "./data"
import {
  clearStoredLocalSession,
  getStoredAgentOutputReviewDecisions,
  getStoredAgentRunResults,
  getStoredCustomTasks,
  getStoredHumanReviewDecisions,
  saveStoredAgentOutputReviewDecisions,
  saveStoredAgentRunResults,
  saveStoredCustomTasks,
  saveStoredHumanReviewDecisions,
} from "./logic/localSessionStore"
import { createAgentOutputReviewDecision } from "./logic/agentOutputReview"
import { createDemoAgentRun } from "./logic/agentRunner"
import { createLiveAgentRun } from "./logic/liveAgentAdapter"
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
  const [agentRunResults, setAgentRunResults] = useState(() =>
    getStoredAgentRunResults(),
  )
  const [agentOutputReviewDecisions, setAgentOutputReviewDecisions] = useState(
    () => getStoredAgentOutputReviewDecisions(),
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

    setAgentRunResults((currentResults) => {
      const nextResults = { ...currentResults }
      delete nextResults[taskId]

      saveStoredAgentRunResults(nextResults)

      return nextResults
    })

    setAgentOutputReviewDecisions((currentDecisions) => {
      const nextDecisions = { ...currentDecisions }
      delete nextDecisions[taskId]

      saveStoredAgentOutputReviewDecisions(nextDecisions)

      return nextDecisions
    })
  }

  function saveAgentRun(agentRun) {
    if (!agentRun) {
      return
    }

    setAgentRunResults((currentResults) => {
      const nextResults = {
        ...currentResults,
        [agentRun.taskId]: agentRun,
      }

      saveStoredAgentRunResults(nextResults)

      return nextResults
    })

    setAgentOutputReviewDecisions((currentDecisions) => {
      const nextDecisions = { ...currentDecisions }
      delete nextDecisions[agentRun.taskId]

      saveStoredAgentOutputReviewDecisions(nextDecisions)

      return nextDecisions
    })
  }

  function handleRunDemoAgent(flowResult) {
    saveAgentRun(createDemoAgentRun(flowResult))
  }

  async function handleRunLiveAgent(flowResult, { apiKey } = {}) {
    const result = await createLiveAgentRun({ flowResult, apiKey })
    const agentRun = result.ok ? result.agentRun : result.fallback?.agentRun

    if (agentRun) {
      saveAgentRun(agentRun)
    }

    return {
      ...result,
      fallbackSaved: Boolean(!result.ok && agentRun),
    }
  }

  function handleAgentOutputReviewDecision(taskId, action, agentRun) {
    const outputReviewDecision = createAgentOutputReviewDecision({
      taskId,
      action,
      agentRun,
    })

    if (!outputReviewDecision) {
      return
    }

    setAgentOutputReviewDecisions((currentDecisions) => {
      const nextDecisions = {
        ...currentDecisions,
        [taskId]: outputReviewDecision,
      }

      saveStoredAgentOutputReviewDecisions(nextDecisions)

      return nextDecisions
    })
  }

  function handleResetLocalState() {
    clearStoredLocalSession()
    setCustomTasks([])
    setHumanReviewDecisions({})
    setAgentRunResults({})
    setAgentOutputReviewDecisions({})
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
  const detailAgentRun = detailTask
    ? agentRunResults[detailTask.id] || null
    : null
  const detailOutputReviewDecision = detailTask
    ? agentOutputReviewDecisions[detailTask.id] || null
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
        agentRun={detailAgentRun}
        outputReviewDecision={detailOutputReviewDecision}
        flowResult={detailFlowResult}
        onNavigate={navigate}
        onHumanReviewDecision={handleHumanReviewDecision}
        onOutputReviewDecision={handleAgentOutputReviewDecision}
        onRunAgent={handleRunDemoAgent}
        onRunLiveAgent={handleRunLiveAgent}
      />
    )
  } else {
    page = (
      <DashboardPage
        customTaskCount={customTasks.length}
        agentRunCount={Object.keys(agentRunResults).length}
        agentOutputReviewDecisionCount={
          Object.keys(agentOutputReviewDecisions).length
        }
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
