interface Env {
  TRENDS_KV: KVNamespace
  TRENDS_AUDIO: R2Bucket
  AI: Ai
  FISH_TTS_MODEL: string
  FISH_API_KEY: string
  FISH_VOICE_ID?: string
  CRON_SECRET?: string
  FIRECRAWL_API_KEY?: string
}
