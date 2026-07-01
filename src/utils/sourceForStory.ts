function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function sourceForStory(
  story: { title: string },
  index: number,
  sources: { title: string; url: string }[],
): { title: string; url: string; host: string } | null {
  if (sources.length === 0) return null

  const byTitle = sources.find(
    (source) =>
      source.title.toLowerCase().includes(story.title.toLowerCase()) ||
      story.title.toLowerCase().includes(source.title.toLowerCase()),
  )
  const source = byTitle ?? sources[index] ?? sources[0]
  const host = hostname(source.url)
  return host ? { ...source, host } : null
}
