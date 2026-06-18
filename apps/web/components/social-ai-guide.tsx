"use client";

import { useState } from "react";

const guidance: Record<string, string> = {
  merchants:
    "Luna in Artisan Valley is welcoming festival visitors today. Professor Byte is demonstrating repairs in Tech Republic.",
  guilds:
    "The Makers' Hearth is hosting an open workshop, while the Six Roads Fellowship is ideal for meeting citizens across regions.",
  events:
    "Coffee Festival is the closest gathering. Tech Expo follows four days later if you enjoy practical inventions.",
  friends:
    "Nari and Ren are online. Nari shares your interest in merchant stories; Ren knows the Tech Republic well.",
};

export function SocialAiGuide() {
  const [answer, setAnswer] = useState(
    "I am Mira, your disclosed AI Town Guide. I can introduce people, guilds, events, and merchant destinations.",
  );
  return (
    <section className="social-ai-guide">
      <div className="social-ai-portrait">
        <span>AI</span>
        <strong>Mira</strong>
        <small>Town Guide</small>
      </div>
      <div>
        <p className="world-kicker">Social AI · Mock mode</p>
        <h2>What would you like to discover today?</h2>
        <p className="social-ai-answer">{answer}</p>
        <div className="social-ai-actions">
          {Object.entries(guidance).map(([key, value]) => (
            <button key={key} onClick={() => setAnswer(value)} type="button">
              {key}
            </button>
          ))}
        </div>
        <small>
          Mira recommends from published world and civilization information and
          does not act on behalf of merchants or citizens.
        </small>
      </div>
    </section>
  );
}
