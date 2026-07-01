import type { Speaker } from "../../shared/speakers";
import { ENABLED_SPEAKERS } from "../../shared/speakers";
import { synthesizeSpeechBufferWithRetry } from "../fish-audio/tts";
import { ConcurrencyLimiter } from "./concurrency";
import { trendsAudioKey } from "./constants";
import { buildNarrationScript } from "./narration";
import { rewriteNarration } from "./rewrite-narration";
import type { TopicId, TrendsPayload } from "./types";

export const FISH_TTS_CONCURRENCY = 4;

export function audioErrorKey(topic: TopicId, speakerId: string): string {
  return `${topic}:${speakerId}`;
}

export function parseAudioErrorKey(key: string): {
  topic: TopicId;
  speakerId: string;
} {
  const colon = key.indexOf(":");
  if (colon === -1) {
    throw new Error(`Invalid audio error key: ${key}`);
  }

  return {
    topic: key.slice(0, colon) as TopicId,
    speakerId: key.slice(colon + 1),
  };
}

export function resolveEnabledSpeaker(speakerId: string): Speaker | undefined {
  return ENABLED_SPEAKERS.find((speaker) => speaker.id === speakerId);
}

export async function generateSingleSpeakerAudio(
  env: Env,
  topic: TopicId,
  speaker: Speaker,
  payload: TrendsPayload,
  factualScript = buildNarrationScript(payload),
): Promise<void> {
  const script = await rewriteNarration(env, factualScript, speaker);
  const audio = await synthesizeSpeechBufferWithRetry(
    env,
    script,
    speaker.voiceId,
  );

  await env.TRENDS_AUDIO.put(trendsAudioKey(topic, speaker.id), audio, {
    httpMetadata: { contentType: "audio/mpeg" },
  });

  console.log(`[trends] ${topic} audio generated for ${speaker.id}`);
}

export async function generateTopicAudio(
  env: Env,
  topic: TopicId,
  payload: TrendsPayload,
  limiter?: ConcurrencyLimiter,
): Promise<Record<string, string>> {
  const factualScript = buildNarrationScript(payload);
  const errors: Record<string, string> = {};
  const pool = limiter ?? new ConcurrencyLimiter(FISH_TTS_CONCURRENCY);

  await Promise.all(
    ENABLED_SPEAKERS.map(async (speaker) => {
      const key = audioErrorKey(topic, speaker.id);
      try {
        await pool.run(() =>
          generateSingleSpeakerAudio(
            env,
            topic,
            speaker,
            payload,
            factualScript,
          ),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors[key] = message;
        console.error(
          `[trends] ${topic} audio failed for ${speaker.id}:`,
          message,
        );
      }
    }),
  );

  return errors;
}

export async function generateAllTopicAudio(
  env: Env,
  payloads: Array<{ topic: TopicId; payload: TrendsPayload }>,
): Promise<Record<string, string>> {
  const limiter = new ConcurrencyLimiter(FISH_TTS_CONCURRENCY);
  const errors: Record<string, string> = {};

  await Promise.all(
    payloads.map(async ({ topic, payload }) => {
      const topicErrors = await generateTopicAudio(env, topic, payload, limiter);
      Object.assign(errors, topicErrors);
    }),
  );

  return errors;
}
