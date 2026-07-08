export function SectionCard({
  title,
  description,
  children,
  className = "",
  testId,
}) {
  return (
    <section
      data-testid={testId}
      className={`surface-card p-5 ${className}`}
    >
      {title ? (
        <div className="surface-card__header mb-4">
          <h2 className="surface-card__title">{title}</h2>
          {description ? (
            <p className="surface-card__description mt-1">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
