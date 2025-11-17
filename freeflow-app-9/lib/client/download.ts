export function downloadFromUrlOrData(
  input: { url?: string; filename: string; mimeType?: string; dataText?: string }
) {
  const isPlaceholder = !input.url || input.url.startsWith('#')
  const href = isPlaceholder
    ? URL.createObjectURL(
        new Blob([input.dataText || ''], { type: input.mimeType || 'text/plain' })
      )
    : input.url!

  const link = document.createElement('a')
  link.href = href
  link.download = input.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  if (isPlaceholder) URL.revokeObjectURL(href)
}


