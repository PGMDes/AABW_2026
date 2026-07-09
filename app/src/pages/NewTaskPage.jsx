import { useState } from "react"
import {
  defaultDemoScenarioId,
  demoScenarios,
  getDemoScenarioById,
  taskFormOptions,
} from "../data"
import { PageHeader } from "../components/PageHeader"
import { PrimaryButton } from "../components/PrimaryButton"
import { SectionCard } from "../components/SectionCard"
import { StatusBadge } from "../components/StatusBadge"
import { formatLabel } from "../components/formatLabel"
import { createLocalTaskFromFormData } from "../logic/localSessionStore"

const customTaskFormData = {
  id: "",
  title: "",
  description: "",
  expectedOutput: "",
  deadline: "2026-07-15",
  audience: "internal",
  sensitivity: "low",
  urgency: "medium",
  budgetRange: "low",
}

const intakeSignals = [
  {
    fieldName: "audience",
    label: "Audience",
    helper: "Who will use or see the work.",
    optionsKey: "audienceOptions",
  },
  {
    fieldName: "urgency",
    label: "Urgency",
    helper: "How quickly the work needs to move.",
    optionsKey: "urgencyOptions",
  },
  {
    fieldName: "sensitivity",
    label: "Sensitivity",
    helper: "How careful the route should be with the content.",
    optionsKey: "sensitivityOptions",
  },
  {
    fieldName: "budgetRange",
    label: "Budget range",
    helper: "How much cost pressure or spend may be involved.",
    optionsKey: "budgetRangeOptions",
  },
]

const suggestionRules = {
  audience: [
    {
      value: "external",
      terms: [
        "customer",
        "partner",
        "vendor",
        "public",
        "external",
        "client",
      ],
    },
    {
      value: "internal_leadership",
      terms: ["executive", "leadership", "board", "ceo", "cfo", "vp"],
    },
  ],
  sensitivity: [
    {
      value: "high",
      terms: [
        "customer data",
        "payroll",
        "legal",
        "compliance",
        "confidential",
        "sensitive",
        "pii",
        "security",
      ],
    },
    {
      value: "medium",
      terms: ["policy", "risk", "governance", "internal planning"],
    },
  ],
  urgency: [
    {
      value: "high",
      terms: ["today", "urgent", "asap", "deadline", "tomorrow", "eod"],
    },
    {
      value: "medium",
      terms: ["this week", "soon", "next week"],
    },
  ],
  budgetRange: [
    {
      value: "high",
      terms: ["paid campaign", "media spend", "large budget", "procurement"],
    },
    {
      value: "medium",
      terms: ["vendor", "agency", "budget", "campaign", "contract"],
    },
  ],
}

function Field({ label, helper, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {helper ? (
        <span className="mt-1 block text-sm leading-5 text-slate-500">
          {helper}
        </span>
      ) : null}
      <div className="mt-1">{children}</div>
    </label>
  )
}

function TextInput({ value, onChange, type = "text", ...inputProps }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      {...inputProps}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
    />
  )
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function getTaskFormData(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    expectedOutput: task.expectedOutput,
    deadline: task.deadline,
    audience: task.audience,
    sensitivity: task.sensitivity,
    urgency: task.urgency,
    budgetRange: task.budgetRange,
  }
}

function getTextForSuggestions(formData) {
  return [
    formData.title,
    formData.description,
    formData.expectedOutput,
  ]
    .join(" ")
    .toLowerCase()
}

function getSuggestionValue(text, rules, fallback) {
  const match = rules.find((rule) =>
    rule.terms.some((term) => text.includes(term)),
  )

  return match?.value || fallback
}

function buildDraftSuggestions(formData) {
  const text = getTextForSuggestions(formData)

  if (!text.trim()) {
    return {
      message: "Paste a work brief first. The intake fields are still editable.",
      hasChanges: false,
      values: {},
    }
  }

  const values = {
    audience: getSuggestionValue(
      text,
      suggestionRules.audience,
      formData.audience,
    ),
    sensitivity: getSuggestionValue(
      text,
      suggestionRules.sensitivity,
      formData.sensitivity,
    ),
    urgency: getSuggestionValue(text, suggestionRules.urgency, formData.urgency),
    budgetRange: getSuggestionValue(
      text,
      suggestionRules.budgetRange,
      formData.budgetRange,
    ),
  }
  const changedFields = Object.entries(values)
    .filter(([fieldName, value]) => formData[fieldName] !== value)
    .map(([fieldName]) => formatLabel(fieldName))

  return {
    hasChanges: changedFields.length > 0,
    values,
    message: changedFields.length
      ? `Draft suggestions applied: ${changedFields.join(", ")}. Review before analysis.`
      : "No strong new signals found. Review the current fields before analysis.",
  }
}

