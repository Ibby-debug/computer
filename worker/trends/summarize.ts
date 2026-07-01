import type { RssHeadline, TopicId, TrendsPayload } from "./types";
import { TOPIC_LABELS } from "./constants";

const AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

type AiSummary = {
  digest: string;
  topics: { title: string; summary: string }[];
};

function buildPrompt(topic: TopicId, headlines: RssHeadline[]): string {
  const topicName = TOPIC_LABELS[topic];
  const headlineList = headlines
    .map((h, i) => `${i + 1}. ${h.title}`)
    .join("\n");

  return `Summarize these trending headlines in ${topicName}.

Headlines:
${headlineList}

Return JSON only with keys "digest" (string) and "topics" (array of {"title","summary"}).
Include 5 to 7 topics. Use only the headlines above.`;
}

function extractResponseText(response: unknown): string {
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

function stripNoise(text: string): string {
  return text
    .replace(/[\s\S]*?<\/think>/gi, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

function normalizeSummary(raw: Record<string, unknown>): AiSummary | null {
  const digest =
    (typeof raw.digest === "string" && raw.digest) ||
    (typeof raw.overview === "string" && raw.overview) ||
    (typeof raw.summary === "string" && raw.summary) ||
    null;

  const topicsRaw = raw.topics ?? raw.items ?? raw.stories;
  if (!digest || !Array.isArray(topicsRaw)) return null;

  const topics = topicsRaw
    .slice(0, 5)
    .map((item) => {
      if (typeof item === "string") {
        return { title: item, summary: item };
      }
      if (item && typeof item === "object") {
        const topic = item as Record<string, unknown>;
        const title =
          (typeof topic.title === "string" && topic.title) ||
          (typeof topic.name === "string" && topic.name) ||
          "Untitled";
        const summary =
          (typeof topic.summary === "string" && topic.summary) ||
          (typeof topic.description === "string" && topic.description) ||
          title;
        return { title, summary };
      }
      return null;
    })
    .filter(
      (topic): topic is { title: string; summary: string } => topic !== null,
    );

  if (topics.length === 0) return null;

  return { digest, topics };
}

function fallbackSummary(headlines: RssHeadline[]): AiSummary {
  const top = headlines.slice(0, 5);
  return {
    digest: `Latest headlines: ${top.map((h) => h.title).join(" · ")}`,
    topics: top.map((h) => ({ title: h.title, summary: h.title })),
  };
}

function parseAiResponse(text: string, headlines: RssHeadline[]): AiSummary {
  const cleaned = stripNoise(text);

  const candidates = [
    cleaned,
    ...[...cleaned.matchAll(/\{[\s\S]*\}/g)].map((m) => m[0]),
  ];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>;
      const summary = normalizeSummary(parsed);
      if (summary) return summary;
    } catch {
      // try next candidate
    }
  }

  console.error(
    "[trends] AI response missing required fields:",
    cleaned.slice(0, 500),
  );
  return fallbackSummary(headlines);
}

export async function summarizeHeadlines(
  env: Env,
  topic: TopicId,
  headlines: RssHeadline[],
): Promise<TrendsPayload> {
  const response = await env.AI.run(AI_MODEL, {
    messages: [
      {
        role: "system",
        content: "You summarize news headlines. Respond with JSON only.",
      },
      {
        role: "user",
        content: buildPrompt(topic, headlines),
      },
    ],
    max_tokens: 2048,
  });

  const text = extractResponseText(response);
  const summary = parseAiResponse(text, headlines);

  return {
    topic,
    updatedAt: new Date().toISOString(),
    digest: summary.digest,
    topics: summary.topics,
    sources: headlines
      .slice(0, 5)
      .map((h) => ({ title: h.title, url: h.link })),
    version: 1,
  };
}
