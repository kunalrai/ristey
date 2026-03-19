import { internalAction, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

type ProfileMap = Record<string, string>;
type PrefMap = Record<string, { value: string; weight: number }>;

interface BreakdownEntry {
  // Per-question cosine similarity ∈ [0, 1]
  rawScore: number;
  weight: number;
  // Contribution to the dot-product numerator: w² × sim
  weightedContribution: number;
}

/**
 * Per-question cosine similarity.
 *
 * single_select / boolean_match:
 *   One-hot vectors of length n. Dot product = 1 iff same option, else 0.
 *   Both unit vectors, so cosine = dot product = I(same).
 *
 * overlap (multi_select):
 *   Multi-hot vectors, each L2-normalised to unit length.
 *   cosine = |A ∩ B| / (√|A| · √|B|)
 *   Unlike Jaccard (|A∩B|/|A∪B|), cosine rewards shared items relative to
 *   the geometric mean of the two selection sizes, so it is less punishing when
 *   one side picks more options than the other.
 */
function perQuestionCosine(
  strategy: string,
  prefValue: string,
  candidateValue: string
): number {
  if (!prefValue || !candidateValue) return 0;

  switch (strategy) {
    case "exact_match":
    case "boolean_match":
      return prefValue === candidateValue ? 1 : 0;

    case "overlap": {
      try {
        const prefArr = JSON.parse(prefValue) as string[];
        const candArr = JSON.parse(candidateValue) as string[];
        if (prefArr.length === 0 || candArr.length === 0) return 0;

        const candSet = new Set(candArr);
        let intersection = 0;
        for (const item of prefArr) {
          if (candSet.has(item)) intersection++;
        }

        // cosine on multi-hot unit vectors = |A∩B| / (√|A| · √|B|)
        return intersection / (Math.sqrt(prefArr.length) * Math.sqrt(candArr.length));
      } catch {
        return 0;
      }
    }

    default:
      return 0;
  }
}

/**
 * Weighted cosine similarity score (A → B).
 *
 * We model two vectors in ℝⁿ (one dimension per question):
 *   P_ideal[k]  = w_k          – what perfect compatibility would look like
 *   P_actual[k] = w_k · sim_k  – what we actually observe
 *
 * Directional score = cosine(P_ideal, P_actual)
 *   = (P_ideal · P_actual) / (‖P_ideal‖ · ‖P_actual‖)
 *   = Σ(w_k² · sim_k) / (√Σw_k² · √Σ(w_k·sim_k)²)
 *
 * Properties:
 *   • = 1.0  when every sim_k = 1 (perfect match)
 *   • = 0.0  when every sim_k = 0 (zero match)
 *   • Penalises uneven matches non-linearly – failing a high-weight dimension
 *     collapses ‖P_actual‖, pulling the cosine down more than a weighted
 *     average would.
 *   • Unanswered / unweighted questions are simply omitted (no penalty).
 */
function scoreDirectional(
  prefs: PrefMap,
  candidateProfile: ProfileMap,
  questions: Array<{ key: string; scoringStrategy: string }>
): { score: number; breakdown: Record<string, BreakdownEntry> } {
  const breakdown: Record<string, BreakdownEntry> = {};

  let sumW2 = 0;          // Σ w_k²                  → ‖P_ideal‖²
  let sumW2S2 = 0;        // Σ (w_k · sim_k)²         → ‖P_actual‖²
  let dotProduct = 0;     // Σ w_k² · sim_k           → P_ideal · P_actual

  for (const question of questions) {
    const pref = prefs[question.key];
    const candidateAnswer = candidateProfile[question.key];
    if (!pref || !candidateAnswer) continue;

    const sim = perQuestionCosine(question.scoringStrategy, pref.value, candidateAnswer);
    const w = pref.weight;
    const w2 = w * w;
    const ws = w * sim;

    sumW2 += w2;
    sumW2S2 += ws * ws;
    dotProduct += w2 * sim;

    breakdown[question.key] = {
      rawScore: sim,
      weight: w,
      weightedContribution: w2 * sim,
    };
  }

  let score: number;
  if (sumW2 === 0 || sumW2S2 === 0) {
    // No answered questions or every sim = 0
    score = sumW2 === 0 ? 50 : 0;
  } else {
    const magIdeal = Math.sqrt(sumW2);
    const magActual = Math.sqrt(sumW2S2);
    score = (dotProduct / (magIdeal * magActual)) * 100;
  }

  return { score: Math.round(score * 10) / 10, breakdown };
}

function harmonicMean(a: number, b: number): number {
  if (a + b === 0) return 0;
  return Math.round(((2 * a * b) / (a + b)) * 10) / 10;
}

export const recomputeMatchesForUser = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const me = await ctx.runQuery(internal.matching.getUserById, { userId: args.userId });
    const myGender = (me as { gender?: string } | null)?.gender;

    const [myProfile, myPrefs, questions, allUsers] = await Promise.all([
      ctx.runQuery(internal.matching.getProfileForUser, { userId: args.userId }),
      ctx.runQuery(internal.matching.getPrefsForUser, { userId: args.userId }),
      ctx.runQuery(api.questions.getAllQuestions, {}),
      ctx.runQuery(internal.matching.getOnboardedUsers, { excludeGender: myGender }),
    ]);

    const candidates = (allUsers as Array<{ _id: Id<"users"> }>).filter(
      (u) => u._id !== args.userId
    );

    for (const candidate of candidates) {
      const candidateProfile = await ctx.runQuery(
        internal.matching.getProfileForUser,
        { userId: candidate._id }
      );
      const candidatePrefs = await ctx.runQuery(
        internal.matching.getPrefsForUser,
        { userId: candidate._id }
      );

      const { score: scoreAtoB, breakdown: breakdownAtoB } = scoreDirectional(
        myPrefs as PrefMap,
        candidateProfile as ProfileMap,
        questions
      );
      const { score: scoreBtoA, breakdown: breakdownBtoA } = scoreDirectional(
        candidatePrefs as PrefMap,
        myProfile as ProfileMap,
        questions
      );
      const mutualScore = harmonicMean(scoreAtoB, scoreBtoA);

      await ctx.runMutation(internal.matching.upsertMatchScore, {
        userA: args.userId,
        userB: candidate._id,
        scoreAtoB,
        scoreBtoA,
        mutualScore,
        breakdown: JSON.stringify(breakdownAtoB),
      });

      await ctx.runMutation(internal.matching.upsertMatchScore, {
        userA: candidate._id,
        userB: args.userId,
        scoreAtoB: scoreBtoA,
        scoreBtoA: scoreAtoB,
        mutualScore,
        breakdown: JSON.stringify(breakdownBtoA),
      });
    }
  },
});

export const getOnboardedUsers = internalQuery({
  args: { excludeGender: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_onboarding", (q) => q.eq("onboardingComplete", true))
      .collect();
    if (!args.excludeGender) return users;
    return users.filter((u) => !u.gender || u.gender !== args.excludeGender);
  },
});

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getProfileForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("profileAnswers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.questionKey] = row.value;
    }
    return map;
  },
});

export const getPrefsForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("preferenceAnswers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const map: Record<string, { value: string; weight: number }> = {};
    for (const row of rows) {
      map[row.questionKey] = { value: row.value, weight: row.weight };
    }
    return map;
  },
});

export const upsertMatchScore = internalMutation({
  args: {
    userA: v.id("users"),
    userB: v.id("users"),
    scoreAtoB: v.number(),
    scoreBtoA: v.number(),
    mutualScore: v.number(),
    breakdown: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("matchScores")
      .withIndex("by_pair", (q) =>
        q.eq("userA", args.userA).eq("userB", args.userB)
      )
      .unique();

    const data = { ...args, computedAt: Date.now() };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("matchScores", data);
    }
  },
});
