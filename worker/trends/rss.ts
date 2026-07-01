import { MAX_HEADLINES } from './constants'
import type { RssHeadline } from './types'

function extractTag(xml: string, tag: string): string | null {
  const cdataMatch = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))
  if (cdataMatch) return cdataMatch[1].trim()

  const plainMatch = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return plainMatch ? plainMatch[1].trim() : null
}

function parseRssItems(xml: string): RssHeadline[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/g) ?? []

  return items
    .map((item) => {
      const title = extractTag(item, 'title')
      const link = extractTag(item, 'link')
      const pubDate = extractTag(item, 'pubDate') ?? ''

      if (!title || !link) return null

      return { title, link, pubDate }
    })
    .filter((headline): headline is RssHeadline => headline !== null)
    .slice(0, MAX_HEADLINES)
}

export async function fetchHeadlines(rssUrl: string): Promise<RssHeadline[]> {
  const response = await fetch(rssUrl, {
    headers: {
      'User-Agent': 'CloudflareWorker/1.0',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
  })

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`)
  }

  const xml = await response.text()
  const headlines = parseRssItems(xml)

  if (headlines.length === 0) {
    throw new Error('No headlines parsed from RSS feed')
  }

  return headlines
}
