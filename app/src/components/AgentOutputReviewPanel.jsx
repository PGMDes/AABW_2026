import {
  agentOutputReviewActions,
  getAgentOutputReviewDecisionSummary,
} from "../logic/agentOutputReview"
import { PrimaryButton } from "./PrimaryButton"
import { SectionCard } from "./SectionCard"
import { StatusBadge } from "./StatusBadge"

function OutputReviewState({ decision }) {
  const decisionSummary = getAgentOutputReviewDecisionSummary(decision)

  if (!decisionSummary) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge value="agent_output_review" label="Awaiting review" />
          <StatusBadge value="human" label="Human decision required" />
        </div>
        <h3 className="text-lg font-semibold text-slate-950">
          Human decision pending
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Review the Agent output, then accept it, request a revision, or
          reroute final execution to a Human.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-cyan-200 bg-cyan-50 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge value={decisionSummary.decisionStatus} />
        <StatusBadge value="human" label={`Recorded by ${decisionSummary.actorName}`} />
      </div>
      <h3 className="text-lg font-semibold text-slate-950">
        {decisionSummary.finalState}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        {decisionSummary.stateDescription}
      </p>
      <p className="mt-2 text-xs font-medium text-slate-500">
        Decision saved at {decisionSummary.decidedAt}
      </p>
    </div>
  )
}

export function AgentOutputReviewPanel({
  agentRun,
  outputReviewDecision,
  onOutputReviewDecision,
}) {
  if (!agentRun) {
    return null
  }

  const decisionSummary =
    getAgentOutputReviewDecisionSummary(outputReviewDecision)
  const canRecordDecision = typeof onOutputReviewDecision === "function"

  return (
    <SectionCard
      title="Agent output review"
      description="Final Human decision gate after controlled Agent output. This is where the draft is accepted, sent back for revision, or rerouted to Human-led execution."
      testId="agent-output-review"
    >
      <div className="space-y-5">
        <OutputReviewState decision={outputReviewDecision} />

        <div className="grid gap-3 lg:grid-cols-3">
          {agentOutputReviewActions.map((action) => {
            const isCurrentDecision = decisionSummary?.id === action.id

            return (
              <div
                key={action.id}
                className={`flex flex-col justify-between gap-4 rounded-md border p-4 ${
                  isCurrentDecision
                    ? "border-cyan-300 bg-cyan-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950">
                      {action.label}
                    </h3>
                    <StatusBadge value={action.decisionStatus} />
                    {isCurrentDecision ? (
                      <StatusBadge value="completed" label="Current decision" />
                    ) : null}
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    {action.description}
                  </p>
                </div>
                <PrimaryButton
                  variant={isCurrentDecision ? "secondary" : "primary"}
                  disabled={!canRecordDecision}
                  onClick={() =>
                    onOutputReviewDecision(
                      agentRun.taskId,
                      action.id,
                      agentRun,
                    )
                  }
                >
                  {action.label}
                </PrimaryButton>
              </div>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )
}
