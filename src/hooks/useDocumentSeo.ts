import { useEffect } from 'react'
import { TOPIC_LABELS } from '../../shared/topics'
import {
  DEFAULT_DESCRIPTION,
  buildTopicTitle,
  buildTrendsDescription,
  buildTrendsTitle,
} from '../../shared/seo'
import { applyDocumentSeo } from '../seo/documentSeo'
import type { TopicId } from '../types/trends'

type TrendsSeoState =
  | { status: 'loading'; topic: TopicId | null }
  | { status: 'data'; data: { topic: TopicId; topics: { title: string }[] } }
  | { status: 'error'; message: string }
  | { status: 'unavailable'; topic: TopicId; message: string }

export function useDocumentSeo(state: TrendsSeoState, topic: TopicId) {
  useEffect(() => {
    if (state.status === 'data') {
      const topicLabel = TOPIC_LABELS[state.data.topic]
      const leadHeadline = state.data.topics[0]?.title

      applyDocumentSeo({
        title: buildTrendsTitle(topicLabel, leadHeadline),
        description: buildTrendsDescription(topicLabel, state.data.topics),
      })
      return
    }

    const topicLabel = TOPIC_LABELS[topic]
    applyDocumentSeo({
      title: buildTopicTitle(topicLabel),
      description: DEFAULT_DESCRIPTION,
    })
  }, [state, topic])
}
