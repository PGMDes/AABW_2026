export function PrimaryButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
}) {
  const variantClass =
    variant === "secondary"
      ? "primary-button--secondary"
      : "primary-button--primary"

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`primary-button ${variantClass}`}
    >
      {children}
    </button>
  )
}
