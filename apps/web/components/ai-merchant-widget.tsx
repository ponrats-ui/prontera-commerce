"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  askAiMerchant,
  buildAiMerchantContext,
  type AiMerchantMessage,
} from "../lib/ai-merchant";
import type { WorldShop } from "../lib/api";
import type { MerchantIdentity } from "../lib/living-world";

const quickQuestions = [
  "What do you recommend?",
  "Do you have discounts?",
  "Who owns this shop?",
];

export function AiMerchantWidget({
  shop,
  merchant,
}: {
  shop: WorldShop;
  merchant: MerchantIdentity;
}) {
  const context = useMemo(
    () => buildAiMerchantContext(shop, merchant),
    [merchant, shop],
  );
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [messages, setMessages] = useState<AiMerchantMessage[]>([
    {
      id: "welcome",
      role: "merchant",
      content: `${merchant.greeting} I am the shop's disclosed AI assistant, currently running in mock mode.`,
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

    const result = await askAiMerchant(context, cleanQuestion);
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `merchant-${Date.now()}`,
          role: "merchant",
          content: result.response,
        },
      ]);
      setWaiting(false);
    }, 350);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(draft);
  }

  return (
    <section className="ai-merchant-widget">
      <div className="ai-merchant-heading">
        <div>
          <p className="world-kicker">AI shopkeeper · Mock mode</p>
          <h2>Ask {merchant.merchantName}&apos;s assistant</h2>
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
            <p>Checking the merchant&apos;s published shelf…</p>
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
            placeholder="Ask about products, offers, or the merchant"
            value={draft}
          />
        </label>
        <button
          className="world-button primary"
          disabled={waiting}
          type="submit"
        >
          Ask
        </button>
      </form>
      <p className="ai-boundary-note">
        This assistant uses published shop information only. Prices, checkout,
        refunds, and policy exceptions remain under merchant control.
      </p>
    </section>
  );
}
