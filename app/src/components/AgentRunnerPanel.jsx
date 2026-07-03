import { getAgentRunnerState } from "../logic/agentRunner"
import { formatLabel } from "./formatLabel"
import { PrimaryButton } from "./PrimaryButton"
import { SectionCard } from "./SectionCard"
import { StatusBadge } from "./StatusBadge"

function DetailList({ title, items }) {
  if (!items.length) {
    return null
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-slate-50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function AgentRunSteps({ steps }) {
  return (
    <ol className="grid gap-3 lg:grid-cols-3">
      {steps.map((step) => (
        <li
          key={step.id}
          className="rounded-md border border-slate-200 bg-white p-4"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-950">
              {step.label}
            </h4>
            <StatusBadge value={step.status} />
          </div>
          <p className="text-sm leading-6 text-slate-600">{step.detail}</p>
        </li>
      ))}
    </ol>
  )
}

function AgentOutput({ agentRun }) {
  return (
    <div className="space-y-5 rounded-md border border-cyan-200 bg-cyan-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-950">Agent output</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">
            {agentRun.output.title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value="local_deterministic" />
          <StatusBadge
            value="agent_output_ready"
            label={`${agentRun.confidence}% confidence`}
          />
        </div>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-md bg-white p-3">
          <dt className="font-medium text-slate-500">Run ID</dt>
          <dd className="mt-1 break-words text-slate-900">{agentRun.id}</dd>
        </div>
        <div className="rounded-md bg-white p-3">
          <dt className="font-medium text-slate-500">Generated at</dt>
          <dd className="mt-1 text-slate-900">{agentRun.generatedAt}</dd>
        </div>
      </dl>

      <AgentRunSteps steps={agentRun.steps} />

      <div>
        <h4 className="text-sm font-semibold text-slate-950">
          Generated draft
        </h4>
        <pre className="mt-2 whitespace-pre-wrap rounded-md bg-white p-4 text-sm leading-6 text-slate-700">
          {agentRun.output.draft}
        </pre>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailList title="Assumptions" items={agentRun.output.assumptions} />
        <DetailList
          title="Risks / Human review checklist"
          items={[...agentRun.output.risks, ...agentRun.output.reviewChecklist]}
        />
      </div>

      <DetailList title="Limitations" items={agentRun.output.limitations} />
    </div>
  )
}

export function AgentRunnerPanel({ flowResult, agentRun, onRunAgent }) {
  const { selectedOption, execution, governance } = flowResult
  const runnerState = getAgentRunnerState(flowResult, agentRun)

  return (
    <SectionCard
      title="Agent Runner"
      description="Controlled execution surface for safe agentic work. The default run is deterministic local demo output, not a live model API call."
    >
      <div className="space-y-5">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusBadge value={runnerState.status} />
                <StatusBadge value={execution.launchStatus} />
                {selectedOption ? (
                  <StatusBadge
                    value={selectedOption.pathType}
                    label={`Selected: ${formatLabel(selectedOption.pathType)}`}
                  />
                ) : null}
              </div>
              <h3 className="text-lg font-semibold text-slate-950">
                {runnerState.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {runnerState.message}
              </p>
              {runnerState.status === "blocked" ? (
                <p className="mt-2 text-sm font-medium text-rose-700">
                  {governance.policyReason}
                </p>
              ) : null}
            </div>

            {runnerState.canRun ? (
              <PrimaryButton onClick={() => onRunAgent(flowResult)}>
                {agentRun ? "Regenerate demo output" : "Run demo agent"}
              </PrimaryButton>
            ) : null}
          </div>
        </div>

        {agentRun && runnerState.status === "agent_output_ready" ? (
          <AgentOutput agentRun={agentRun} />
        ) : null}
      </div>
    </SectionCard>
  )
}
