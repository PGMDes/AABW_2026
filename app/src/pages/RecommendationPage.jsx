import { useEffect, useState } from "react"
import { ExecutionShortlist } from "../components/ExecutionShortlist"
import { GovernanceStatusCard } from "../components/GovernanceStatusCard"
import { PageHeader } from "../components/PageHeader"
import { PrimaryButton } from "../components/PrimaryButton"
import { RecommendationCard } from "../components/RecommendationCard"
import { SectionCard } from "../components/SectionCard"
import { formatLabel } from "../components/formatLabel"
import { TaskStageIndicator } from "../components/TaskStageIndicator"
import { TaskSummaryCard } from "../components/TaskSummaryCard"

export function RecommendationPage({ flowResult, onContinue, onNewTask }) {
  const [isAnalyzing, setIsAnalyzing] = useState(Boolean(flowResult))

  useEffect(() => {
    if (!flowResult) return undefined
    const timer = window.setTimeout(() => setIsAnalyzing(false), 450)
    return () => window.clearTimeout(timer)
  }, [flowResult])

  if (!flowResult) return <><PageHeader title="Decision" description="Analyze a task to see its route, policy result, and eligible options." /><SectionCard title="No recommendation yet" description="Create or select a task, then analyze it." className="empty-state"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><p className="text-slate-600">No routing decision has been created in this session.</p><PrimaryButton onClick={onNewTask}>Go to New Task</PrimaryButton></div></SectionCard></>

  const { task, analysis, recommendation, explanation, governance, selectedOption, options } = flowResult

  if (isAnalyzing) return <div className="space-y-6" role="status" aria-label="Analyzing task"><PageHeader title="Analyzing task" description="Applying the current decision and governance rules." /><TaskStageIndicator currentStage="Analysis" /><SectionCard><p className="text-sm text-slate-600">Preparing the recommendation, explanation, governance snapshot, and eligible options…</p></SectionCard></div>

  return <><PageHeader title="Recommendation Result" description="Review the recommendation and governance result before taking any action." /><div className="space-y-6"><TaskStageIndicator currentStage="Decision" /><TaskSummaryCard task={task} compact /><SectionCard title="Analyzed task attributes"><dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">{Object.entries(analysis).map(([key, value]) => key === "taskId" ? null : <div key={key} className="info-tile p-3"><dt className="font-medium text-slate-500">{formatLabel(key)}</dt><dd className="mt-1 text-slate-900">{formatLabel(value)}</dd></div>)}</dl></SectionCard><RecommendationCard recommendation={recommendation} explanation={explanation} selectedOption={selectedOption} /><GovernanceStatusCard governance={governance} /><ExecutionShortlist options={options} selectedOption={selectedOption} governance={governance} onContinue={onContinue} /></div></>
}
