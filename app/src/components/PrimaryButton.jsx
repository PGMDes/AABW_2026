export function PrimaryButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
}) {
  const baseClass =
    "inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
  const variantClass =
    variant === "secondary"
      ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
      : "bg-slate-950 text-white hover:bg-slate-800"

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass}`}
    >
      {children}
    </button>
  )
}
