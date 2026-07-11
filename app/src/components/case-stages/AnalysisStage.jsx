import { SectionCard } from "../SectionCard"
import { formatLabel } from "../formatLabel"
export function AnalysisStage({ flowResult }) { return <SectionCard title="Analyzed task attributes" description="The evidence used by the deterministic decision engine."><dl className="case-evidence-grid">{Object.entries(flowResult.analysis || {}).filter(([key])=>key!=="taskId").map(([key,value])=><div className="info-tile p-4" key={key}><dt>{formatLabel(key)}</dt><dd>{formatLabel(value)}</dd></div>)}</dl></SectionCard> }
