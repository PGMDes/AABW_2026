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
import { createLocalTaskFromFormData } from "../logic/localSessionStore"
import {
  clearTaskDraft,
  loadTaskDraft,
  saveTaskDraft,
} from "../logic/taskDraftStore"
import { validateAttachment } from "../logic/attachmentValidation"

const attachmentLimitBytes = 5 * 1024 * 1024
const customTaskFormData = {
  id: "",
  title: "",
  description: "",
  expectedOutput: "",
  deadline: "",
  audience: "internal",
  sensitivity: "low",
  urgency: "medium",
  budgetRange: "low",
}
const steps = ["Task brief", "Constraints and files", "Review"]

function Field({ label, helper, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {helper ? <span className="mt-1 block text-sm text-slate-500">{helper}</span> : null}
      <div className="mt-1">{children}</div>
      {error ? <span className="mt-1 block text-sm text-rose-700">{error}</span> : null}
    </label>
  )
}

function TextInput({ value, onChange, type = "text", ...props }) {
  return (
    <input
      {...props}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="task-intake-input"
    />
  )
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="task-intake-input"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </Field>
  )
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`
  return `${(size / 1024).toFixed(1)} KB`
}

function ReviewItem({ label, value }) {
  return <div><dt>{label}</dt><dd>{value || "Not provided"}</dd></div>
}

export function NewTaskPage({ existingTaskIds = [], onAnalyze }) {
  const savedDraft = loadTaskDraft()
  const defaultScenario = getDemoScenarioById(defaultDemoScenarioId)
  const [selectedScenarioId, setSelectedScenarioId] = useState(defaultScenario.id)
  const [isCustomMode, setIsCustomMode] = useState(Boolean(savedDraft))
  const [formData, setFormData] = useState(savedDraft?.formData || defaultScenario.task)
  const [currentStep, setCurrentStep] = useState(savedDraft?.step || 3)
  const [attachments, setAttachments] = useState([])
  const [errors, setErrors] = useState({})
  const [attachmentError, setAttachmentError] = useState("")
  const [draftMessage, setDraftMessage] = useState(savedDraft ? "Saved draft restored." : "")

  function updateField(fieldName, value) {
    setIsCustomMode(true)
    setFormData((current) => ({ ...current, id: "", [fieldName]: value }))
    setErrors((current) => ({ ...current, [fieldName]: "" }))
    setDraftMessage("")
  }

  function loadScenario(scenarioId) {
    const scenario = getDemoScenarioById(scenarioId)
    setSelectedScenarioId(scenario.id)
    setFormData(scenario.task)
    setIsCustomMode(false)
    setCurrentStep(3)
    setAttachments([])
    setErrors({})
    setAttachmentError("")
    setDraftMessage("")
  }

  function startCustomTask() {
    setIsCustomMode(true)
    setFormData(customTaskFormData)
    setCurrentStep(1)
    setAttachments([])
    setErrors({})
    setAttachmentError("")
    setDraftMessage("")
  }

  function continueFromBrief() {
    const nextErrors = {
      title: formData.title.trim() ? "" : "Task title is required.",
      description: formData.description.trim() ? "" : "Work brief is required.",
    }
    setErrors(nextErrors)
    if (nextErrors.title || nextErrors.description) return
    setCurrentStep(2)
  }

  function handleAttachment(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    const result = validateAttachment(file, attachmentLimitBytes)
    if (!result.ok) {
      setAttachmentError(result.error)
      return
    }
    setAttachmentError("")
    setAttachments((current) => [...current.filter((item) => item.name !== file.name), file])
  }

  function handleSaveDraft() {
    saveTaskDraft({ formData, step: currentStep })
    setDraftMessage("Draft saved in this browser.")
  }

  function handleAnalyze() {
    const task = isCustomMode
      ? createLocalTaskFromFormData(formData, existingTaskIds)
      : { ...formData, source: "demo", status: "submitted" }
    clearTaskDraft()
    onAnalyze(task)
  }

  return (
    <>
      <PageHeader title="New Task" description="Describe the work, review constraints, then analyze the best execution route." />
      <SectionCard title="Start from a demo scenario" description="Load a deterministic example or start a custom task.">
        <div className="task-intake-demo-row">
          <Field label="Load demo scenario">
            <select aria-label="Load demo scenario" value={selectedScenarioId} onChange={(event) => loadScenario(event.target.value)} className="task-intake-input">
              {demoScenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}
            </select>
          </Field>
          <PrimaryButton variant="secondary" onClick={startCustomTask}>Start custom task</PrimaryButton>
        </div>
      </SectionCard>

      <nav className="task-intake-steps" aria-label="Task intake progress">
        <p>Step {currentStep} of 3</p>
        <ol>{steps.map((step, index) => <li key={step} aria-current={currentStep === index + 1 ? "step" : undefined}><span>{index + 1}</span>{step}</li>)}</ol>
      </nav>

      <form className="task-intake-form" onSubmit={(event) => event.preventDefault()}>
        {currentStep === 1 ? (
          <SectionCard title="Task brief" description="Give the decision engine enough context to understand the work.">
            <div className="space-y-5">
              <Field label="Task title" error={errors.title}><TextInput aria-invalid={Boolean(errors.title)} value={formData.title} onChange={(value) => updateField("title", value)} /></Field>
              <Field label="Work brief" helper="Paste or summarize the request." error={errors.description}>
                <textarea aria-label="Work brief" aria-invalid={Boolean(errors.description)} value={formData.description} onChange={(event) => updateField("description", event.target.value)} rows={6} className="task-intake-input" />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Expected output"><TextInput value={formData.expectedOutput} onChange={(value) => updateField("expectedOutput", value)} /></Field>
                <Field label="Deadline" helper="Optional"><TextInput type="date" value={formData.deadline || ""} onChange={(value) => updateField("deadline", value)} /></Field>
              </div>
              {(errors.title || errors.description) ? <p role="alert" className="task-intake-error">{[errors.title, errors.description].filter(Boolean).join(" ")}</p> : null}
            </div>
          </SectionCard>
        ) : null}

        {currentStep === 2 ? (
          <SectionCard title="Constraints and files" description="Review the signals used for routing and add optional text context.">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectInput label="Audience" value={formData.audience} onChange={(value) => updateField("audience", value)} options={taskFormOptions.audienceOptions} />
              <SelectInput label="Sensitivity" value={formData.sensitivity} onChange={(value) => updateField("sensitivity", value)} options={taskFormOptions.sensitivityOptions} />
              <SelectInput label="Urgency" value={formData.urgency} onChange={(value) => updateField("urgency", value)} options={taskFormOptions.urgencyOptions} />
              <SelectInput label="Budget range" value={formData.budgetRange} onChange={(value) => updateField("budgetRange", value)} options={taskFormOptions.budgetRangeOptions} />
            </div>
            <div className="task-attachment-panel">
              <Field label="Supporting files" helper="Optional. Select .txt or .md files up to 5 MB.">
                <input aria-label="Supporting files" type="file" accept=".txt,.md,text/plain,text/markdown" onChange={handleAttachment} />
              </Field>
              {attachmentError ? <p role="alert" className="task-intake-error">{attachmentError}</p> : null}
              {attachments.map((file) => (
                <div className="task-attachment" key={file.name}>
                  <div><strong>{file.name}</strong><span>{formatFileSize(file.size)}</span><span className="task-attachment-status">Ready</span></div>
                  <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setAttachments((current) => current.filter((item) => item.name !== file.name))}>Remove</button>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {currentStep === 3 ? (
          <SectionCard title="Review task" description="Confirm the intake details before analysis.">
            <dl className="task-intake-review">
              <ReviewItem label="Task title" value={formData.title} />
              <ReviewItem label="Work brief" value={formData.description} />
              <ReviewItem label="Expected output" value={formData.expectedOutput} />
              <ReviewItem label="Deadline" value={formData.deadline} />
              <ReviewItem label="Audience" value={formData.audience} />
              <ReviewItem label="Sensitivity" value={formData.sensitivity} />
              <ReviewItem label="Urgency" value={formData.urgency} />
              <ReviewItem label="Budget range" value={formData.budgetRange} />
            </dl>
          </SectionCard>
        ) : null}

        {draftMessage ? <p role="status" className="task-intake-status">{draftMessage}</p> : null}
        <div className="task-intake-actions">
          {currentStep > 1 ? <PrimaryButton variant="secondary" onClick={() => setCurrentStep((step) => step - 1)}>Back</PrimaryButton> : null}
          {isCustomMode ? <PrimaryButton variant="secondary" onClick={handleSaveDraft}>Save draft</PrimaryButton> : null}
          {currentStep === 1 ? <PrimaryButton onClick={continueFromBrief}>Continue</PrimaryButton> : null}
          {currentStep === 2 ? <PrimaryButton onClick={() => setCurrentStep(3)}>Continue</PrimaryButton> : null}
          {currentStep === 3 ? <PrimaryButton onClick={handleAnalyze}>Analyze Task</PrimaryButton> : null}
        </div>
      </form>
    </>
  )
}
