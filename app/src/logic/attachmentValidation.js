const supportedExtensions = [".txt", ".md"]

export function validateAttachment(file, maxBytes) {
  const fileName = file?.name?.toLowerCase() || ""

  if (!supportedExtensions.some((extension) => fileName.endsWith(extension))) {
    return {
      ok: false,
      error: "Only .txt and .md files are supported. PDF and Word support is planned later.",
    }
  }

  if (!file.size) {
    return { ok: false, error: "The selected file is empty." }
  }

  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `The selected file must be ${Math.round(maxBytes / 1024 / 1024)} MB or smaller.`,
    }
  }

  return { ok: true, error: "" }
}
