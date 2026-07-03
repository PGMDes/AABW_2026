export function formatLabel(value) {
  if (!value) return "Not set"

  const labelOverrides = {
    agent: "Agent",
    human: "Human",
    hybrid: "Hybrid",
    approved_for_launch: "Approved for launch",
    needs_human_review: "Needs human review",
    approval_required: "Needs human review",
    blocked: "Blocked",
    pending_approval: "Needs human review",
    not_required: "No review needed",
    not_started: "Not started",
    not_launched: "Not launched",
    review_required: "Review required",
    human_review: "Human review",
    human_role: "Human role",
    in_progress: "In progress",
    ready_to_launch: "Ready to launch",
    low_medium: "Low to medium",
    medium_high: "Medium to high",
  }

  if (labelOverrides[value]) {
    return labelOverrides[value]
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
