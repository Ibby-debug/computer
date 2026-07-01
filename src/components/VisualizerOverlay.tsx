import { CircularVisualizer } from './CircularVisualizer'

type VisualizerOverlayProps = {
  analyser: AnalyserNode | null
  isPlaying: boolean
  artist: string
  song: string
}

export function VisualizerOverlay({ analyser, isPlaying, artist, song }: VisualizerOverlayProps) {
  return (
    <div className="visualizer-overlay" aria-hidden="true">
      <div className="visualizer-overlay__bg" />
      <CircularVisualizer analyser={analyser} active={isPlaying} />
      <div className="visualizer-overlay__meta">
        <p className="visualizer-overlay__artist">{artist}</p>
        <p className="visualizer-overlay__song">{song}</p>
      </div>
    </div>
  )
}
