import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const savePreferenceAnswers = mutation({
  args: {
    prefs: v.array(
      v.object({ questionKey: v.string(), value: v.string(), weight: v.number() })
    ),
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
    for (const pref of args.prefs) {
      const existing = await ctx.db
        .query("preferenceAnswers")
        .withIndex("by_user_and_question", (q) =>
          q.eq("userId", user._id).eq("questionKey", pref.questionKey)
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          value: pref.value,
          weight: pref.weight,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("preferenceAnswers", {
          userId: user._id,
          questionKey: pref.questionKey,
          value: pref.value,
          weight: pref.weight,
          updatedAt: now,
        });
      }
    }

    if (args.complete) {
      await ctx.db.patch(user._id, { preferencesComplete: true });
      await ctx.scheduler.runAfter(0, internal.matching.recomputeMatchesForUser, {
        userId: user._id,
      });
    }
  },
});

export const getPreferenceAnswers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return {};

    const rows = await ctx.db
      .query("preferenceAnswers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const map: Record<string, { value: string; weight: number }> = {};
    for (const row of rows) {
      map[row.questionKey] = { value: row.value, weight: row.weight };
    }
    return map;
  },
});
