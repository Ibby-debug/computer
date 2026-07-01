const FISH_TTS_URL = "https://api.fish.audio/v1/tts";

export class FishTtsError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "FishTtsError";
    this.status = status;
  }
}

export async function synthesizeSpeechBuffer(
  env: Env,
  text: string,
  voiceId?: string,
): Promise<ArrayBuffer> {
  const referenceId = voiceId ?? env.FISH_VOICE_ID;

  if (!env.FISH_API_KEY || !referenceId) {
    throw new FishTtsError("Fish Audio is not configured", 503);
  }

  const model = env.FISH_TTS_MODEL ?? "s2.1-pro-free";

  const fishResponse = await fetch(FISH_TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.FISH_API_KEY}`,
      "Content-Type": "application/json",
      model,
    },
    body: JSON.stringify({
      text,
      reference_id: referenceId,
      format: "mp3",
      mp3_bitrate: 128,
      latency: "normal",
      prosody: { speed: 1 },
    }),
  });

  if (!fishResponse.ok) {
    const errorText = await fishResponse.text();
    let message = "Fish Audio TTS request failed";

    try {
      const parsed = JSON.parse(errorText) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      if (errorText) message = errorText.slice(0, 200);
    }

    throw new FishTtsError(message, fishResponse.status);
  }

  return fishResponse.arrayBuffer();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function synthesizeSpeechBufferWithRetry(
  env: Env,
  text: string,
  voiceId?: string,
  maxAttempts = 4,
): Promise<ArrayBuffer> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await synthesizeSpeechBuffer(env, text, voiceId);
    } catch (error) {
      const is429 = error instanceof FishTtsError && error.status === 429;
      if (!is429 || attempt === maxAttempts) throw error;
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }

  throw new FishTtsError("Fish Audio TTS request failed", 503);
}

export async function synthesizeSpeech(
  env: Env,
  text: string,
  voiceId?: string,
): Promise<Response> {
  try {
    const audio = await synthesizeSpeechBuffer(env, text, voiceId);
    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof FishTtsError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
