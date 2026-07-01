import type { TopicId } from '../../shared/topics'

export type { TopicId }

export type RssHeadline = {
  title: string
  link: string
  pubDate: string
}

export type TrendsPayload = {
  topic: TopicId
  updatedAt: string
  digest: string
  topics: { title: string; summary: string }[]
  sources: { title: string; url: string }[]
  version: 1
}

export type TrendsMeta = {
  lastRun: string
  errors: Record<string, string>
  audioErrors?: Record<string, string>
}
