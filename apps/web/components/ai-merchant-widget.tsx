"use client";

import { FormEvent, useState } from "react";
import {
  buildAiMerchantContext,
  respondInMockMode,
  type AiMerchantMessage,
  type AiMerchantResult,
} from "../lib/ai-merchant";
import type { WorldShop } from "../lib/api";
import type { MerchantIdentity } from "../lib/living-world";
import { WorldCharacter } from "./world-character";

const quickQuestions = [
  "What do you recommend?",
  "Do you have any promotion?",
  "How much does it cost?",
  "Tell me about this shop.",
  "Is there a live room?",
];

export function AiMerchantWidget({
  shop,
  merchant,
}: {
  shop: WorldShop;
  merchant: MerchantIdentity;
}) {
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [provider, setProvider] = useState<AiMerchantResult["provider"]>("mock");
  const [messages, setMessages] = useState<AiMerchantMessage[]>([
    {
      id: "welcome",
      role: "merchant",
      content: `${merchant.welcomeMessage} I am ${merchant.merchantName}'s disclosed AI shopkeeper. Ask me about products, prices, promotions, live commerce, or the story behind this place.`,
    },
  ]);

  async function ask(question: string) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || waiting) return;
    setDraft("");
    setWaiting(true);
    setMessages((current) => [
      ...current,
      {
        id: `visitor-${Date.now()}`,
        role: "visitor",
        content: cleanQuestion,
      },
    ]);

    const context = buildAiMerchantContext(shop, merchant, cleanQuestion);

    try {
      const response = await fetch("/api/ai-shopkeeper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });

      if (!response.ok) throw new Error("AI shopkeeper route failed");
      const result = (await response.json()) as AiMerchantResult;
      setProvider(result.provider);
      setMessages((current) => [
        ...current,
        {
          id: `merchant-${Date.now()}`,
          role: "merchant",
          content: result.response,
        },
      ]);
    } catch {
      setProvider("mock");
      setMessages((current) => [
        ...current,
        {
          id: `merchant-${Date.now()}`,
          role: "merchant",
          content: respondInMockMode(context),
        },
      ]);
    } finally {
      setWaiting(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(draft);
  }

  return (
    <section className="ai-merchant-widget ai-shopkeeper-console">
      <div className="ai-shopkeeper-profile">
        <div className="ai-shopkeeper-portrait">
          <WorldCharacter
            character={{
              name: merchant.merchantName,
              class: merchant.merchantTitle,
              sprite: merchant.merchantAvatar,
            }}
          />
        </div>
        <div>
          <p className="world-kicker">
            AI shopkeeper · {provider === "openai" ? "Live AI" : "Mock fallback"}
          </p>
          <h2>{merchant.merchantName}</h2>
          <span>{merchant.merchantTitle}</span>
          <small>{shop.name}</small>
        </div>
        <span className="ai-disclosure">AI</span>
      </div>

      <div aria-live="polite" className="merchant-chat-log">
        {messages.map((message) => (
          <div className={`chat-message ${message.role}`} key={message.id}>
            <small>
              {message.role === "merchant"
                ? `${merchant.merchantName}'s AI`
                : "You"}
            </small>
            <p>{message.content}</p>
          </div>
        ))}
        {waiting ? (
          <div className="chat-message merchant thinking">
            <small>{merchant.merchantName}&apos;s AI</small>
            <p>Reading the shelf, promotion board, and merchant story...</p>
          </div>
        ) : null}
      </div>

      <div className="quick-question-row">
        {quickQuestions.map((question) => (
          <button
            disabled={waiting}
            key={question}
            onClick={() => void ask(question)}
            type="button"
          >
            {question}
          </button>
        ))}
      </div>

      <form className="merchant-chat-form" onSubmit={submit}>
        <label>
          Talk to the shopkeeper
          <input
            disabled={waiting}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask for a recommendation, story, price, or promotion"
            value={draft}
          />
        </label>
        <button
          className="world-button primary"
          disabled={waiting}
          type="submit"
        >
          Send
        </button>
      </form>
      <p className="ai-boundary-note">
        Uses published store, product, promotion, region, and merchant context.
        If `OPENAI_API_KEY` is unavailable, Prontera uses contextual mock mode.
      </p>
    </section>
  );
}
