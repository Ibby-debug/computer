import type { Speaker } from "../../shared/speakers";
import { MAX_NARRATION_LENGTH } from "./narration";

export const AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

export function extractResponseText(response: unknown): string {
  if (typeof response === "string") return response;

  if (response && typeof response === "object") {
    const obj = response as Record<string, unknown>;

    if (typeof obj.response === "string") return obj.response;

    if (obj.result && typeof obj.result === "object") {
      const result = obj.result as Record<string, unknown>;
      if (typeof result.response === "string") return result.response;
    }

    if (Array.isArray(obj.choices)) {
      const choice = obj.choices[0] as {
        message?: { content?: string | null; reasoning?: string };
      };
      const message = choice?.message;
      if (message?.content) return message.content;
      if (message?.reasoning) return message.reasoning;
    }
  }

  return JSON.stringify(response);
}

export function stripNoise(text: string): string {
  return text
    .replace(/[\s\S]*?<\/think>/gi, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

export function truncateScript(script: string): string {
  if (script.length <= MAX_NARRATION_LENGTH) return script;
  return `${script.slice(0, MAX_NARRATION_LENGTH - 3).trimEnd()}...`;
}

type NarrationRewriteOptions = {
  factualScript: string;
  speaker: Speaker;
  strategyLabel: string;
  buildSystemPrompt: (speaker: Speaker) => string;
  buildUserPrompt: (factualScript: string, speaker: Speaker) => string;
  fallback: (factualScript: string, speaker: Speaker) => string;
};

export async function runNarrationRewrite(
  env: Env,
  options: NarrationRewriteOptions,
): Promise<string> {
  const {
    factualScript,
    speaker,
    strategyLabel,
    buildSystemPrompt,
    buildUserPrompt,
    fallback,
  } = options;

  try {
    const response = await env.AI.run(AI_MODEL, {
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(speaker),
        },
        {
          role: "user",
          content: buildUserPrompt(factualScript, speaker),
        },
      ],
      max_tokens: 2048,
    });

    const text = stripNoise(extractResponseText(response));
    if (!text) {
      console.error(`[trends] ${strategyLabel} rewrite returned empty response`);
      return fallback(factualScript, speaker);
    }

    return truncateScript(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[trends] ${strategyLabel} rewrite failed:`, message);
    return fallback(factualScript, speaker);
  }
}
