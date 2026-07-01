import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ENABLED_SPEAKERS, SPEAKERS, speakerImageUrl, type EnabledSpeakerId } from '../../shared/speakers'
import type { NewsReaderState } from '../hooks/useNewsReader'
import { formatTime } from '../utils/formatTime'

const SEEK_STEP_SECONDS = 5

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable
}

type MediaPlayerProps = {
  visible: boolean
  state: NewsReaderState
  title: string
  subtitle: string
  speakerId: EnabledSpeakerId
  errorMessage: string | null
  currentTime: number
  duration: number
  onPlayPause: () => void
  onStop: () => void
  onSeek: (time: number) => void
  onSpeakerChange: (speakerId: EnabledSpeakerId) => void
}

export function MediaPlayer({
  visible,
  state,
  title,
  subtitle,
  speakerId,
  errorMessage,
  currentTime,
  duration,
  onPlayPause,
  onStop,
  onSeek,
  onSpeakerChange,
}: MediaPlayerProps) {
  const [speakerMenuOpen, setSpeakerMenuOpen] = useState(false)
  const speakerMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!speakerMenuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!speakerMenuRef.current?.contains(event.target as Node)) {
        setSpeakerMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSpeakerMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [speakerMenuOpen])

  useEffect(() => {
    if (!visible) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return

      if (event.key === 'Escape') {
        if (speakerMenuOpen) {
          setSpeakerMenuOpen(false)
          return
        }
        if (state === 'playing' || state === 'paused') {
          event.preventDefault()
          onStop()
        }
        return
      }

      if (speakerMenuOpen) return

      if (state === 'loading') return

      if (event.key === ' ' || event.key === 'k' || event.key === 'K') {
        event.preventDefault()
        onPlayPause()
        return
      }

      const isActive = state === 'playing' || state === 'paused'
      if (!isActive) return

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onSeek(Math.max(0, currentTime - SEEK_STEP_SECONDS))
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onSeek(Math.min(duration, currentTime + SEEK_STEP_SECONDS))
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        onSeek(0)
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        onSeek(duration)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    visible,
    speakerMenuOpen,
    state,
    currentTime,
    duration,
    onPlayPause,
    onStop,
    onSeek,
  ])

  if (!visible) return null

  const isActive = state === 'playing' || state === 'paused'
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const activeSpeaker = ENABLED_SPEAKERS.find((speaker) => speaker.id === speakerId) ?? ENABLED_SPEAKERS[0]

  const playPauseLabel =
    state === 'loading'
      ? '…'
      : state === 'playing'
        ? 'Pause'
        : state === 'paused'
          ? 'Resume'
          : state === 'error'
            ? 'Retry'
            : 'Play'

  return (
    <div className="media-player" role="region" aria-label="Audio player">
      <button
        type="button"
        className="media-player__btn media-player__btn--primary"
        onClick={onPlayPause}
        disabled={state === 'loading'}
        aria-label={playPauseLabel}
      >
        {state === 'loading' ? '…' : state === 'playing' ? '❚❚' : '▶'}
      </button>

      <div className="media-player__body">
        <div className="media-player__info">
          <span className="media-player__title">{title}</span>
          <span className="media-player__subtitle">
            {errorMessage ?? (state === 'loading' ? 'Generating audio…' : subtitle)}
          </span>
        </div>

        {isActive && (
          <div className="media-player__progress">
            <span className="media-player__time">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="media-player__scrubber"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(event) => onSeek(Number(event.target.value))}
              aria-label="Seek"
              style={{ '--progress': `${progress}%` } as CSSProperties}
            />
            <span className="media-player__time">{formatTime(duration)}</span>
          </div>
        )}
      </div>

      <div className="media-player__speaker" ref={speakerMenuRef}>
        <button
          type="button"
          className={`media-player__btn media-player__btn--speaker${speakerMenuOpen ? ' media-player__btn--speaker-open' : ''}`}
          onClick={() => setSpeakerMenuOpen((open) => !open)}
          aria-label={`Voice: ${activeSpeaker.label}`}
          aria-expanded={speakerMenuOpen}
          aria-haspopup="listbox"
        >
          <img
            className="media-player__speaker-avatar"
            src={speakerImageUrl(activeSpeaker.id)}
            alt=""
          />
        </button>

        {speakerMenuOpen && (
          <ul className="media-player__speaker-menu" role="listbox" aria-label="Select voice">
            {SPEAKERS.map((speaker) => {
              const isDisabled = !speaker.enabled
              const isActive = speaker.id === speakerId

              return (
                <li
                  key={speaker.id}
                  role="option"
                  aria-selected={isActive}
                  aria-disabled={isDisabled}
                >
                  <button
                    type="button"
                    className={`media-player__speaker-option${isActive ? ' media-player__speaker-option--active' : ''}${isDisabled ? ' media-player__speaker-option--disabled' : ''}`}
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return
                      onSpeakerChange(speaker.id)
                      setSpeakerMenuOpen(false)
                    }}
                  >
                    <img
                      className="media-player__speaker-option-avatar"
                      src={speakerImageUrl(speaker.id)}
                      alt=""
                    />
                    <span>{speaker.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {isActive && (
        <button
          type="button"
          className="media-player__btn"
          onClick={onStop}
          aria-label="Stop"
        >
          ■
        </button>
      )}
    </div>
  )
}
