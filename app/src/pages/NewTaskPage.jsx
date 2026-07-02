import { useState } from "react"
import { defaultNewTaskFormData, taskFormOptions } from "../data"
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

export function NewTaskPage({ onAnalyze }) {
  const [formData, setFormData] = useState(defaultNewTaskFormData)
  const [showError, setShowError] = useState(false)

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
      id: "task_001",
      ...formData,
      status: "submitted",
    })
  }

  return (
    <>
      <PageHeader
        title="New Task"
        description="Describe the knowledge-work task. The demo form is prefilled so you can test the happy path quickly."
      />

      <SectionCard title="Task intake form">
        <form onSubmit={handleSubmit} className="space-y-5">
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
              onClick={() => setFormData(defaultNewTaskFormData)}
            >
              Reset demo task
            </PrimaryButton>
          </div>
        </form>
      </SectionCard>
    </>
  )
}
