export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, &quot;0")}:${remainingSeconds.toString().padStart(2, &quot;0")}
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, &quot;0")}
}
