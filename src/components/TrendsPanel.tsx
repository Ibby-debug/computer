import { useState } from 'react'
import { DEFAULT_SPEAKER_ID, ENABLED_SPEAKERS, type EnabledSpeakerId } from '../../shared/speakers'
import { HeadlineMarquee } from './HeadlineMarquee'
import { MediaPlayer } from './MediaPlayer'
import { SupportFooter } from './SupportFooter'
import { TopicFilter } from './TopicFilter'
import { VisualizerOverlay } from './VisualizerOverlay'
import { useNewsReader } from '../hooks/useNewsReader'
import { formatRelativeTime, TOPIC_LABELS, useTrends } from '../hooks/useTrends'
import { buildNarrationPreview } from '../utils/buildNarrationPreview'
import type { TopicId } from '../types/trends'

export function TrendsPanel() {
  const { state, topic, selectTopic } = useTrends()
  const reader = useNewsReader()
  const [speakerId, setSpeakerId] = useState<EnabledSpeakerId>(DEFAULT_SPEAKER_ID)

  const canListen = state.status === 'data'
  const activeTopic = state.status === 'data' ? state.data.topic : topic
  const activeSpeaker = ENABLED_SPEAKERS.find((speaker) => speaker.id === speakerId) ?? ENABLED_SPEAKERS[0]

  const handleListen = () => {
    if (state.status !== 'data') return
    if (reader.state === 'playing') {
      reader.pause()
      return
    }
    if (reader.state === 'paused') {
      void reader.resume()
      return
    }
    void reader.play(state.data.topic, speakerId)
  }

  const playerTitle =
    state.status === 'data'
      ? `${TOPIC_LABELS[state.data.topic]} news`
      : `${TOPIC_LABELS[topic]} news`

  const playerSubtitle =
    state.status === 'data'
      ? buildNarrationPreview(state.data, activeSpeaker)
      : `${activeSpeaker.label} is ready to read`

  const showPlayer = canListen || reader.state !== 'idle'
  const isPlayingOverlay = reader.state === 'playing' || reader.state === 'paused'

  const handleSpeakerChange = (nextSpeakerId: EnabledSpeakerId) => {
    reader.stop()
    setSpeakerId(nextSpeakerId)
  }

  const handleTopicSelect = (code: TopicId) => {
    reader.stop()
    selectTopic(code)
  }

  const marqueeHeadlines = state.status === 'data' ? state.data.topics : []
  const marqueeSources = state.status === 'data' ? state.data.sources : []

  const updatedAt = state.status === 'data' ? state.data.updatedAt : null

  return (
    <div
      className={`hn${showPlayer ? ' hn--with-player' : ''}${isPlayingOverlay ? ' hn--playing' : ''}`}
    >
      <VisualizerOverlay
        analyser={reader.analyser}
        isPlaying={reader.state === 'playing'}
        artist={activeSpeaker.label}
        song={playerTitle}
      />

      <header className="hn-header">
        <TopicFilter activeTopic={topic} onSelect={handleTopicSelect} />
        {updatedAt && (
          <time className="hn-header__updated" dateTime={updatedAt}>
            Updated {formatRelativeTime(updatedAt)}
          </time>
        )}
      </header>

      <HeadlineMarquee
        headlines={marqueeHeadlines}
        sources={marqueeSources}
        loading={state.status === 'loading'}
      />

      {(state.status === 'unavailable' || state.status === 'error') && (
        <main className="hn-main">
          {state.status === 'unavailable' && (
            <p className="hn-status">
              {TOPIC_LABELS[state.topic]} trends are not ready yet. Check back after the next update.
            </p>
          )}

          {state.status === 'error' && (
            <p className="hn-status hn-status--error">
              {state.message}. Try another topic or check back after the next update.
            </p>
          )}
        </main>
      )}

      {!canListen && activeTopic && reader.state !== 'idle' && (
        <main className="hn-main">
          <p className="hn-status">Select a topic with available trends to listen.</p>
        </main>
      )}

      <div className="hn__spacer" aria-hidden="true" />

      <MediaPlayer
        visible={showPlayer}
        state={reader.state}
        title={playerTitle}
        subtitle={playerSubtitle}
        speakerId={speakerId}
        errorMessage={reader.errorMessage}
        currentTime={reader.currentTime}
        duration={reader.duration}
        onPlayPause={handleListen}
        onStop={reader.stop}
        onSeek={reader.seek}
        onSpeakerChange={handleSpeakerChange}
      />

      <SupportFooter />
    </div>
  )
}

export type { TopicId }
