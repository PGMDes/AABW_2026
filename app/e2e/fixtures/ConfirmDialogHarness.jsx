import { useState } from "react"
import { createRoot } from "react-dom/client"
import { ConfirmDialog } from "../../src/components/ConfirmDialog"
import "../../src/index.css"

export function DialogHarness() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open launch dialog
      </button>
      <ConfirmDialog
        open={open}
        title="Launch this option?"
        confirmLabel="Launch"
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      >
        <p>Confirm the governed launch.</p>
      </ConfirmDialog>
    </>
  )
}

createRoot(document.getElementById("root")).render(<DialogHarness />)
