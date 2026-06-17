import { getOpenAIClient } from "@/app/openai";

export const runtime = "nodejs";

let cachedPrompt: string | null = null;

function getPromptUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const token = process.env.PROMPT_API_TOKEN || "";
  const aiType = process.env.PROMPT_AI_TYPE || "Florence"
  return `${base}/api/v1/ai_prompt?ai_type=${encodeURIComponent(aiType)}&token=${encodeURIComponent(token)}`;
}

async function getMasterPrompt(): Promise<string> {
  if (cachedPrompt) return cachedPrompt;
  try {
    const res = await fetch(getPromptUrl());
    const data = await res.json();
    cachedPrompt = data.prompt;
    return cachedPrompt;
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
