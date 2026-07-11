import { AgentOutputReviewPanel } from "../AgentOutputReviewPanel"
import { SectionCard } from "../SectionCard"
export function OutcomeStage({ flowResult, agentRun, outputReviewDecision, onOutputReviewDecision }) { return <div className="space-y-6">{agentRun?<AgentOutputReviewPanel taskId={flowResult.task.id} agentRun={agentRun} outputReviewDecision={outputReviewDecision} onDecision={onOutputReviewDecision}/>:<SectionCard title="Outcome pending" description="An outcome becomes available after execution starts."/>}</div> }
