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

export function NewTaskPage({ onAnalyze }) {
  const defaultScenario = getDemoScenarioById(defaultDemoScenarioId)
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    defaultScenario.id,
  )
  const [formData, setFormData] = useState(() =>
    getTaskFormData(defaultScenario.task),
  )
  const [showError, setShowError] = useState(false)
  const selectedScenario = getDemoScenarioById(selectedScenarioId)

  function loadScenario(scenarioId) {
    const scenario = getDemoScenarioById(scenarioId)

    setSelectedScenarioId(scenario.id)
    setFormData(getTaskFormData(scenario.task))
    setShowError(false)
  }

  function updateField(fieldName, value) {
    setFormData((current) => ({ ...current, [fieldName]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      setShowError(true)
      return
    }

    onAnalyze({
      ...formData,
      id: formData.id || "task_custom",
      status: "submitted",
    })
  }

  return (
    <>
      <PageHeader
        title="New Task"
        description="Describe the knowledge-work task. Use the scenario picker to test agent, human, hybrid, review, and blocked paths."
      />

      <SectionCard title="Task intake form">
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <p className="rounded-md bg-cyan-50 px-3 py-2 text-sm text-cyan-800">
            {selectedScenario.description}
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
