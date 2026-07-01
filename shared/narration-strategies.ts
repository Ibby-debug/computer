export const NARRATION_STRATEGIES = [
  "factual",
  "personality",
  "sarcastic",
] as const;

export type NarrationStrategyId = (typeof NARRATION_STRATEGIES)[number];

export const NARRATION_STRATEGY_LABELS: Record<NarrationStrategyId, string> = {
  factual: "Straight news",
  personality: "In character",
  sarcastic: "Sarcastic",
};
