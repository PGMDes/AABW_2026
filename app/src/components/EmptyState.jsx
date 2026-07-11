import { useId } from "react"

export function EmptyState({ title, children, action }) {
  const titleId = useId()

  return (
    <section className="empty-state" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {children}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </section>
  )
}
