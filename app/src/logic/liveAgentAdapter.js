import { createDemoAgentRun, getAgentRunnerState } from "./agentRunner.js"

const DEFAULT_LIVE_MODEL = "gpt-4.1"
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
const LIVE_PROVIDER_NAME = "OpenAI Responses API"

function normalizeText(value, fallback = "") {
  const normalized = String(value || "").trim()

  return normalized || fallback
}

function redactSensitiveText(value) {
  return normalizeText(value).replace(/sk-[A-Za-z0-9_-]+/g, "[redacted API key]")
}

function formatValue(value) {
  if (!value) return "not set"

  return String(value).replaceAll("_", " ")
}

function getRunnerAgentName(selectedOption) {
  if (!selectedOption) return "Live AI Draft Adapter"

  return selectedOption.displayName.replace(" + Human Reviewer", "")
}

function buildLiveRunId({ task, selectedOption, responseId }) {
  const optionPart = selectedOption?.sourceId || selectedOption?.id || "option"
  const responsePart = responseId || Date.now()

  return `agent_run_${task.id}_${optionPart}_live_${responsePart}`
}

function buildStep(id, label, detail) {
  return {
    id,
    label,
    detail,
    status: "completed",
  }
}

function buildLiveAgentPrompt(flowResult) {
  const {
    task,
    analysis,
    recommendation,
    governance,
    selectedOption,
    execution,
  } = flowResult

  return [
    "You are writing an optional draft for Human-AgentOS, a workforce control-plane demo.",
    "",
    "Important boundaries:",
    "- Do not decide routing, governance, policy, launch status, blocked status, or audit status.",
    "- Treat the provided recommendation, governance result, and selected execution option as fixed context.",
    "- Write only a useful first-pass knowledge-work draft for a Human reviewer.",
    "- Do not claim the output is final or approved.",
    "",
    "Task context:",
    `Title: ${task.title}`,
    `Description: ${task.description}`,
    `Expected output: ${task.expectedOutput || "Draft work output"}`,
    `Audience: ${formatValue(task.audience)}`,
    `Sensitivity: ${formatValue(task.sensitivity)}`,
    "",
    "Decision context already produced by deterministic Human-AgentOS logic:",
    `Task type: ${formatValue(analysis.taskType)}`,
    `Recommended path: ${formatValue(recommendation.recommendedPath)}`,
    `Recommendation confidence: ${recommendation.confidence}%`,
    `Governance status: ${formatValue(governance.status)}`,
    `Governance reason: ${governance.policyReason}`,
    `Selected option: ${selectedOption.displayName}`,
    `Launch status: ${formatValue(execution.launchStatus)}`,
    "",
    "Return a concise draft with useful headings and bullet points where helpful.",
  ].join("\n")
}

async function readResponsePayload(response) {
  const text = await response.text()

  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    return { rawText: text }
  }
}

function extractOpenAIOutputText(payload) {
  const directText = normalizeText(payload?.output_text)

  if (directText) {
    return directText
  }

  if (!Array.isArray(payload?.output)) {
    return ""
  }

  return payload.output
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter((contentItem) => contentItem?.type === "output_text")
    .map((contentItem) => normalizeText(contentItem.text))
    .filter(Boolean)
    .join("\n\n")
}

function getPayloadErrorMessage(payload, fallback) {
  return redactSensitiveText(
    normalizeText(payload?.error?.message) ||
      normalizeText(payload?.rawText) ||
      fallback,
  )
}

function buildDeterministicFallback(flowResult, message) {
  const fallbackRun = createDemoAgentRun(flowResult)

  if (!fallbackRun) {
    return {
      available: false,
      runMode: "local_deterministic",
      agentRun: null,
      message:
        "Deterministic fallback was unavailable because Agent Runner is not allowed.",
    }
  }

  return {
    available: true,
    runMode: "local_deterministic",
    agentRun: {
      ...fallbackRun,
      output: {
        ...fallbackRun.output,
        limitations: [
          `Optional live AI draft did not complete: ${message}`,
          ...fallbackRun.output.limitations,
        ],
      },
    },
    message:
      "Saved deterministic local demo output instead so the review flow can continue.",
  }
}

function buildFailureResult({ code, message, flowResult, includeFallback }) {
  return {
    ok: false,
    code,
    message,
    fallback: includeFallback
      ? buildDeterministicFallback(flowResult, message)
      : {
          available: false,
          runMode: "local_deterministic",
          agentRun: null,
          message:
            "Switch to deterministic demo runner to create output without a live API call.",
        },
  }
}

