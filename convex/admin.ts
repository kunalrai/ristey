import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";

const ADMIN_EMAIL = "ikunalrai@gmail.com";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user || user.email !== ADMIN_EMAIL) throw new Error("Forbidden");
  return user;
}

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;
    const onboarded = allUsers.filter((u) => u.onboardingComplete).length;
    const prefsDone = allUsers.filter((u) => u.preferencesComplete).length;
    const seedUsers = allUsers.filter((u) =>
      u.tokenIdentifier.startsWith("seed_test_")
    ).length;
    const realUsers = totalUsers - seedUsers;

    const allScores = await ctx.db.query("matchScores").collect();
    const totalMatches = allScores.length;
    const avgScore =
      totalMatches > 0
        ? Math.round(
            allScores.reduce((s, m) => s + m.mutualScore, 0) / totalMatches
          )
        : 0;
    const highMatches = allScores.filter((m) => m.mutualScore >= 70).length;

    return {
      totalUsers,
      realUsers,
      seedUsers,
      onboarded,
      prefsDone,
      totalMatches,
      avgScore,
      highMatches,
    };
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    return users
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((u) => ({
        _id: u._id,
        displayName: u.displayName,
        email: u.email,
        avatarUrl: u.avatarUrl,
        onboardingComplete: u.onboardingComplete,
        preferencesComplete: u.preferencesComplete,
        createdAt: u.createdAt,
        isSeed: u.tokenIdentifier.startsWith("seed_test_"),
      }));
  },
});

// ── Settings (admin-only key-value store) ───────────────────────────────────
const MASKED = "••••••••••••••••••••••••";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("settings").collect();
    // Return masked values for sensitive keys
    return rows.map((r) => ({
      key: r.key,
      // Show last 4 chars so admin can confirm which key is set
      value: r.value.length > 4
        ? MASKED + r.value.slice(-4)
        : MASKED,
      isSet: r.value.length > 0,
    }));
  },
});

export const updateSetting = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, { key, value }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("settings", { key, value });
    }
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const profileRows = await ctx.db
      .query("profileAnswers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const row of profileRows) await ctx.db.delete(row._id);

    const prefRows = await ctx.db
      .query("preferenceAnswers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const row of prefRows) await ctx.db.delete(row._id);

    const scoresA = await ctx.db
      .query("matchScores")
      .withIndex("by_user_a", (q) => q.eq("userA", args.userId))
      .collect();
    for (const row of scoresA) await ctx.db.delete(row._id);

    const scoresB = await ctx.db
      .query("matchScores")
      .withIndex("by_user_b", (q) => q.eq("userB", args.userId))
      .collect();
    for (const row of scoresB) await ctx.db.delete(row._id);

    await ctx.db.delete(args.userId);
  },
});
