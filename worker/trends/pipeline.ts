import {
  SUPPORTED_TOPICS,
  TOPIC_FETCH_DELAY_MS,
  TRENDS_META_KEY,
  TRENDS_TTL_SECONDS,
  trendsKey,
} from "./constants";
import { fetchTopicHeadlines } from "../firecrawl/fetch";
import { generateTopicAudio } from "./generate-audio";
import { retryAudioErrors, retryFailedAudio } from "./retry-audio";
import { summarizeHeadlines } from "./summarize";
import type { TopicId, TrendsMeta, TrendsPayload } from "./types";

export async function fetchAndSummarizeTopic(
  env: Env,
  topic: TopicId,
): Promise<TrendsPayload> {
  if (!env.FIRECRAWL_API_KEY) {
    throw new Error("Firecrawl not configured");
  }

  const headlines = await fetchTopicHeadlines(env.FIRECRAWL_API_KEY, topic);
  const payload = await summarizeHeadlines(env, topic, headlines);

  await env.TRENDS_KV.put(trendsKey(topic), JSON.stringify(payload), {
    expirationTtl: TRENDS_TTL_SECONDS,
  });

  return payload;
}

export async function runTrendsPipeline(
  env: Env,
  controller?: ScheduledController,
): Promise<void> {
  const startTime = Date.now();
  const errors: Record<string, string> = {};
  let audioErrors: Record<string, string> = {};

  let succeeded = 0;

  for (let i = 0; i < SUPPORTED_TOPICS.length; i++) {
    const topic = SUPPORTED_TOPICS[i];
    const topicStart = Date.now();

    try {
      const payload = await fetchAndSummarizeTopic(env, topic);
      succeeded++;
      console.log(
        `[trends] ${topic} summarized in ${Date.now() - topicStart}ms`,
      );

      const topicAudioErrors = await generateTopicAudio(env, topic, payload);
      Object.assign(audioErrors, topicAudioErrors);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors[topic] = message;
      console.error(`[trends] ${topic} failed:`, message);
    }

    if (i < SUPPORTED_TOPICS.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, TOPIC_FETCH_DELAY_MS));
    }
  }

  if (Object.keys(audioErrors).length > 0) {
    const retryResult = await retryAudioErrors(env, audioErrors);
    audioErrors = retryResult.audioErrors;
  }

  const meta: TrendsMeta = {
    lastRun: new Date().toISOString(),
    errors,
    ...(Object.keys(audioErrors).length > 0 ? { audioErrors } : {}),
  };

  await env.TRENDS_KV.put(TRENDS_META_KEY, JSON.stringify(meta), {
    expirationTtl: TRENDS_TTL_SECONDS,
  });

  console.log("[trends] pipeline finished", {
    cron: controller?.cron,
    scheduledTime: controller?.scheduledTime,
    duration: Date.now() - startTime,
    succeeded,
    failed: SUPPORTED_TOPICS.length - succeeded,
    audioFailures: Object.keys(audioErrors).length,
  });
}

export async function runAudioRetry(
  env: Env,
  controller?: ScheduledController,
) {
  const startTime = Date.now();
  const result = await retryFailedAudio(env);

  console.log("[trends] audio retry cron finished", {
    cron: controller?.cron,
    scheduledTime: controller?.scheduledTime,
    duration: Date.now() - startTime,
    ...result,
  });

  return result;
}
