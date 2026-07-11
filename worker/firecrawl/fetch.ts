import { MAX_HEADLINES } from '../trends/constants'
import type { RssHeadline } from '../trends/types'
import { FIRECRAWL_QUERIES, type TopicId } from './constants'

const FIRECRAWL_SEARCH_URL = 'https://api.firecrawl.dev/v2/search'

type FirecrawlNewsResult = {
  title?: string
  url?: string
  snippet?: string
  description?: string
  date?: string
}

type FirecrawlSearchResponse = {
  success?: boolean
  data?: {
    news?: FirecrawlNewsResult[]
    web?: FirecrawlNewsResult[]
  }
  error?: string
}

function toRssHeadline(item: FirecrawlNewsResult): RssHeadline | null {
  const title = item.title?.trim()
  const link = item.url?.trim()
  if (!title || !link) return null

  return {
    title,
    link,
    pubDate: item.date?.trim() ?? '',
  }
}

export async function fetchTopicHeadlines(
  apiKey: string,
  topic: TopicId,
): Promise<RssHeadline[]> {
  const query = FIRECRAWL_QUERIES[topic]

  const response = await fetch(FIRECRAWL_SEARCH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit: MAX_HEADLINES,
      tbs: 'qdr:d',
      sources: ['news'],
      country: 'US',
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Firecrawl ${response.status}: ${text.slice(0, 200)}`)
  }

  const body = (await response.json()) as FirecrawlSearchResponse

  if (body.success === false) {
    throw new Error(body.error ?? 'Firecrawl search failed')
  }

  const newsResults = body.data?.news ?? []
  const webResults = body.data?.web ?? []
  const rawResults = newsResults.length > 0 ? newsResults : webResults

  const headlines = rawResults
    .map(toRssHeadline)
    .filter((headline): headline is RssHeadline => headline !== null)
    .slice(0, MAX_HEADLINES)

  if (headlines.length === 0) {
    throw new Error('No headlines returned from Firecrawl')
  }

  return headlines
}
