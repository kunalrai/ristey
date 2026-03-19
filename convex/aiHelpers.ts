// Regular Convex runtime (not Node.js) — queries and mutations for AI persona
import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ── Read a setting value by key (internal use only) ──────────────────────────
export const getSetting = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    return row?.value ?? null;
  },
});

// ── Fetch all context needed to build the persona prompt ─────────────────────
export const getPersonaContext = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    seedUserId: v.id("users"),
  },
  handler: async (ctx, { conversationId, seedUserId }) => {
    const seedUser = await ctx.db.get(seedUserId);
    if (!seedUser) return null;

    const profileRows = await ctx.db
      .query("profileAnswers")
      .withIndex("by_user", (q) => q.eq("userId", seedUserId))
      .collect();
    const profile: Record<string, string> = {};
    for (const row of profileRows) profile[row.questionKey] = row.value;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .order("asc")
      .collect();
    const recent = messages.slice(-12);

    const convo = await ctx.db.get(conversationId);
    if (!convo) return null;
    const realUserId = convo.userA === seedUserId ? convo.userB : convo.userA;
    const realUser = await ctx.db.get(realUserId);

    return {
      seedUser: {
        _id: seedUser._id,
        displayName: seedUser.displayName,
      },
      profile,
      recentMessages: recent.map((m) => ({
        senderId: m.senderId,
        text: m.text,
        isSeed: m.senderId === seedUserId,
      })),
      realUserName: realUser?.displayName ?? "there",
      lastSenderId: messages[messages.length - 1]?.senderId ?? null,
    };
  },
});

// ── Insert the AI-generated message as the seed user ─────────────────────────
export const sendAIMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
  },
  handler: async (ctx, { conversationId, senderId, text }) => {
    const convo = await ctx.db.get(conversationId);
    if (!convo) return;
    const now = Date.now();
    const isA = convo.userA === senderId;

    await ctx.db.insert("messages", { conversationId, senderId, text, sentAt: now });
    await ctx.db.patch(conversationId, {
      lastMessage: text.slice(0, 80),
      lastMessageAt: now,
      lastSenderId: senderId,
      unreadA: isA ? convo.unreadA : convo.unreadA + 1,
      unreadB: isA ? convo.unreadB + 1 : convo.unreadB,
    });
  },
});
