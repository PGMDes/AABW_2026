export function LoadingSkeleton({ rows = 3, ariaLabel = "Loading" }) {
  return (
    <div role="status" aria-live="polite" aria-label={ariaLabel} className="loading-skeleton">
      {Array.from({ length: rows }, (_, index) => <span key={index} />)}
    </div>
  )
}
