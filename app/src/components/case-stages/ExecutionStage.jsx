import { AgentRunnerPanel } from "../AgentRunnerPanel"
import { SectionCard } from "../SectionCard"
export function ExecutionStage({ flowResult, agentRun, onRunAgent, onRunLiveAgent }) { if(!flowResult.selectedOption) return <SectionCard title="Execution locked" description="The selected option is not launchable."/>; return <AgentRunnerPanel flowResult={flowResult} agentRun={agentRun} onRunAgent={onRunAgent} onRunLiveAgent={onRunLiveAgent}/> }
