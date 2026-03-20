import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Returns the canonical pair (smaller ID first) for a conversation
function canonicalPair(a: Id<"users">, b: Id<"users">): [Id<"users">, Id<"users">] {
  return a < b ? [a, b] : [b, a];
}

async function getMe(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user) throw new Error("User not found");
  return user;
}

// ── Get or create a conversation between current user and another ──────────
export const getOrCreateConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const me = await getMe(ctx);
    const [userA, userB] = canonicalPair(me._id, otherUserId);

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_pair", (q: any) => q.eq("userA", userA).eq("userB", userB))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      userA,
      userB,
      lastMessageAt: Date.now(),
      unreadA: 0,
      unreadB: 0,
    });
  },
});

// ── Send a message ──────────────────────────────────────────────────────────
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, { conversationId, text, replyToId }) => {
    const me = await getMe(ctx);
    const convo = await ctx.db.get(conversationId);
    if (!convo) throw new Error("Conversation not found");

    const isA = convo.userA === me._id;
    const now = Date.now();

    await ctx.db.insert("messages", {
      conversationId,
      senderId: me._id,
      text: text.trim(),
      sentAt: now,
      ...(replyToId ? { replyToId } : {}),
    });

    await ctx.db.patch(conversationId, {
      lastMessage: text.trim().slice(0, 80),
      lastMessageAt: now,
      lastSenderId: me._id,
      unreadA: isA ? convo.unreadA : convo.unreadA + 1,
      unreadB: isA ? convo.unreadB + 1 : convo.unreadB,
    });

    // If the other party is a seed persona, schedule an AI reply
    const otherId = isA ? convo.userB : convo.userA;
    const otherUser = await ctx.db.get(otherId);
    if (otherUser?.tokenIdentifier?.startsWith("seed_test_girl_") || otherUser?.tokenIdentifier?.startsWith("seed_test_man_")) {
      // Random realistic delay: 2–7 seconds
      const delayMs = Math.floor(Math.random() * 5000) + 2000;
      await ctx.scheduler.runAfter(delayMs, internal.ai.respondAsPersona, {
        conversationId,
        seedUserId: otherId,
      });
    }
  },
});

// ── Get messages for a conversation ────────────────────────────────────────
export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const me = await getMe(ctx);
    const convo = await ctx.db.get(conversationId);
    if (!convo) return [];
    if (convo.userA !== me._id && convo.userB !== me._id) throw new Error("Forbidden");

    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", conversationId))
      .order("asc")
      .collect();

    return Promise.all(msgs.map(async (msg) => {
      if (!msg.replyToId) return { ...msg, replyTo: null };
      const replyMsg = await ctx.db.get(msg.replyToId);
      if (!replyMsg) return { ...msg, replyTo: null };
      const replySender = await ctx.db.get(replyMsg.senderId);
      return {
        ...msg,
        replyTo: {
          text: replyMsg.text,
          senderName: replySender?.displayName ?? "Unknown",
          isMine: replyMsg.senderId === me._id,
        },
      };
    }));
  },
});

// ── Mark conversation as read ───────────────────────────────────────────────
export const markRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const me = await getMe(ctx);
    const convo = await ctx.db.get(conversationId);
    if (!convo) return;
    const isA = convo.userA === me._id;
    await ctx.db.patch(conversationId, isA ? { unreadA: 0 } : { unreadB: 0 });
  },
});

// ── List all conversations for current user ─────────────────────────────────
export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const me = await getMe(ctx);

    const asA = await ctx.db
      .query("conversations")
      .withIndex("by_user_a", (q: any) => q.eq("userA", me._id))
      .order("desc")
      .collect();

    const asB = await ctx.db
      .query("conversations")
      .withIndex("by_user_b", (q: any) => q.eq("userB", me._id))
      .order("desc")
      .collect();

    const all = [...asA, ...asB].sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    return Promise.all(
      all.map(async (convo) => {
        const otherId = convo.userA === me._id ? convo.userB : convo.userA;
        const other   = await ctx.db.get(otherId);
        const unread  = convo.userA === me._id ? convo.unreadA : convo.unreadB;
        return {
          conversationId: convo._id,
          other: { _id: other?._id, displayName: other?.displayName ?? "Unknown", avatarUrl: other?.avatarUrl },
          lastMessage: convo.lastMessage,
          lastMessageAt: convo.lastMessageAt,
          isMine: convo.lastSenderId === me._id,
          unread,
        };
      })
    );
  },
});

// ── Get total unread count for badge ───────────────────────────────────────
export const getTotalUnread = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;
    const me = await ctx.db
      .query("users")
      .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!me) return 0;

    const asA = await ctx.db.query("conversations").withIndex("by_user_a", (q: any) => q.eq("userA", me._id)).collect();
    const asB = await ctx.db.query("conversations").withIndex("by_user_b", (q: any) => q.eq("userB", me._id)).collect();

    return [...asA, ...asB].reduce((sum, c) => sum + (c.userA === me._id ? c.unreadA : c.unreadB), 0);
  },
});
