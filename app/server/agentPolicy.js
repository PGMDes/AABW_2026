const SECRET_PATTERNS = [
  /(?:sk|rk|pk)_[A-Za-z0-9_-]{12,}/i,
  /(?:openai|api|secret|access)[_-]?key\s*[:=]\s*\S+/i,
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----/i,
]

export function classifySensitivity({ declaredSensitivity, text }) {
  const matchedRule = SECRET_PATTERNS.find((pattern) => pattern.test(String(text || "")))
  const blocked = declaredSensitivity === "high" || Boolean(matchedRule)

  return {
    blocked,
    status: blocked ? "blocked_high_sensitivity" : "allowed",
    reason: declaredSensitivity === "high"
      ? "The task is marked high sensitivity and cannot be sent to an external provider."
      : matchedRule
        ? "The attachment appears to contain a credential or private key and cannot be sent to an external provider."
        : null,
  }
}

export function buildBoundedAttachmentContext(attachments, maximumCharacters = 100000) {
  let remaining = maximumCharacters
  const sections = []

  for (const attachment of attachments) {
    if (remaining <= 0) break

    const header = `Source: ${attachment.fileName}\n`
    const available = Math.max(0, remaining - header.length)
    const text = String(attachment.extractedText || "").slice(0, available)
    const section = `${header}${text}`

    if (section.length <= remaining) {
      sections.push(section)
      remaining -= section.length
    }
  }

  return sections.join("\n\n")
}

export function validateAgentOutput(value) {
  const isStringArray = (items) => Array.isArray(items) && items.every((item) => typeof item === "string")
  const validSources = Array.isArray(value?.sources) && value.sources.every(
    (source) => typeof source?.fileName === "string" && typeof source?.excerpt === "string",
  )

  if (
    !value ||
    typeof value.draft !== "string" ||
    typeof value.summary !== "string" ||
    !isStringArray(value.warnings) ||
    !isStringArray(value.limitations) ||
    !validSources
  ) {
    throw new Error("Invalid agent output: expected draft, summary, warnings, limitations, and sources.")
  }

  return {
    draft: value.draft.trim(),
    summary: value.summary.trim(),
    warnings: value.warnings.map((item) => item.trim()),
    limitations: value.limitations.map((item) => item.trim()),
    sources: value.sources.map((source) => ({
      fileName: source.fileName.trim(),
      excerpt: source.excerpt.trim().slice(0, 500),
    })),
  }
}
