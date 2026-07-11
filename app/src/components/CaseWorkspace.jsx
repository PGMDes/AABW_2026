import { CaseJourney } from "./CaseJourney"
import { AnalysisStage } from "./case-stages/AnalysisStage"
import { DecisionStage } from "./case-stages/DecisionStage"
import { ExecutionStage } from "./case-stages/ExecutionStage"
import { GovernanceStage } from "./case-stages/GovernanceStage"
import { IntakeStage } from "./case-stages/IntakeStage"
import { OutcomeStage } from "./case-stages/OutcomeStage"
import { SelectionStage } from "./case-stages/SelectionStage"

const stageComponents={intake:IntakeStage,analysis:AnalysisStage,decision:DecisionStage,governance:GovernanceStage,selection:SelectionStage,execution:ExecutionStage,outcome:OutcomeStage}
export function CaseWorkspace({caseModel,flowResult,activeStageId,onSelectStage,...actions}){const active=caseModel.stages.find((stage)=>stage.id===activeStageId)||caseModel.stages[0];const Stage=stageComponents[active.id];return <div className="case-workspace" aria-label="Case workspace"><aside className="case-workspace__journey"><CaseJourney stages={caseModel.stages} activeStageId={active.id} onSelect={onSelectStage}/></aside><section className="case-workspace__main" aria-labelledby="case-stage-title"><div className="case-stage-heading"><p>Selected stage</p><h2 id="case-stage-title">{active.label}</h2>{active.lockReason&&!active.available&&!active.completed?<span>{active.lockReason}</span>:null}</div><Stage flowResult={flowResult} {...actions}/></section></div>}