function ScenarioChoice({ scenario, isActive, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={`scenario-choice ${isActive ? "scenario-choice--active" : ""}`}
      onClick={() => onSelect(scenario.id)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="scenario-choice__title">{scenario.label}</h3>
        <StatusBadge value={scenario.expected.recommendedPath} />
        <StatusBadge value={scenario.expected.governanceStatus} />
      </div>
      <p className="mt-2 text-sm leading-5 text-slate-600">
        {scenario.demonstrates}
      </p>
    </button>
  )
}

function ScenarioPreview({ scenario }) {
  const selectedOptionLabel =
    scenario.expected.selectedOptionName || "No launch option"

  return (
    <div className="governance-next-panel p-4">
      <p className="text-sm font-semibold text-cyan-800">
        Loaded demo path
      </p>
      <h3 className="mt-2 text-lg font-semibold text-slate-950">
        {scenario.label}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge
          value={scenario.expected.recommendedPath}
          label={`Expected: ${formatLabel(scenario.expected.recommendedPath)}`}
        />
        <StatusBadge value={scenario.expected.governanceStatus} />
      </div>
      <p className="mt-3 text-sm leading-6 text-cyan-950">
        {scenario.demonstrates}
      </p>
      <p className="mt-2 text-sm text-cyan-900">
        Demo result: {selectedOptionLabel}
      </p>
    </div>
  )
}

function SignalControl({ signal, value, onChange }) {
  const options = taskFormOptions[signal.optionsKey]

  return (
    <fieldset className="signal-control">
      <legend className="text-sm font-semibold text-slate-950">
        {signal.label}
      </legend>
      <p className="mt-1 text-sm leading-5 text-slate-500">{signal.helper}</p>
      <div className="signal-segments mt-3">
        {options.map((option) => {
          const isActive = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              className={`signal-segment ${
                isActive ? "signal-segment--active" : ""
              }`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function IntakeSignalSummary({ formData }) {
  return (
    <div className="signal-summary-grid">
      {intakeSignals.map((signal) => (
        <div key={signal.fieldName} className="signal-chip">
          <span className="text-xs font-semibold uppercase text-slate-500">
            {signal.label}
          </span>
          <strong className="mt-1 block text-slate-950">
            {formatLabel(formData[signal.fieldName])}
          </strong>
        </div>
      ))}
    </div>
  )
}

function CustomTaskPreview() {
  return (
    <div className="governance-next-panel p-4">
      <p className="text-sm font-semibold text-slate-500">
        Local custom task
      </p>
      <h3 className="mt-2 text-lg font-semibold text-slate-950">
        Saved in this browser
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge value="local" />
        <StatusBadge value="submitted" />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        This task uses the same decision flow and appears on Dashboard.
      </p>
    </div>
  )
}

export function NewTaskPage({ existingTaskIds = [], onAnalyze }) {
  const defaultScenario = getDemoScenarioById(defaultDemoScenarioId)
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    defaultScenario.id,
  )
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [formData, setFormData] = useState(() =>
    getTaskFormData(defaultScenario.task),
  )
  const [showError, setShowError] = useState(false)
  const [suggestionMessage, setSuggestionMessage] = useState("")
  const selectedScenario = getDemoScenarioById(selectedScenarioId)

  function loadScenario(scenarioId) {
    const scenario = getDemoScenarioById(scenarioId)

    setSelectedScenarioId(scenario.id)
    setIsCustomMode(false)
    setFormData(getTaskFormData(scenario.task))
    setShowError(false)
    setSuggestionMessage("")
  }

  function startCustomTask() {
    setIsCustomMode(true)
    setFormData(customTaskFormData)
    setShowError(false)
    setSuggestionMessage("")
  }

  function updateField(fieldName, value) {
    setIsCustomMode(true)
    setFormData((current) => ({ ...current, id: "", [fieldName]: value }))
  }

  function applyDraftSuggestions() {
    const suggestion = buildDraftSuggestions(formData)

    if (suggestion.hasChanges) {
      setIsCustomMode(true)
      setFormData((current) => ({
        ...current,
        id: "",
        ...suggestion.values,
      }))
    }

    setSuggestionMessage(suggestion.message)
    setShowError(false)
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      setShowError(true)
      return
    }

    const task = isCustomMode
      ? createLocalTaskFromFormData(formData, existingTaskIds)
      : {
          ...formData,
          source: "demo",
          status: "submitted",
        }

    onAnalyze(task)
  }

  return (
    <>
      <PageHeader
        title="New Task"
        description="Choose a demo scenario, paste a work brief, review intake signals, then analyze."
      />

      <SectionCard
        title="Start from a demo scenario"
        description="Five built-in paths help judges see Human, Agent, Hybrid, and Blocked routing quickly."
      >
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-3">
            <div className="scenario-choice-grid">
              {demoScenarios.map((scenario) => (
                <ScenarioChoice
                  key={scenario.id}
                  scenario={scenario}
                  isActive={!isCustomMode && selectedScenarioId === scenario.id}
                  onSelect={loadScenario}
                />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field label="Load demo scenario">
                <SelectInput
                  value={selectedScenarioId}
                  onChange={loadScenario}
                  options={demoScenarios.map((scenario) => ({
                    label: scenario.label,
                    value: scenario.id,
                  }))}
                />
              </Field>
              <PrimaryButton variant="secondary" onClick={startCustomTask}>
                Start custom task
              </PrimaryButton>
            </div>
          </div>

          <div className="space-y-3">
            {isCustomMode ? (
              <CustomTaskPreview />
            ) : (
              <ScenarioPreview scenario={selectedScenario} />
            )}
            <p className="info-tile px-3 py-2 text-sm leading-6 text-slate-600">
              Selecting a scenario fills the same editable fields below. Nothing
              skips the Analyze Task step.
            </p>
          </div>
        </div>
      </SectionCard>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <SectionCard
          title="Paste work brief"
          description="Start from messy notes, a ticket, an email, or a document excerpt."
        >
          <div className="space-y-5">
            <p className="info-tile px-3 py-2 text-sm text-slate-700">
              {isCustomMode
                ? "Local tasks stay in this browser until reset."
                : selectedScenario.description}
            </p>

            <Field label="Task title">
              <TextInput
                aria-invalid={
                  showError && !formData.title.trim() ? "true" : undefined
                }
                required
                value={formData.title}
                onChange={(value) => updateField("title", value)}
              />
            </Field>

            <Field
              label="Work brief"
              helper="Paste content from a document, Jira ticket, Slack thread, or email. No file upload or parsing is required."
            >
              <textarea
                aria-invalid={
                  showError && !formData.description.trim() ? "true" : undefined
                }
                required
                value={formData.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Paste or summarize the work request here."
                rows={5}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Expected output">
                <TextInput
                  value={formData.expectedOutput}
                  onChange={(value) => updateField("expectedOutput", value)}
                />
              </Field>
              <Field label="Deadline">
                <TextInput
                  type="date"
                  value={formData.deadline}
                  onChange={(value) => updateField("deadline", value)}
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton variant="secondary" onClick={applyDraftSuggestions}>
                Suggest intake fields
              </PrimaryButton>
              <p className="text-sm leading-6 text-slate-500">
                Local draft suggestions only. Review every field before
                analysis.
              </p>
            </div>

            {suggestionMessage ? (
              <p className="suggestion-status" role="status">
                {suggestionMessage}
              </p>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Intake signals"
          description="These editable signals help determine Human, Agent, Hybrid, or Blocked routing."
        >
          <div className="space-y-5">
            <IntakeSignalSummary formData={formData} />
            <div className="grid gap-4 lg:grid-cols-2">
              {intakeSignals.map((signal) => (
                <SignalControl
                  key={signal.fieldName}
                  signal={signal}
                  value={formData[signal.fieldName]}
                  onChange={(value) => updateField(signal.fieldName, value)}
                />
              ))}
            </div>
          </div>
        </SectionCard>

        {showError ? (
          <p
            className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700"
            role="alert"
          >
            Task title and description are required.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <PrimaryButton type="submit">Analyze Task</PrimaryButton>
          <PrimaryButton
            variant="secondary"
            onClick={() => loadScenario(defaultDemoScenarioId)}
          >
            Reset demo task
          </PrimaryButton>
        </div>
      </form>
    </>
  )
}
