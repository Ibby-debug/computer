import { resolveSpeaker } from '../shared/speakers'
import { resolveTopic } from '../shared/topics'
import { TOPIC_LABELS, SUPPORTED_TOPICS, trendsAudioKey, trendsKey } from './trends/constants'
import { generateSingleSpeakerAudio } from './trends/generate-audio'
import { runAudioRetry, runTrendsPipeline } from './trends/pipeline'
import type { TopicId, TrendsPayload } from './trends/types'

const RETRY_AUDIO_CRON = '30 */6 * * *'

function resolveRequestTopic(request: Request): TopicId {
  const url = new URL(request.url)
  return resolveTopic(url.searchParams.get('topic'))
}

function isAuthorizedCronRequest(request: Request, env: Env): boolean {
  if (!env.CRON_SECRET) return false

  const auth = request.headers.get('Authorization')
  if (auth === `Bearer ${env.CRON_SECRET}`) return true

  return request.headers.get('X-Cron-Secret') === env.CRON_SECRET
}

async function getTrendsPayload(
  request: Request,
  env: Env,
): Promise<{ topic: TopicId; payload: TrendsPayload } | Response> {
  const topic = resolveRequestTopic(request)

  const cached = await env.TRENDS_KV.get<TrendsPayload>(trendsKey(topic), 'json')

  if (!cached) {
    return Response.json(
      {
        error: 'Trends not yet available',
        topic,
        label: TOPIC_LABELS[topic],
        supportedTopics: SUPPORTED_TOPICS,
        labels: TOPIC_LABELS,
      },
      { status: 404 },
    )
  }

  return { topic, payload: cached }
}

async function handleTrendsRequest(request: Request, env: Env): Promise<Response> {
  const result = await getTrendsPayload(request, env)
  if (result instanceof Response) return result

  return Response.json(result.payload, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

async function handleTrendsReadRequest(request: Request, env: Env): Promise<Response> {
  const topic = resolveRequestTopic(request)
  const url = new URL(request.url)
  const speaker = resolveSpeaker(url.searchParams.get('speaker'))
  const key = trendsAudioKey(topic, speaker.id)

  let object = await env.TRENDS_AUDIO.get(key)

  if (!object) {
    const cached = await env.TRENDS_KV.get<TrendsPayload>(trendsKey(topic), 'json')
    if (!cached) {
      return Response.json({ error: 'Trends not yet available' }, { status: 404 })
    }

    try {
      await generateSingleSpeakerAudio(env, topic, speaker, cached)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[trends] on-demand audio failed for ${topic}/${speaker.id}:`, message)
      return Response.json({ error: message }, { status: 503 })
    }

    object = await env.TRENDS_AUDIO.get(key)
    if (!object) {
      return Response.json({ error: 'Audio generation failed' }, { status: 503 })
    }
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

async function handleRunPipelineRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  if (!isAuthorizedCronRequest(request, env)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  ctx.waitUntil(runTrendsPipeline(env))
  return Response.json({ status: 'started' }, { status: 202 })
}

async function handleRetryAudioRequest(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  if (!isAuthorizedCronRequest(request, env)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runAudioRetry(env)
  return Response.json(result)
}

export default {
  async scheduled(controller, env, ctx) {
    if (controller.cron === RETRY_AUDIO_CRON) {
      ctx.waitUntil(runAudioRetry(env, controller))
      return
    }

    ctx.waitUntil(runTrendsPipeline(env, controller))
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.pathname === '/api/trends' && request.method === 'GET') {
      return handleTrendsRequest(request, env)
    }

    if (url.pathname === '/api/trends/read' && request.method === 'GET') {
      return handleTrendsReadRequest(request, env)
    }

    if (url.pathname === '/api/trends/run' && request.method === 'POST') {
      return handleRunPipelineRequest(request, env, ctx)
    }

    if (url.pathname === '/api/trends/retry-audio' && request.method === 'POST') {
      return handleRetryAudioRequest(request, env)
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    return new Response(null, { status: 404 })
  },
} satisfies ExportedHandler<Env>
