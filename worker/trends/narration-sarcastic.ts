import type { Speaker } from "../../shared/speakers";
import { MAX_NARRATION_LENGTH } from "./narration";
import { runNarrationRewrite, truncateScript } from "./narration-llm";

function fallbackSarcasticScript(
  factualScript: string,
  speaker: Speaker,
): string {
  const intro = `Oh good, more news. ${speaker.label} here, and I'm sure this will be totally surprising.`;
  return truncateScript(`${intro} ${factualScript}`);
}

function buildSystemPrompt(speaker: Speaker): string {
  return `You rewrite news narration scripts for spoken audio delivery with a sharp, sarcastic tone.

Speaker: ${speaker.label}
Personality and delivery style: ${speaker.personality}

Deliver every story with dry wit, ironic understatement, and deadpan skepticism. Use rhetorical questions, faux-innocent observations, and biting asides — but keep the speaker's voice recognizable. Never sound genuinely enthusiastic about obvious or predictable news. Keep every fact accurate. No invented details. Respond with plain spoken text only.`;
}

function buildUserPrompt(factualScript: string, speaker: Speaker): string {
  return `Rewrite this news narration with heavy sarcasm in ${speaker.label}'s voice. Lean into dry humor and ironic framing while keeping all facts intact. Keep it under ${MAX_NARRATION_LENGTH} characters. Plain text only, no JSON or markdown.

${factualScript}`;
}

export async function rewriteNarrationSarcastic(
  env: Env,
  factualScript: string,
  speaker: Speaker,
): Promise<string> {
  return runNarrationRewrite(env, {
    factualScript,
    speaker,
    strategyLabel: "sarcastic",
    buildSystemPrompt,
    buildUserPrompt,
    fallback: fallbackSarcasticScript,
  });
}
