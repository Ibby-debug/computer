import { TOPIC_LABELS, type TopicId, type TrendsPayload } from '../types/trends'
import { NARRATION_STRATEGY_LABELS } from '../../shared/narration-strategies'
import type { Speaker } from '../../shared/speakers'

export function buildNarrationPreview(payload: TrendsPayload, speaker: Speaker): string {
  const topicName = TOPIC_LABELS[payload.topic]
  const firstStory = payload.topics[0]?.title
  const suffix = firstStory ? ` — ${firstStory}` : ''
  const style = NARRATION_STRATEGY_LABELS[speaker.narrationStrategy]
  return `${speaker.label} (${style}) is reading ${topicName} news${suffix}`
}

export type { TopicId }
