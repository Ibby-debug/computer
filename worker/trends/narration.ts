import { TOPIC_LABELS } from "./constants";
import type { TrendsPayload } from "./types";

const MAX_NARRATION_LENGTH = 1750;

export { MAX_NARRATION_LENGTH };

function sanitize(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\[\](){}*_#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildNarrationScript(payload: TrendsPayload): string {
  const topicName = TOPIC_LABELS[payload.topic];
  const digest = sanitize(payload.digest);

  const topicParts = payload.topics.slice(0, 5).map((topic) => {
    const title = sanitize(topic.title);
    const summary = sanitize(topic.summary);
    return summary && summary !== title ? `${title}. ${summary}` : title;
  });

  const topicsSection =
    topicParts.length > 0 ? ` Top stories: ${topicParts.join(". ")}.` : "";

  let script = `Here's what's trending in ${topicName}. ${digest}.${topicsSection}`;

  if (script.length > MAX_NARRATION_LENGTH) {
    script = `${script.slice(0, MAX_NARRATION_LENGTH - 3).trimEnd()}...`;
  }

  return script;
}
