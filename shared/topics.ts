export const SUPPORTED_TOPICS = [
  'US',
  'GLOBAL',
  'CRYPTO',
  'POLITICS',
  'BUSINESS',
  'TECHNOLOGY',
  'ENTERTAINMENT',
  'SPORTS',
  'SCIENCE',
  'HEALTH',
] as const

export type TopicId = (typeof SUPPORTED_TOPICS)[number]

export const TOPIC_LABELS: Record<TopicId, string> = {
  US: 'US',
  GLOBAL: 'Global',
  CRYPTO: 'Crypto',
  POLITICS: 'Politics',
  BUSINESS: 'Business',
  TECHNOLOGY: 'Technology',
  ENTERTAINMENT: 'Entertainment',
  SPORTS: 'Sports',
  SCIENCE: 'Science',
  HEALTH: 'Health',
}

export const DEFAULT_TOPIC_ID: TopicId = 'US'

export function resolveTopic(id: string | null | undefined): TopicId {
  const normalized = id?.toUpperCase()
  if (normalized && SUPPORTED_TOPICS.includes(normalized as TopicId)) {
    return normalized as TopicId
  }
  return DEFAULT_TOPIC_ID
}
