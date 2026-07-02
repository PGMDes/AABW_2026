export function formatLabel(value) {
  if (!value) return "Not set"
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