function createNormalizedLiveAgentRun({ flowResult, payload, outputText, model }) {
  const { task, recommendation, governance, selectedOption, execution } =
    flowResult
  const runnerName = getRunnerAgentName(selectedOption)
  const generatedAt = new Date().toISOString()

  return {
    id: buildLiveRunId({
      task,
      selectedOption,
      responseId: normalizeText(payload.id),
    }),
    taskId: task.id,
    executionId: execution.id,
    optionId: selectedOption.id,
    runnerName,
    runMode: "live_ai_draft",
    provider: LIVE_PROVIDER_NAME,
    providerRunId: normalizeText(payload.id),
    model,
    status: "completed",
    generatedAt,
    confidence: Math.max(60, Math.min(94, selectedOption.fitScore - 8)),
    steps: [
      buildStep(
        "read_control_plane_context",
        "Read control-plane context",
        "Used the fixed task, recommendation, governance, and selected option context.",
      ),
      buildStep(
        "call_live_model",
        "Called optional live model",
        `Requested draft text from ${LIVE_PROVIDER_NAME} using ${model}; no policy decision was delegated.`,
      ),
      buildStep(
        "normalize_output",
        "Normalized output",
        "Converted the provider text into the existing Agent output review format.",
      ),
    ],
    output: {
      title: `${task.expectedOutput || "Draft output"} - optional live AI draft`,
      draft: outputText,
      assumptions: [
        `Recommendation stayed ${formatValue(recommendation.recommendedPath)} with ${recommendation.confidence}% confidence before the live draft.`,
        `Governance stayed ${formatValue(governance.status)}; the model did not choose policy or launch status.`,
        `Selected option stayed ${selectedOption.displayName}.`,
      ],
      risks: [
        "Verify facts and source quality before using the draft outside the demo.",
        "Treat live text as a draft; Human review still controls final use.",
      ],
      reviewChecklist: [
        "Check whether the live draft answers the original task.",
        "Confirm sensitive, leadership-facing, or external claims before use.",
        "Record Accept output, Request revision, or Reroute to Human before final use.",
      ],
      limitations: [
        "Optional live AI draft mode only writes output; deterministic Human-AgentOS logic still controls routing, governance, blocked status, and audit policy.",
        "This browser demo uses a session-only user-entered key; it is not a production credential pattern.",
      ],
    },
  }
}

export async function createLiveAgentRun({
  flowResult,
  apiKey,
  fetchImpl = fetch,
  model = DEFAULT_LIVE_MODEL,
}) {
  const runnerState = getAgentRunnerState(flowResult, null)

  if (!runnerState.canRun) {
    return buildFailureResult({
      code: "agent_runner_not_allowed",
      message:
        "Live AI draft mode is unavailable because Agent Runner is not allowed for this task.",
      flowResult,
      includeFallback: false,
    })
  }

  const trimmedApiKey = normalizeText(apiKey)

  if (!trimmedApiKey) {
    return buildFailureResult({
      code: "missing_api_key",
      message: "Enter a session-only API key before running live AI draft mode.",
      flowResult,
      includeFallback: false,
    })
  }

  if (typeof fetchImpl !== "function") {
    return buildFailureResult({
      code: "fetch_unavailable",
      message: "This browser session cannot start a live AI draft request.",
      flowResult,
      includeFallback: true,
    })
  }

  try {
    const response = await fetchImpl(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${trimmedApiKey}`,
      },
      body: JSON.stringify({
        model,
        input: buildLiveAgentPrompt(flowResult),
        max_output_tokens: 900,
        store: false,
      }),
    })
    const payload = await readResponsePayload(response)

    if (!response.ok) {
      return buildFailureResult({
        code: "provider_error",
        message: getPayloadErrorMessage(
          payload,
          `Live AI provider returned HTTP ${response.status}.`,
        ),
        flowResult,
        includeFallback: true,
      })
    }

    const outputText = extractOpenAIOutputText(payload)

    if (!outputText) {
      return buildFailureResult({
        code: "empty_provider_output",
        message: "Live AI provider returned no draft text.",
        flowResult,
        includeFallback: true,
      })
    }

    return {
      ok: true,
      agentRun: createNormalizedLiveAgentRun({
        flowResult,
        payload,
        outputText,
        model,
      }),
    }
  } catch (error) {
    return buildFailureResult({
      code: "network_error",
      message: redactSensitiveText(
        error instanceof Error
          ? error.message
          : "Live AI draft request failed before a response was received.",
      ),
      flowResult,
      includeFallback: true,
    })
  }
}
