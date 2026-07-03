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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function TextInput({ value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
    />
  )
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
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

function ScenarioPreview({ scenario }) {
  const selectedOptionLabel =
    scenario.expected.selectedOptionName || "No launch option"

  return (
    <div className="rounded-md border border-cyan-200 bg-cyan-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-normal text-cyan-800">
        Scenario proof
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

function CustomTaskPreview() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
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
        This task will use the same taskFlowEngine as the demo scenarios, then
        appear on the Dashboard as a local task.
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
  const selectedScenario = getDemoScenarioById(selectedScenarioId)

  function loadScenario(scenarioId) {
    const scenario = getDemoScenarioById(scenarioId)

    setSelectedScenarioId(scenario.id)
    setIsCustomMode(false)
    setFormData(getTaskFormData(scenario.task))
    setShowError(false)
  }

  function startCustomTask() {
    setIsCustomMode(true)
    setFormData(customTaskFormData)
    setShowError(false)
  }

  function updateField(fieldName, value) {
    setIsCustomMode(true)
    setFormData((current) => ({ ...current, id: "", [fieldName]: value }))
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
        description="Choose a demo scenario or edit the task fields, then run the same frontend decision flow."
      />

      <SectionCard
        title="Demo scenario"
        description="Pick a built-in scenario, or edit the form to save a local custom task in this browser."
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
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

          {isCustomMode ? (
            <CustomTaskPreview />
          ) : (
            <ScenarioPreview scenario={selectedScenario} />
          )}
        </div>
      </SectionCard>

      <SectionCard title="Task intake form" className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {isCustomMode
              ? "Local custom tasks are saved only in this browser until you reset local demo state."
              : selectedScenario.description}
          </p>

          <Field label="Task title">
            <TextInput
              value={formData.title}
              onChange={(value) => updateField("title", value)}
            />
          </Field>

          <Field label="Task description">
            <textarea
              value={formData.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={5}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
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
            <Field label="Audience">
              <SelectInput
                value={formData.audience}
                onChange={(value) => updateField("audience", value)}
                options={taskFormOptions.audienceOptions}
              />
            </Field>
            <Field label="Sensitivity">
              <SelectInput
                value={formData.sensitivity}
                onChange={(value) => updateField("sensitivity", value)}
                options={taskFormOptions.sensitivityOptions}
              />
            </Field>
            <Field label="Urgency">
              <SelectInput
                value={formData.urgency}
                onChange={(value) => updateField("urgency", value)}
                options={taskFormOptions.urgencyOptions}
              />
            </Field>
            <Field label="Budget range">
              <SelectInput
                value={formData.budgetRange}
                onChange={(value) => updateField("budgetRange", value)}
                options={taskFormOptions.budgetRangeOptions}
              />
            </Field>
          </div>

          {showError ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
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
      </SectionCard>
    </>
  )
}
