import { useCallback, useEffect, useRef, useState } from 'react'
import type { SpeakerId } from '../../shared/speakers'
import type { TopicId } from '../types/trends'

export type NewsReaderState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

function disconnectAudioGraph(
  source: MediaElementAudioSourceNode | null,
  analyser: AnalyserNode | null,
) {
  source?.disconnect()
  analyser?.disconnect()
}

export function useNewsReader() {
  const [state, setState] = useState<NewsReaderState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [playlistActive, setPlaylistActive] = useState(false)
  const [playlistIndex, setPlaylistIndex] = useState(0)
  const [playlistTotal, setPlaylistTotal] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const queueRef = useRef<TopicId[]>([])
  const speakerRef = useRef<SpeakerId | null>(null)
  const onAdvanceRef = useRef<((next: TopicId) => void) | null>(null)
  const playlistIndexRef = useRef(0)
  const playGenerationRef = useRef(0)

  const syncProgress = useCallback((audio: HTMLAudioElement) => {
    setCurrentTime(audio.currentTime)
    if (Number.isFinite(audio.duration)) {
      setDuration(audio.duration)
    }
  }, [])

  const teardownAudioGraph = useCallback(() => {
    disconnectAudioGraph(sourceRef.current, analyserRef.current)
    sourceRef.current = null
    analyserRef.current = null
    setAnalyser(null)
  }, [])

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.ontimeupdate = null
      audioRef.current.onloadedmetadata = null
      audioRef.current = null
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    teardownAudioGraph()
    setCurrentTime(0)
    setDuration(0)
  }, [teardownAudioGraph])

  const clearPlaylist = useCallback(() => {
    queueRef.current = []
    speakerRef.current = null
    onAdvanceRef.current = null
    playlistIndexRef.current = 0
    setPlaylistActive(false)
    setPlaylistIndex(0)
    setPlaylistTotal(0)
  }, [])

  const ensureAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  const connectAudioElement = useCallback(
    async (audio: HTMLAudioElement) => {
      teardownAudioGraph()
      const ctx = await ensureAudioContext()
      const source = ctx.createMediaElementSource(audio)
      const node = ctx.createAnalyser()
      node.fftSize = 256
      node.smoothingTimeConstant = 0.8
      source.connect(node)
      node.connect(ctx.destination)
      sourceRef.current = source
      analyserRef.current = node
      setAnalyser(node)
    },
    [ensureAudioContext, teardownAudioGraph],
  )

  const stop = useCallback(() => {
    playGenerationRef.current += 1
    cleanup()
    clearPlaylist()
    setState('idle')
    setErrorMessage(null)
  }, [cleanup, clearPlaylist])

  const pause = useCallback(() => {
    if (audioRef.current && state === 'playing') {
      audioRef.current.pause()
      setState('paused')
    }
  }, [state])

  const resume = useCallback(async () => {
    if (audioRef.current && state === 'paused') {
      try {
        await ensureAudioContext()
        await audioRef.current.play()
        setState('playing')
      } catch {
        setState('error')
        setErrorMessage('Playback was blocked')
      }
    }
  }, [ensureAudioContext, state])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    const nextTime = Math.max(0, Math.min(time, audio.duration || time))
    audio.currentTime = nextTime
    syncProgress(audio)
  }, [syncProgress])

  const advancePlaylist = useCallback(() => {
    const queue = queueRef.current
    const nextIndex = playlistIndexRef.current + 1

    if (nextIndex >= queue.length) {
      cleanup()
      clearPlaylist()
      setState('idle')
      return
    }

    playlistIndexRef.current = nextIndex
    setPlaylistIndex(nextIndex)
    const nextTopic = queue[nextIndex]
    onAdvanceRef.current?.(nextTopic)
  }, [cleanup, clearPlaylist])

  const retreatPlaylist = useCallback(() => {
    const queue = queueRef.current
    const prevIndex = playlistIndexRef.current - 1

    if (prevIndex < 0) return

    playlistIndexRef.current = prevIndex
    setPlaylistIndex(prevIndex)
    const prevTopic = queue[prevIndex]
    onAdvanceRef.current?.(prevTopic)
  }, [])

  const skipToNext = useCallback(() => {
    if (queueRef.current.length === 0) return
    playGenerationRef.current += 1
    cleanup()
    advancePlaylist()
  }, [cleanup, advancePlaylist])

  const skipToPrevious = useCallback(() => {
    if (queueRef.current.length === 0) return
    if (playlistIndexRef.current <= 0) return
    playGenerationRef.current += 1
    cleanup()
    retreatPlaylist()
  }, [cleanup, retreatPlaylist])

  const playTrack = useCallback(
    async (topic: TopicId, speakerId: SpeakerId, options?: { preservePlaylist?: boolean }) => {
      if (!options?.preservePlaylist) {
        clearPlaylist()
      }

      const generation = playGenerationRef.current
      cleanup()
      setState('loading')
      setErrorMessage(null)

      try {
        const response = await fetch(
          `/api/trends/read?topic=${topic}&speaker=${encodeURIComponent(speakerId)}`,
        )

        if (generation !== playGenerationRef.current) return

        if (!response.ok) {
          let message = 'Could not generate audio'
          try {
            const body = (await response.json()) as { error?: string }
            if (body.error) message = body.error
          } catch {
            // response may not be JSON
          }
          if (response.status === 404 && message === 'Audio not yet available') {
            message = 'Voice not ready yet — check back after the next update.'
          }

          if (queueRef.current.length > 0) {
            advancePlaylist()
            return
          }

          setState('error')
          setErrorMessage(message)
          return
        }

        const blob = await response.blob()
        if (generation !== playGenerationRef.current) return

        const url = URL.createObjectURL(blob)
        objectUrlRef.current = url

        const audio = new Audio(url)
        audioRef.current = audio
        audio.onloadedmetadata = () => syncProgress(audio)
        audio.ontimeupdate = () => syncProgress(audio)
        audio.onended = () => {
          cleanup()
          if (queueRef.current.length > 0) {
            advancePlaylist()
          } else {
            setState('idle')
          }
        }

        await connectAudioElement(audio)
        await audio.play()
        setState('playing')
      } catch {
        cleanup()

        if (queueRef.current.length > 0) {
          advancePlaylist()
          return
        }

        setState('error')
        setErrorMessage('Network error while loading audio')
      }
    },
    [advancePlaylist, cleanup, clearPlaylist, connectAudioElement, syncProgress],
  )

  const play = useCallback(
    async (topic: TopicId, speakerId: SpeakerId) => {
      if (queueRef.current.length > 0) {
        await playTrack(topic, speakerId, { preservePlaylist: true })
        return
      }
      await playTrack(topic, speakerId)
    },
    [playTrack],
  )

  const playQueue = useCallback(
    (
      topics: TopicId[],
      speakerId: SpeakerId,
      onAdvance: (next: TopicId) => void,
    ) => {
      if (topics.length === 0) return

      queueRef.current = topics
      speakerRef.current = speakerId
      onAdvanceRef.current = onAdvance
      playlistIndexRef.current = 0
      setPlaylistActive(true)
      setPlaylistIndex(0)
      setPlaylistTotal(topics.length)

      void playTrack(topics[0], speakerId, { preservePlaylist: true })
    },
    [playTrack],
  )

  useEffect(
    () => () => {
      cleanup()
      void audioContextRef.current?.close()
      audioContextRef.current = null
    },
    [cleanup],
  )

  return {
    state,
    errorMessage,
    currentTime,
    duration,
    analyser,
    playlistActive,
    playlistIndex,
    playlistTotal,
    play,
    playQueue,
    pause,
    resume,
    stop,
    seek,
    skipToNext,
    skipToPrevious,
  }
}
