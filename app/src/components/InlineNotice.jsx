export function InlineNotice({ tone = "info", children, action }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`inline-notice inline-notice--${tone}`}>
      <span>{children}</span>
      {action ? <span className="inline-notice__action">{action}</span> : null}
    </div>
  )
}
