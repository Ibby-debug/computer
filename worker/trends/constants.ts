import {
  DEFAULT_TOPIC_ID,
  SUPPORTED_TOPICS,
  TOPIC_LABELS,
  type TopicId,
} from '../../shared/topics'

export { DEFAULT_TOPIC_ID, SUPPORTED_TOPICS, TOPIC_LABELS, type TopicId }

export const TRENDS_KEY_PREFIX = 'trends:'
export const TRENDS_META_KEY = 'trends:meta'
export const TRENDS_TTL_SECONDS = 25200 // 7 hours
export const MAX_HEADLINES = 15
export const TOPIC_FETCH_DELAY_MS = 500

export function trendsKey(topic: TopicId): string {
  return `${TRENDS_KEY_PREFIX}${topic}`
}

export function trendsAudioKey(topic: TopicId, speakerId: string): string {
  return `audio/${topic}/${encodeURIComponent(speakerId)}.mp3`
}
