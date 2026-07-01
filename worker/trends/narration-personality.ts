import type { Speaker } from "../../shared/speakers";
import { MAX_NARRATION_LENGTH } from "./narration";
import { runNarrationRewrite, truncateScript } from "./narration-llm";

function fallbackPersonalityScript(
  factualScript: string,
  speaker: Speaker,
): string {
  const intro = `Alright, ${speaker.label} here. ${speaker.personality.split(".")[0]}.`;
  return truncateScript(`${intro} ${factualScript}`);
}

function buildSystemPrompt(speaker: Speaker): string {
  return `You rewrite news narration scripts for spoken audio delivery.

Speaker: ${speaker.label}
Personality and delivery style: ${speaker.personality}

Match this speaker's voice, rhythm, and attitude throughout. Keep every fact accurate. No invented details. Respond with plain spoken text only.`;
}

function buildUserPrompt(factualScript: string, speaker: Speaker): string {
  return `Rewrite this news narration in ${speaker.label}'s voice and delivery style. Keep it under ${MAX_NARRATION_LENGTH} characters. Plain text only, no JSON or markdown.

${factualScript}`;
}

export async function rewriteNarrationPersonality(
  env: Env,
  factualScript: string,
  speaker: Speaker,
): Promise<string> {
  return runNarrationRewrite(env, {
    factualScript,
    speaker,
    strategyLabel: "personality",
    buildSystemPrompt,
    buildUserPrompt,
    fallback: fallbackPersonalityScript,
  });
}
