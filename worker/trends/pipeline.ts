import {
  RSS_TOPIC_DELAY_MS,
  RSS_URLS,
  SUPPORTED_TOPICS,
  TRENDS_META_KEY,
  TRENDS_TTL_SECONDS,
  trendsKey,
} from "./constants";
import { generateAllTopicAudio } from "./generate-audio";
import { fetchHeadlines } from "./rss";
import { retryAudioErrors, retryFailedAudio } from "./retry-audio";
import { summarizeHeadlines } from "./summarize";
import type { TopicId, TrendsMeta, TrendsPayload } from "./types";

export async function fetchAndSummarizeTopic(
  env: Env,
  topic: TopicId,
): Promise<TrendsPayload> {
  const headlines = await fetchHeadlines(RSS_URLS[topic]);
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
  const payloads: Array<{ topic: TopicId; payload: TrendsPayload }> = [];

  let succeeded = 0;

  for (let i = 0; i < SUPPORTED_TOPICS.length; i++) {
    const topic = SUPPORTED_TOPICS[i];
    const topicStart = Date.now();

    try {
      const payload = await fetchAndSummarizeTopic(env, topic);
      payloads.push({ topic, payload });
      succeeded++;
      console.log(
        `[trends] ${topic} summarized in ${Date.now() - topicStart}ms`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors[topic] = message;
      console.error(`[trends] ${topic} failed:`, message);
    }

    if (i < SUPPORTED_TOPICS.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RSS_TOPIC_DELAY_MS));
    }
  }
  let audioErrors = await generateAllTopicAudio(env, payloads);

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
