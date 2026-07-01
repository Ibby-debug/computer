import { MAX_HEADLINES } from './constants'
import type { RssHeadline } from './types'

const RSS_USER_AGENT =
  'Mozilla/5.0 (compatible; NewsBot/1.0; +https://github.com/ainews)'
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504])
const MAX_FETCH_ATTEMPTS = 4

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': RSS_USER_AGENT,
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      cf: {
        cacheTtl: 300,
        cacheEverything: true,
      },
    })

    if (response.ok) {
      const xml = await response.text()
      const headlines = parseRssItems(xml)

      if (headlines.length === 0) {
        throw new Error('No headlines parsed from RSS feed')
      }

      return headlines
    }

    const retryable = RETRYABLE_STATUSES.has(response.status)
    if (!retryable || attempt === MAX_FETCH_ATTEMPTS) {
      throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`)
    }

    await sleep(1000 * 2 ** (attempt - 1))
  }

  throw new Error('RSS fetch failed')
}
