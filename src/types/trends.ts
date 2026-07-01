import {
  DEFAULT_TOPIC_ID,
  SUPPORTED_TOPICS,
  TOPIC_LABELS,
  type TopicId,
} from '../../shared/topics'

export type { TopicId }

export type TrendsPayload = {
  topic: TopicId
  updatedAt: string
  digest: string
  topics: { title: string; summary: string }[]
  sources: { title: string; url: string }[]
  version: 1
}

export type TrendsErrorResponse = {
  error: string
  supportedTopics?: TopicId[]
  labels?: Record<TopicId, string>
  topic?: TopicId
  label?: string
}

export { DEFAULT_TOPIC_ID, SUPPORTED_TOPICS, TOPIC_LABELS }
