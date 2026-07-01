import type { NarrationStrategyId } from "../../shared/narration-strategies";
import type { Speaker } from "../../shared/speakers";
import { rewriteNarrationPersonality } from "./narration-personality";
import { rewriteNarrationSarcastic } from "./narration-sarcastic";

export async function rewriteNarration(
  env: Env,
  factualScript: string,
  speaker: Speaker,
  strategy: NarrationStrategyId = speaker.narrationStrategy,
): Promise<string> {
  switch (strategy) {
    case "factual":
      return factualScript;
    case "sarcastic":
      return rewriteNarrationSarcastic(env, factualScript, speaker);
    case "personality":
      return rewriteNarrationPersonality(env, factualScript, speaker);
  }
}
