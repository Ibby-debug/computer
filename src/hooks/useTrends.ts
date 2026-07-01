import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_TOPIC_ID } from '../../shared/topics'
import type { TopicId, TrendsErrorResponse, TrendsPayload } from '../types/trends'
import { TOPIC_LABELS } from '../types/trends'

type TrendsState =
  | { status: 'loading'; topic: TopicId | null }
  | { status: 'data'; data: TrendsPayload }
  | { status: 'error'; message: string }
  | { status: 'unavailable'; topic: TopicId; message: string }

export function useTrends(initialTopic: TopicId = DEFAULT_TOPIC_ID) {
  const [topic, setTopic] = useState<TopicId>(initialTopic)
  const [state, setState] = useState<TrendsState>({ status: 'loading', topic: null })

  const fetchTrends = useCallback(async (targetTopic: TopicId = DEFAULT_TOPIC_ID) => {
    setState({ status: 'loading', topic: targetTopic })

    const url = `/api/trends?topic=${targetTopic}`

    try {
      const response = await fetch(url)
      const body = (await response.json()) as TrendsPayload | TrendsErrorResponse

      if (!response.ok) {
        const message = 'error' in body ? body.error : 'Failed to load trends'
        if (response.status === 404 && 'topic' in body && body.topic) {
          setState({
            status: 'unavailable',
            topic: body.topic,
            message,
          })
          return
        }

        setState({ status: 'error', message })
        return
      }

      const data = body as TrendsPayload
      setTopic(data.topic)
      setState({ status: 'data', data })
    } catch {
      setState({ status: 'error', message: 'Network error loading trends' })
    }
  }, [])

  useEffect(() => {
    void fetchTrends(initialTopic)
  }, [fetchTrends, initialTopic])

  const selectTopic = useCallback(
    (code: TopicId) => {
      setTopic(code)
      void fetchTrends(code)
    },
    [fetchTrends],
  )

  return { state, topic, selectTopic, refetch: fetchTrends }
}

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor(diffMs / (1000 * 60))

  if (hours >= 1) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (minutes >= 1) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  return 'just now'
}

export { formatRelativeTime, TOPIC_LABELS }
