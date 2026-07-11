import { useEffect, useId, useRef } from "react"

export function ConfirmDialog({ open, title, children, confirmLabel = "Confirm", onConfirm, onCancel }) {
  const cancelRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const previouslyFocusedElement = document.activeElement
    cancelRef.current?.focus()

    return () => previouslyFocusedElement?.focus()
  }, [open])

  if (!open) return null

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault()
      onCancel?.()
      return
    }

    if (event.key !== "Tab") {
      return
    }

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)

    if (!firstElement || !lastElement) {
      return
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={onCancel}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="confirm-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
        <div className="confirm-dialog__actions">
          <button ref={cancelRef} type="button" onClick={onCancel}>Cancel</button>
          <button type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}
