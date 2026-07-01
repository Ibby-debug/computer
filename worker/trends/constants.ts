import {
  DEFAULT_TOPIC_ID,
  SUPPORTED_TOPICS,
  TOPIC_LABELS,
  type TopicId,
} from '../../shared/topics'

export { DEFAULT_TOPIC_ID, SUPPORTED_TOPICS, TOPIC_LABELS, type TopicId }

// Google News RSS returns 503 from Cloudflare Workers datacenter IPs.
// BBC and CoinDesk feeds are bot-friendly and work reliably from Workers.
export const RSS_URLS: Record<TopicId, string> = {
  US: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml',
  GLOBAL: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  CRYPTO: 'https://www.coindesk.com/arc/outboundfeeds/rss',
  POLITICS: 'https://feeds.bbci.co.uk/news/politics/rss.xml',
  BUSINESS: 'https://feeds.bbci.co.uk/news/business/rss.xml',
  TECHNOLOGY: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
  ENTERTAINMENT: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
  SPORTS: 'https://feeds.bbci.co.uk/sport/rss.xml',
  SCIENCE: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  HEALTH: 'https://feeds.bbci.co.uk/news/health/rss.xml',
}

export const TRENDS_KEY_PREFIX = 'trends:'
export const TRENDS_META_KEY = 'trends:meta'
export const TRENDS_TTL_SECONDS = 25200 // 7 hours
export const MAX_HEADLINES = 15
export const RSS_TOPIC_DELAY_MS = 500

export function trendsKey(topic: TopicId): string {
  return `${TRENDS_KEY_PREFIX}${topic}`
}

export function trendsAudioKey(topic: TopicId, speakerId: string): string {
  return `audio/${topic}/${encodeURIComponent(speakerId)}.mp3`
}
