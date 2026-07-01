import { useEffect, useRef } from 'react'

const BAR_COUNT = 80
const INNER_RADIUS_RATIO = 0.22
const MAX_BAR_LENGTH_RATIO = 0.28
const IDLE_BAR_LENGTH_RATIO = 0.04
const YELLOW = '#f5d442'
const WHITE = '#ffffff'

type CircularVisualizerProps = {
  analyser: AnalyserNode | null
  active: boolean
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function mapFrequencyToBars(data: Uint8Array, barCount: number): number[] {
  const bars: number[] = []
  const step = Math.max(1, Math.floor(data.length / barCount))

  for (let i = 0; i < barCount; i++) {
    const start = i * step
    const end = Math.min(start + step, data.length)
    let sum = 0
    for (let j = start; j < end; j++) {
      sum += data[j]
    }
    bars.push(sum / (end - start) / 255)
  }

  return bars
}

function drawVisualizer(
  ctx: CanvasRenderingContext2D,
  size: number,
  barValues: number[],
  idle: boolean,
) {
  const center = size / 2
  const innerRadius = size * INNER_RADIUS_RATIO
  const maxBarLength = size * MAX_BAR_LENGTH_RATIO
  const idleBarLength = size * IDLE_BAR_LENGTH_RATIO

  ctx.clearRect(0, 0, size, size)

  ctx.beginPath()
  ctx.arc(center, center, innerRadius, 0, Math.PI * 2)
  ctx.strokeStyle = YELLOW
  ctx.lineWidth = Math.max(1.5, size * 0.004)
  ctx.stroke()

  const angleStep = (Math.PI * 2) / BAR_COUNT

  for (let i = 0; i < BAR_COUNT; i++) {
    const value = idle ? 0 : barValues[i] ?? 0
    const barLength = idle ? idleBarLength : idleBarLength + value * maxBarLength
    const angle = i * angleStep - Math.PI / 2
    const x1 = center + Math.cos(angle) * innerRadius
    const y1 = center + Math.sin(angle) * innerRadius
    const x2 = center + Math.cos(angle) * (innerRadius + barLength)
    const y2 = center + Math.sin(angle) * (innerRadius + barLength)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = WHITE
    ctx.lineWidth = Math.max(1, size * 0.003)
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

export function CircularVisualizer({ analyser, active }: CircularVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const smoothedRef = useRef<number[]>(Array.from({ length: BAR_COUNT }, () => 0))
  const frameRef = useRef<number | null>(null)
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const size = Math.min(rect.width, rect.height)
      canvas.width = size * dpr
      canvas.height = size * dpr
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawVisualizer(ctx, size, smoothedRef.current, !active || prefersReducedMotion())
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const shouldAnimate = active && analyser && !prefersReducedMotion()

    if (!shouldAnimate) {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      smoothedRef.current = Array.from({ length: BAR_COUNT }, () => 0)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const size = Math.min(canvas.clientWidth, canvas.clientHeight)
        drawVisualizer(ctx, size, smoothedRef.current, true)
      }
      return
    }

    if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
      dataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
    }

    const animate = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx || !dataRef.current) return

      analyser.getByteFrequencyData(dataRef.current)
      const raw = mapFrequencyToBars(dataRef.current, BAR_COUNT)

      for (let i = 0; i < BAR_COUNT; i++) {
        smoothedRef.current[i] = smoothedRef.current[i] * 0.7 + raw[i] * 0.3
      }

      const size = Math.min(canvas.clientWidth, canvas.clientHeight)
      drawVisualizer(ctx, size, smoothedRef.current, false)
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [active, analyser])

  return (
    <canvas
      ref={canvasRef}
      className="circular-visualizer"
      aria-hidden="true"
    />
  )
}
