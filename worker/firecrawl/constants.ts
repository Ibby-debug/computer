import { TOPIC_LABELS, type TopicId } from '../../shared/topics'

export { TOPIC_LABELS, type TopicId }

export const FIRECRAWL_QUERIES: Record<TopicId, string> = {
  US: 'United States news today',
  GLOBAL: 'world news today',
  CRYPTO: 'cryptocurrency bitcoin news today',
  POLITICS: 'politics news today',
  BUSINESS: 'business finance news today',
  TECHNOLOGY: 'technology news today',
  ENTERTAINMENT: 'entertainment news today',
  SPORTS: 'sports news today',
  SCIENCE: 'science news today',
  HEALTH: 'health medicine news today',
}
