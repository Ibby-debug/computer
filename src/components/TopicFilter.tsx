import { SUPPORTED_TOPICS } from '../../shared/topics'
import { TOPIC_LABELS } from '../hooks/useTrends'
import type { TopicId } from '../types/trends'

type TopicFilterProps = {
  activeTopic: TopicId
  onSelect: (topic: TopicId) => void
}

export function TopicFilter({ activeTopic, onSelect }: TopicFilterProps) {
  return (
    <nav className="topic-filter" aria-label="Filter by topic">
      {SUPPORTED_TOPICS.map((code) => (
        <button
          key={code}
          type="button"
          className={`topic-filter__btn${activeTopic === code ? ' topic-filter__btn--active' : ''}`}
          onClick={() => onSelect(code)}
        >
          {TOPIC_LABELS[code]}
        </button>
      ))}
    </nav>
  )
}
