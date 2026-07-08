import { useState } from "react"
import {
  getAgentRunModeLabel,
  getAgentRunnerState,
} from "../logic/agentRunner"
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
          <StatusBadge
            value={agentRun.runMode || "local_deterministic"}
            label={getAgentRunModeLabel(agentRun)}
          />
          {agentRun.provider ? (
            <StatusBadge value="agent" label={agentRun.provider} />
          ) : null}
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

function LiveRunStatus({ result }) {
  if (!result) {
    return null
  }

  if (result.ok) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
        Optional live AI draft saved. Human output review is still required
        before final use.
      </div>
    )
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
      <p className="font-semibold">Live AI draft did not complete.</p>
      <p className="mt-1">{result.message}</p>
      {result.fallbackSaved ? (
        <p className="mt-1">
          Deterministic demo output was saved as the fallback.
        </p>
      ) : (
        <p className="mt-1">{result.fallback?.message}</p>
      )}
    </div>
  )
}

function ExecutionModeControl({
  agentRun,
  executionMode,
  isRunningLive,
  liveApiKey,
  liveResult,
  onExecutionModeChange,
  onLiveApiKeyChange,
  onRunLocal,
  onRunLive,
}) {
  const trimmedLiveApiKey = liveApiKey.trim()

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-950">Execution mode</p>
      <div
        aria-label="Execution mode"
        className="mt-3 grid gap-3 lg:grid-cols-2"
        role="radiogroup"
      >
        <label className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <input
            checked={executionMode === "local_deterministic"}
            className="mt-1"
            name="agent-execution-mode"
            type="radio"
            value="local_deterministic"
            onChange={() => onExecutionModeChange("local_deterministic")}
          />
          <span>
            <span className="block font-semibold text-slate-950">
              Deterministic demo runner
            </span>
            <span className="mt-1 block leading-5">
              Default path. No API key, network, or external model is needed.
            </span>
          </span>
        </label>

        <label className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <input
            checked={executionMode === "live_ai_draft"}
            className="mt-1"
            name="agent-execution-mode"
            type="radio"
            value="live_ai_draft"
            onChange={() => onExecutionModeChange("live_ai_draft")}
          />
          <span>
            <span className="block font-semibold text-slate-950">
              Optional live AI draft
            </span>
            <span className="mt-1 block leading-5">
              Demo-only draft source. Policy decisions stay deterministic.
            </span>
          </span>
        </label>
      </div>

      {executionMode === "live_ai_draft" ? (
        <div className="mt-4 space-y-3 rounded-md border border-cyan-200 bg-cyan-50 p-3">
          <div>
            <label
              className="text-sm font-semibold text-cyan-950"
              htmlFor="live-ai-session-key"
            >
              Session API key
            </label>
            <input
              aria-label="Session API key for optional live AI draft"
              autoComplete="off"
              className="mt-2 w-full rounded-md border border-cyan-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200"
              id="live-ai-session-key"
              placeholder="sk-..."
              type="password"
              value={liveApiKey}
              onChange={(event) => onLiveApiKeyChange(event.target.value)}
            />
            <p className="mt-2 text-xs font-medium text-cyan-950">
              The key stays in this page session and is not saved to
              localStorage.
            </p>
            <div className="mt-3 space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
              <p>
                Live mode sends this task context, recommendation, governance
                result, and selected option to the external provider to draft
                text.
              </p>
              <p>
                This browser-side adapter is for local/demo verification only.
                Do not enter production, shared, or sensitive API keys.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton
              disabled={!trimmedLiveApiKey || isRunningLive}
              onClick={onRunLive}
            >
              {isRunningLive
                ? "Running live draft"
                : agentRun
                  ? "Regenerate live draft"
                  : "Run live AI draft"}
            </PrimaryButton>
            <PrimaryButton
              disabled={isRunningLive}
              variant="secondary"
              onClick={() => onExecutionModeChange("local_deterministic")}
            >
              Use demo runner
            </PrimaryButton>
          </div>
          <LiveRunStatus result={liveResult} />
        </div>
      ) : (
        <div className="mt-4">
          <PrimaryButton onClick={onRunLocal}>
            {agentRun ? "Regenerate demo output" : "Run demo agent"}
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}

export function AgentRunnerPanel({
  flowResult,
  agentRun,
  onRunAgent,
  onRunLiveAgent,
}) {
  const { selectedOption, execution, governance } = flowResult
  const runnerState = getAgentRunnerState(flowResult, agentRun)
  const [executionMode, setExecutionMode] = useState("local_deterministic")
  const [liveApiKey, setLiveApiKey] = useState("")
  const [liveResult, setLiveResult] = useState(null)
  const [isRunningLive, setIsRunningLive] = useState(false)

  function handleRunLocal() {
    setLiveResult(null)
    onRunAgent(flowResult)
  }

  async function handleRunLive() {
    if (typeof onRunLiveAgent !== "function") {
      return
    }

    setIsRunningLive(true)
    setLiveResult(null)

    try {
      const result = await onRunLiveAgent(flowResult, {
        apiKey: liveApiKey,
      })

      setLiveResult(result || null)
    } finally {
      setIsRunningLive(false)
    }
  }

  return (
    <SectionCard
      title="Agent Runner"
      description="Controlled execution surface for safe agentic work. The default run is deterministic local demo output, not a live model API call."
      testId="agent-runner"
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
              <StatusBadge
                value={agentRun?.runMode || "local_deterministic"}
                label={
                  agentRun
                    ? `Saved: ${getAgentRunModeLabel(agentRun)}`
                    : "Default: demo runner"
                }
              />
            ) : null}
          </div>
        </div>

        {runnerState.canRun ? (
          <ExecutionModeControl
            agentRun={agentRun}
            executionMode={executionMode}
            isRunningLive={isRunningLive}
            liveApiKey={liveApiKey}
            liveResult={liveResult}
            onExecutionModeChange={setExecutionMode}
            onLiveApiKeyChange={setLiveApiKey}
            onRunLive={handleRunLive}
            onRunLocal={handleRunLocal}
          />
        ) : null}

        {agentRun && runnerState.status === "agent_output_ready" ? (
          <AgentOutput agentRun={agentRun} />
        ) : null}
      </div>
    </SectionCard>
  )
}
