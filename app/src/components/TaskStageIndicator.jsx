const stages = ["Intake", "Analysis", "Decision", "Governance", "Selection", "Execution", "Outcome"]

export function TaskStageIndicator({ currentStage = "Intake" }) {
  const currentIndex = stages.findIndex((stage) => stage.toLowerCase() === currentStage.toLowerCase())
  return <ol aria-label="Task progress" className="task-stage-indicator">{stages.map((stage, index) => <li key={stage} aria-current={index === currentIndex ? "step" : undefined} className={index <= currentIndex ? "task-stage--reached" : ""}><span>{index + 1}</span>{stage}</li>)}</ol>
}
