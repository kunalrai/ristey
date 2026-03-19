import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const saveProfileAnswers = mutation({
  args: {
    answers: v.array(v.object({ questionKey: v.string(), value: v.string() })),
    complete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const now = Date.now();
    for (const answer of args.answers) {
      const existing = await ctx.db
        .query("profileAnswers")
        .withIndex("by_user_and_question", (q) =>
          q.eq("userId", user._id).eq("questionKey", answer.questionKey)
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { value: answer.value, updatedAt: now });
      } else {
        await ctx.db.insert("profileAnswers", {
          userId: user._id,
          questionKey: answer.questionKey,
          value: answer.value,
          updatedAt: now,
        });
      }
    }

    if (args.complete) {
      await ctx.db.patch(user._id, { onboardingComplete: true });
      await ctx.scheduler.runAfter(0, internal.matching.recomputeMatchesForUser, {
        userId: user._id,
      });
    }
  },
});

export const getProfileAnswers = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let targetUserId = args.userId;

    if (!targetUserId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return {};
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();
      if (!user) return {};
      targetUserId = user._id;
    }

    const rows = await ctx.db
      .query("profileAnswers")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId!))
      .collect();

    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.questionKey] = row.value;
    }
    return map;
  },
});
