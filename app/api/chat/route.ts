import { getOpenAIClient } from "@/app/openai";

export const runtime = "nodejs";

function getPromptUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const token = process.env.PROMPT_API_TOKEN || "";
  const aiType = process.env.PROMPT_AI_TYPE || "Florence"
  return `${base}/api/v1/ai_prompt?ai_type=${encodeURIComponent(aiType)}&token=${encodeURIComponent(token)}`;
}

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s,)\]}>"']+/g;
  const matches = text.match(urlRegex);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

async function fetchUrlContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Needpedia-Greeter/1.0" },
    });
    if (!res.ok) return "";
    const html = await res.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000);
  } catch {
    return "";
  }
}

async function getMasterPrompt(): Promise<string> {
  try {
    const res = await fetch(getPromptUrl());
    const data = await res.json();
    let prompt = data.prompt || "";

    const urls = extractUrls(prompt);
    if (urls.length > 0) {
      const contents = await Promise.all(
        urls.slice(0, 3).map((url) => fetchUrlContent(url)),
      );
      const sources = urls.slice(0, 3).map((url, i) => {
        const content = contents[i];
        return content
          ? `Source: ${url}\nContent: ${content}`
          : `Source: ${url} (unavailable)`;
      }).join("\n\n");
      prompt += "\n\n---\nThe following source content is available for reference:\n\n" + sources;
    }

    return prompt;
  } catch (error) {
    console.error("Failed to fetch master prompt:", error);
    return "";
  }
}

export async function POST(request: Request) {
  const { messages } = await request.json();
  const openai = getOpenAIClient();

  const masterPrompt = await getMasterPrompt();

  const fullMessages = masterPrompt
    ? [{ role: "system" as const, content: masterPrompt }, ...messages]
    : messages;

  const stream = await openai.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
    messages: fullMessages,
    stream: true,
  });

  return new Response(stream.toReadableStream());
}
