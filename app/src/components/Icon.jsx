export function Icon({ name, label, className = "" }) {
  return (
    <svg aria-hidden={label ? undefined : "true"} aria-label={label} className={className} role={label ? "img" : undefined}>
      <use href={`/icons.svg#${name}`} />
    </svg>
  )
}
