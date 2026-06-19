import { NextResponse } from "next/server";
import {
  buildAiMerchantPrompt,
  respondInMockMode,
  type AiMerchantContext,
  type AiMerchantResult,
} from "../../../lib/ai-merchant";

export async function POST(request: Request) {
  const body = (await request.json()) as { context?: AiMerchantContext };
  const context = body.context;

  if (!context?.visitor?.question) {
    return NextResponse.json(
      { error: "Missing AI shopkeeper context or visitor question." },
      { status: 400 },
    );
  }

  const prompt = buildAiMerchantPrompt(context);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json<AiMerchantResult>({
      provider: "mock",
      mode: "fallback",
      prompt,
      response: respondInMockMode(context),
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_AI_SHOPKEEPER_MODEL ?? "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are a warm, disclosed AI shopkeeper for a commerce world. Follow the provided safety and truthfulness boundaries exactly.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_output_tokens: 260,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI provider returned ${response.status}`);
    }

    const payload = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        content?: Array<{ text?: string }>;
      }>;
    };
    const outputText =
      payload.output_text ??
      payload.output
        ?.flatMap((item) => item.content ?? [])
        .map((item) => item.text)
        .filter(Boolean)
        .join("\n") ??
      "";

    return NextResponse.json<AiMerchantResult>({
      provider: "openai",
      mode: "live",
      prompt,
      response:
        outputText.trim() ||
        "I am here, but I could not form a helpful answer. Please ask the merchant directly.",
    });
  } catch {
    return NextResponse.json<AiMerchantResult>({
      provider: "mock",
      mode: "fallback",
      prompt,
      response: respondInMockMode(context),
    });
  }
}
