import {
  DEFAULT_TOPIC_ID,
  SUPPORTED_TOPICS,
  TOPIC_LABELS,
  type TopicId,
} from '../../shared/topics'

export { DEFAULT_TOPIC_ID, SUPPORTED_TOPICS, TOPIC_LABELS, type TopicId }

export const RSS_URLS: Record<TopicId, string> = {
  US: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
  GLOBAL:
    'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en',
  CRYPTO:
    'https://news.google.com/rss/search?q=cryptocurrency+bitcoin&hl=en-US&gl=US&ceid=US:en',
  POLITICS:
    'https://news.google.com/rss/search?q=politics&hl=en-US&gl=US&ceid=US:en',
  BUSINESS:
    'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
  TECHNOLOGY:
    'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
  ENTERTAINMENT:
    'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en',
  SPORTS:
    'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en',
  SCIENCE:
    'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en',
  HEALTH:
    'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en',
}

export const TRENDS_KEY_PREFIX = 'trends:'
export const TRENDS_META_KEY = 'trends:meta'
export const TRENDS_TTL_SECONDS = 25200 // 7 hours
export const MAX_HEADLINES = 15

export function trendsKey(topic: TopicId): string {
  return `${TRENDS_KEY_PREFIX}${topic}`
}

export function trendsAudioKey(topic: TopicId, speakerId: string): string {
  return `audio/${topic}/${encodeURIComponent(speakerId)}.mp3`
}
