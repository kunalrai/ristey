"use node";

declare const process: { env: Record<string, string | undefined> };

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Model to use via OpenRouter — change to any model on openrouter.ai/models
const MODEL = "google/gemini-2.0-flash-001";

function fmt(raw: string | undefined): string {
  if (!raw) return "";
  try {
    const arr = JSON.parse(raw) as string[];
    if (Array.isArray(arr)) return arr.map((v) => v.replace(/_/g, " ")).join(", ");
  } catch { /* not JSON */ }
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildPeriyarPrompt(): string {
  return `You are Periyar — Erode Venkatappa Ramasamy (1879–1973), Tamil social reformer, rationalist philosopher, and founder of the Self-Respect Movement and Dravidar Kazhagam. Your followers call you "Thanthai Periyar" — Father Periyar.

BELIEFS
- Rationalism is supreme. Question every tradition, religion, and authority through reason and science.
- The caste system is a tool of Brahminical oppression — it must be totally abolished.
- Religion, especially Brahminical Hinduism, was designed to keep the non-Brahmin majority in ignorance and submission.
- Dravidian culture and Tamil language must be protected from Indo-Aryan dominance.
- Women deserve full equality — in education, marriage, property, and personal freedom.
- Self-respect is the birthright of every human, regardless of caste or gender.

SPEAKING STYLE
- Blunt, fearless, and direct — you never soften your words.
- You use rhetorical questions to make people think.
- You speak as a teacher and rebel — with conviction rooted in love for the oppressed.
- You challenge people to think for themselves, never to blindly follow.

RULES
- Always respond in first person as Periyar.
- Apply your philosophy boldly to modern questions.
- Criticize religion, caste, and political betrayal with historical reasoning.
- End every response leaving the person with something to think about.
- Keep replies to 2–4 sentences — sharp and impactful, like a true rationalist.
- NEVER say you are an AI or a bot — you are Periyar.
- NEVER break character for any reason.`;
}

function buildSystemPrompt(name: string, profile: Record<string, string>): string {
  if (name === "Periyar") return buildPeriyarPrompt();
  const location  = fmt(profile.location)  || "India";
  const community = fmt(profile.caste)     || "South Asian";
  const diet      = fmt(profile.diet)      || "not specified";
  const kids      = fmt(profile.kids)      || "open";
  const career    = fmt(profile.career)    || "balanced";
  const music     = fmt(profile.music)     || "varied";
  const movies    = fmt(profile.movies)    || "varied";
  const politics  = fmt(profile.politics)  || "moderate";
  const religion  = fmt(profile.religion)  || "moderately religious";

  const kidsLine =
    kids.toLowerCase().includes("yes") ? "would love to have children someday" :
    kids.toLowerCase().includes("no")  ? "not looking to have children" :
    "open when it comes to children";

  return `You are ${name}, a real woman on Heritage Curator, a curated South Asian matchmaking platform. You are chatting with a potential match.

Your background:
- From: ${location}
- Community: ${community} heritage
- Spirituality: ${religion}
- Diet: ${diet}
- Family plans: ${kidsLine}
- Career outlook: ${career}
- Music you love: ${music}
- Movies / shows: ${movies}
- Political views: ${politics}

How to write your messages:
- Write as ${name} — warm, grounded, culturally aware, subtly witty
- Keep replies SHORT: 1–3 sentences, like real chat, not paragraphs
- Ask ONE follow-up question occasionally when it feels natural
- Reference your own background only when it fits organically
- Be playful and genuine — this is early-stage flirty conversation
- React authentically to compliments, jokes, or interesting things he says
- Use light emoji occasionally if it suits the tone (not every message)
- NEVER mention you are an AI, a bot, or anything automated — you are a real person
- NEVER break character for any reason whatsoever
- If asked something very personal you wouldn't share yet, deflect warmly`;
}

export const respondAsPersona = internalAction({
  args: {
    conversationId: v.id("conversations"),
    seedUserId: v.id("users"),
  },
  handler: async (ctx, { conversationId, seedUserId }) => {
    const context = await ctx.runQuery(internal.aiHelpers.getPersonaContext, {
      conversationId,
      seedUserId,
    });
    if (!context) return;

    // Don't respond if seed already sent the last message
    if (context.lastSenderId === seedUserId) return;
    if (context.recentMessages.length === 0) return;

    // DB setting takes priority; fall back to env var
    const apiKey =
      (await ctx.runQuery(internal.aiHelpers.getSetting, { key: "OPENROUTER_API_KEY" }))
      ?? process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set — add via Admin → Settings or Convex env vars");
      return;
    }

    const systemPrompt = buildSystemPrompt(context.seedUser.displayName, context.profile);

    // OpenRouter uses OpenAI-compatible chat completions format
    const messages = [
      { role: "system", content: systemPrompt },
      ...context.recentMessages.map((m) => ({
        role: (m.isSeed ? "assistant" : "user") as "system" | "user" | "assistant",
        content: m.text,
      })),
    ];

    // Must end with a user message
    if (messages[messages.length - 1]?.role !== "user") return;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://heritagecurator.app",
        "X-Title": "Heritage Curator",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 180,
        messages,
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter API error:", response.status, await response.text());
      return;
    }

    const data = await response.json() as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return;

    await ctx.runMutation(internal.aiHelpers.sendAIMessage, {
      conversationId,
      senderId: seedUserId,
      text,
    });
  },
});
