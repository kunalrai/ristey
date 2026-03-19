import { query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getMatchFeed = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    const me = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!me) return { page: [], isDone: true, continueCursor: "" };

    const result = await ctx.db
      .query("matchScores")
      .withIndex("by_user_a", (q) => q.eq("userA", me._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const oppositeGender = me.gender === "male" ? "female" : me.gender === "female" ? "male" : null;

    const enriched = await Promise.all(
      result.page.map(async (score) => {
        const otherUser = await ctx.db.get(score.userB);
        if (!otherUser) return null;
        // filter to opposite gender only (skip if either side has no gender set)
        if (oppositeGender && otherUser.gender && otherUser.gender !== oppositeGender) return null;

        const profileRows = await ctx.db
          .query("profileAnswers")
          .withIndex("by_user", (q) => q.eq("userId", score.userB))
          .collect();
        const profile: Record<string, string> = {};
        for (const row of profileRows) {
          profile[row.questionKey] = row.value;
        }

        return {
          userId: otherUser._id,
          displayName: otherUser.displayName,
          avatarUrl: otherUser.avatarUrl,
          mutualScore: score.mutualScore,
          scoreAtoB: score.scoreAtoB,
          scoreBtoA: score.scoreBtoA,
          breakdown: score.breakdown,
          profile,
        };
      })
    );

    return { ...result, page: enriched.filter(Boolean) };
  },
});

export const getBestMatchScore = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const me = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!me) return null;
    const top = await ctx.db
      .query("matchScores")
      .withIndex("by_user_a", (q) => q.eq("userA", me._id))
      .order("desc")
      .first();
    return top ? Math.round(top.mutualScore) : null;
  },
});

export const getMatchDetail = query({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const me = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!me) return null;

    const score = await ctx.db
      .query("matchScores")
      .withIndex("by_pair", (q) =>
        q.eq("userA", me._id).eq("userB", args.targetUserId)
      )
      .unique();

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) return null;

    const profileRows = await ctx.db
      .query("profileAnswers")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .collect();
    const profile: Record<string, string> = {};
    for (const row of profileRows) {
      profile[row.questionKey] = row.value;
    }

    return { user: targetUser, score, profile };
  },
});
