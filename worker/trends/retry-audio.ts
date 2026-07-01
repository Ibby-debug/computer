import {
  TRENDS_META_KEY,
  TRENDS_TTL_SECONDS,
  trendsKey,
} from "./constants";
import {
  generateSingleSpeakerAudio,
  parseAudioErrorKey,
  resolveEnabledSpeaker,
} from "./generate-audio";
import type { TrendsMeta, TrendsPayload } from "./types";

export type RetryAudioResult = {
  attempted: number;
  succeeded: number;
  failed: number;
  audioErrors: Record<string, string>;
};

export async function retryAudioErrors(
  env: Env,
  pending: Record<string, string>,
): Promise<RetryAudioResult> {
  const keys = Object.keys(pending);

  if (keys.length === 0) {
    return {
      attempted: 0,
      succeeded: 0,
      failed: 0,
      audioErrors: {},
    };
  }

  const remaining: Record<string, string> = {};
  let succeeded = 0;

  for (const key of keys) {
    let topic;
    let speakerId;

    try {
      ({ topic, speakerId } = parseAudioErrorKey(key));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      remaining[key] = message;
      continue;
    }

    const speaker = resolveEnabledSpeaker(speakerId);
    if (!speaker) {
      remaining[key] = `Speaker not enabled: ${speakerId}`;
      continue;
    }

    const payload = await env.TRENDS_KV.get<TrendsPayload>(
      trendsKey(topic),
      "json",
    );
    if (!payload) {
      remaining[key] = "Missing cached trends payload";
      continue;
    }

    try {
      await generateSingleSpeakerAudio(env, topic, speaker, payload);
      succeeded++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      remaining[key] = message;
      console.error(`[trends] retry failed for ${key}:`, message);
    }
  }

  console.log("[trends] audio retry finished", {
    attempted: keys.length,
    succeeded,
    failed: Object.keys(remaining).length,
  });

  return {
    attempted: keys.length,
    succeeded,
    failed: Object.keys(remaining).length,
    audioErrors: remaining,
  };
}

export async function retryFailedAudio(env: Env): Promise<RetryAudioResult> {
  const meta = await env.TRENDS_KV.get<TrendsMeta>(TRENDS_META_KEY, "json");
  const result = await retryAudioErrors(env, meta?.audioErrors ?? {});

  const updatedMeta: TrendsMeta = {
    lastRun: meta?.lastRun ?? new Date().toISOString(),
    errors: meta?.errors ?? {},
    ...(Object.keys(result.audioErrors).length > 0
      ? { audioErrors: result.audioErrors }
      : {}),
  };

  await env.TRENDS_KV.put(TRENDS_META_KEY, JSON.stringify(updatedMeta), {
    expirationTtl: TRENDS_TTL_SECONDS,
  });

  return result;
}
