import { mutation } from "./_generated/server";

const TEST_GIRLS = [
  {
    displayName: "Priya Sharma",
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    profile: {
      location: "north_india",
      caste: "brahmin",
      diet: "veg",
      kids: "yes",
      career: "balanced",
      music: JSON.stringify(["bollywood", "classical"]),
      movies: JSON.stringify(["drama", "romance"]),
      politics: "moderate",
      religion: "moderately",
      ethnicity: "south_asian",
    },
    prefs: {
      location: { value: "north_india", weight: 8 },
      caste: { value: "brahmin", weight: 7 },
      diet: { value: "veg", weight: 8 },
      kids: { value: "yes", weight: 9 },
      career: { value: "balanced", weight: 7 },
      music: { value: JSON.stringify(["bollywood", "classical"]), weight: 4 },
      movies: { value: JSON.stringify(["drama", "romance"]), weight: 3 },
      politics: { value: "moderate", weight: 5 },
      religion: { value: "moderately", weight: 7 },
      ethnicity: { value: "south_asian", weight: 4 },
    },
  },
  {
    displayName: "Ananya Iyer",
    avatarUrl: "https://randomuser.me/api/portraits/women/46.jpg",
    profile: {
      location: "south_india",
      caste: "brahmin",
      diet: "veg",
      kids: "open",
      career: "very_important",
      music: JSON.stringify(["classical", "pop"]),
      movies: JSON.stringify(["documentary", "drama"]),
      politics: "progressive",
      religion: "spiritual_not_religious",
      ethnicity: "south_asian",
    },
    prefs: {
      location: { value: "south_india", weight: 6 },
      caste: { value: "brahmin", weight: 5 },
      diet: { value: "veg", weight: 7 },
      kids: { value: "open", weight: 8 },
      career: { value: "very_important", weight: 9 },
      music: { value: JSON.stringify(["classical", "pop"]), weight: 3 },
      movies: { value: JSON.stringify(["documentary", "drama"]), weight: 4 },
      politics: { value: "progressive", weight: 6 },
      religion: { value: "spiritual_not_religious", weight: 6 },
      ethnicity: { value: "south_asian", weight: 4 },
    },
  },
  {
    displayName: "Nisha Patel",
    avatarUrl: "https://randomuser.me/api/portraits/women/48.jpg",
    profile: {
      location: "west_india",
      caste: "vaishya",
      diet: "jain",
      kids: "yes",
      career: "family_first",
      music: JSON.stringify(["bollywood", "devotional"]),
      movies: JSON.stringify(["comedy", "romance"]),
      politics: "conservative",
      religion: "very_religious",
      ethnicity: "south_asian",
    },
    prefs: {
      location: { value: "west_india", weight: 7 },
      caste: { value: "vaishya", weight: 8 },
      diet: { value: "jain", weight: 9 },
      kids: { value: "yes", weight: 9 },
      career: { value: "family_first", weight: 6 },
      music: { value: JSON.stringify(["bollywood", "devotional"]), weight: 4 },
      movies: { value: JSON.stringify(["comedy", "romance"]), weight: 3 },
      politics: { value: "conservative", weight: 6 },
      religion: { value: "very_religious", weight: 8 },
      ethnicity: { value: "south_asian", weight: 5 },
    },
  },
  {
    displayName: "Kavya Reddy",
    avatarUrl: "https://randomuser.me/api/portraits/women/50.jpg",
    profile: {
      location: "south_india",
      caste: "other_hindu",
      diet: "non_veg",
      kids: "open",
      career: "very_important",
      music: JSON.stringify(["pop", "hip_hop", "edm"]),
      movies: JSON.stringify(["action", "sci_fi", "comedy"]),
      politics: "progressive",
      religion: "not_religious",
      ethnicity: "south_asian",
    },
    prefs: {
      location: { value: "south_india", weight: 5 },
      caste: { value: "other_hindu", weight: 3 },
      diet: { value: "non_veg", weight: 6 },
      kids: { value: "open", weight: 7 },
      career: { value: "very_important", weight: 9 },
      music: { value: JSON.stringify(["pop", "hip_hop", "edm"]), weight: 5 },
      movies: { value: JSON.stringify(["action", "sci_fi"]), weight: 4 },
      politics: { value: "progressive", weight: 7 },
      religion: { value: "not_religious", weight: 6 },
      ethnicity: { value: "south_asian", weight: 3 },
    },
  },
  {
    displayName: "Meera Singh",
    avatarUrl: "https://randomuser.me/api/portraits/women/52.jpg",
    profile: {
      location: "north_india",
      caste: "kshatriya",
      diet: "non_veg",
      kids: "yes",
      career: "balanced",
      music: JSON.stringify(["bollywood", "pop", "rock"]),
      movies: JSON.stringify(["action", "drama", "romance"]),
      politics: "moderate",
      religion: "moderately",
      ethnicity: "south_asian",
    },
    prefs: {
      location: { value: "north_india", weight: 7 },
      caste: { value: "kshatriya", weight: 5 },
      diet: { value: "non_veg", weight: 5 },
      kids: { value: "yes", weight: 9 },
      career: { value: "balanced", weight: 8 },
      music: { value: JSON.stringify(["bollywood", "pop"]), weight: 4 },
      movies: { value: JSON.stringify(["drama", "romance"]), weight: 4 },
      politics: { value: "moderate", weight: 5 },
      religion: { value: "moderately", weight: 6 },
      ethnicity: { value: "south_asian", weight: 4 },
    },
  },
  {
    displayName: "Zara Khan",
    avatarUrl: "https://randomuser.me/api/portraits/women/54.jpg",
    profile: {
      location: "north_india",
      caste: "muslim",
      diet: "non_veg",
      kids: "yes",
      career: "balanced",
      music: JSON.stringify(["bollywood", "pop", "jazz"]),
      movies: JSON.stringify(["drama", "romance", "comedy"]),
      politics: "moderate",
      religion: "very_religious",
      ethnicity: "south_asian",
    },
    prefs: {
      location: { value: "north_india", weight: 6 },
      caste: { value: "muslim", weight: 9 },
      diet: { value: "non_veg", weight: 7 },
      kids: { value: "yes", weight: 9 },
      career: { value: "balanced", weight: 7 },
      music: { value: JSON.stringify(["bollywood", "pop"]), weight: 4 },
      movies: { value: JSON.stringify(["drama", "romance"]), weight: 3 },
      politics: { value: "moderate", weight: 5 },
      religion: { value: "very_religious", weight: 9 },
      ethnicity: { value: "south_asian", weight: 5 },
    },
  },
  {
    displayName: "Simran Kaur",
    avatarUrl: "https://randomuser.me/api/portraits/women/56.jpg",
    profile: {
      location: "north_india",
      caste: "sikh",
      diet: "non_veg",
      kids: "open",
      career: "very_important",
      music: JSON.stringify(["bollywood", "pop", "hip_hop"]),
      movies: JSON.stringify(["comedy", "action", "romance"]),
      politics: "moderate",
      religion: "moderately",
      ethnicity: "south_asian",
    },
    prefs: {
      location: { value: "north_india", weight: 6 },
      caste: { value: "sikh", weight: 8 },
      diet: { value: "non_veg", weight: 5 },
      kids: { value: "open", weight: 8 },
      career: { value: "very_important", weight: 8 },
      music: { value: JSON.stringify(["bollywood", "pop"]), weight: 4 },
      movies: { value: JSON.stringify(["comedy", "romance"]), weight: 3 },
      politics: { value: "moderate", weight: 4 },
      religion: { value: "moderately", weight: 6 },
      ethnicity: { value: "south_asian", weight: 4 },
    },
  },
  {
    displayName: "Riya Joshi",
    avatarUrl: "https://randomuser.me/api/portraits/women/58.jpg",
    profile: {
      location: "west_india",
      caste: "brahmin",
      diet: "vegan",
      kids: "no",
      career: "very_important",
      music: JSON.stringify(["jazz", "classical", "pop"]),
      movies: JSON.stringify(["documentary", "sci_fi", "drama"]),
      politics: "progressive",
      religion: "spiritual_not_religious",
      ethnicity: "south_asian",
    },
    prefs: {
      location: { value: "west_india", weight: 5 },
      caste: { value: "brahmin", weight: 4 },
      diet: { value: "vegan", weight: 8 },
      kids: { value: "no", weight: 10 },
      career: { value: "very_important", weight: 9 },
      music: { value: JSON.stringify(["jazz", "classical"]), weight: 5 },
      movies: { value: JSON.stringify(["documentary", "sci_fi"]), weight: 5 },
      politics: { value: "progressive", weight: 8 },
      religion: { value: "spiritual_not_religious", weight: 7 },
      ethnicity: { value: "south_asian", weight: 3 },
    },
  },
  {
    displayName: "Pooja Nair",
    avatarUrl: "https://randomuser.me/api/portraits/women/60.jpg",
    profile: {
      location: "south_india",
      caste: "other_hindu",
      diet: "eggetarian",
      kids: "open",
      career: "balanced",
      music: JSON.stringify(["classical", "devotional", "bollywood"]),
      movies: JSON.stringify(["drama", "documentary", "romance"]),
      politics: "apolitical",
      religion: "very_religious",
      ethnicity: "south_asian",
    },
    prefs: {
      location: { value: "south_india", weight: 7 },
      caste: { value: "other_hindu", weight: 5 },
      diet: { value: "eggetarian", weight: 6 },
      kids: { value: "open", weight: 8 },
      career: { value: "balanced", weight: 7 },
      music: { value: JSON.stringify(["classical", "bollywood"]), weight: 4 },
      movies: { value: JSON.stringify(["drama", "documentary"]), weight: 4 },
      politics: { value: "apolitical", weight: 3 },
      religion: { value: "very_religious", weight: 8 },
      ethnicity: { value: "south_asian", weight: 4 },
    },
  },
  {
    displayName: "Divya Menon",
    avatarUrl: "https://randomuser.me/api/portraits/women/62.jpg",
    profile: {
      location: "abroad",
      caste: "other_hindu",
      diet: "non_veg",
      kids: "open",
      career: "very_important",
      music: JSON.stringify(["pop", "edm", "rock"]),
      movies: JSON.stringify(["sci_fi", "action", "anime"]),
      politics: "progressive",
      religion: "not_religious",
      ethnicity: "south_asian",
    },
    prefs: {
      location: { value: "abroad", weight: 8 },
      caste: { value: "other_hindu", weight: 3 },
      diet: { value: "non_veg", weight: 5 },
      kids: { value: "open", weight: 7 },
      career: { value: "very_important", weight: 10 },
      music: { value: JSON.stringify(["pop", "edm"]), weight: 5 },
      movies: { value: JSON.stringify(["sci_fi", "anime"]), weight: 5 },
      politics: { value: "progressive", weight: 7 },
      religion: { value: "not_religious", weight: 6 },
      ethnicity: { value: "south_asian", weight: 3 },
    },
  },
];

export const seedTestGirls = mutation({
  args: {},
  handler: async (ctx, _args) => {
    const now = Date.now();
    const created: string[] = [];

    for (let i = 0; i < TEST_GIRLS.length; i++) {
      const girl = TEST_GIRLS[i];
      const tokenIdentifier = `seed_test_girl_${i + 1}`;

      // Skip if already seeded
      const existing = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .unique();
      if (existing) {
        created.push(`${girl.displayName} (already exists)`);
        continue;
      }

      const userId = await ctx.db.insert("users", {
        tokenIdentifier,
        displayName: girl.displayName,
        avatarUrl: girl.avatarUrl,
        gender: "female",
        onboardingComplete: true,
        preferencesComplete: true,
        createdAt: now,
        lastActive: now,
      });

      // Insert profile answers
      for (const [questionKey, value] of Object.entries(girl.profile)) {
        await ctx.db.insert("profileAnswers", {
          userId,
          questionKey,
          value,
          updatedAt: now,
        });
      }

      // Insert preference answers
      for (const [questionKey, pref] of Object.entries(girl.prefs)) {
        await ctx.db.insert("preferenceAnswers", {
          userId,
          questionKey,
          value: pref.value,
          weight: pref.weight,
          updatedAt: now,
        });
      }

      created.push(girl.displayName);
    }

    return { created };
  },
});

export const patchSeedAvatars = mutation({
  args: {},
  handler: async (ctx, _args) => {
    const updated: string[] = [];
    for (let i = 0; i < TEST_GIRLS.length; i++) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", `seed_test_girl_${i + 1}`))
        .unique();
      if (user) {
        await ctx.db.patch(user._id, { avatarUrl: TEST_GIRLS[i].avatarUrl });
        updated.push(TEST_GIRLS[i].displayName);
      }
    }
    return { updated };
  },
});

export const patchSeedGenders = mutation({
  args: {},
  handler: async (ctx, _args) => {
    for (let i = 1; i <= TEST_GIRLS.length; i++) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", `seed_test_girl_${i}`))
        .unique();
      if (user) await ctx.db.patch(user._id, { gender: "female" });
    }
    return { ok: true };
  },
});

export const clearTestGirls = mutation({
  args: {},
  handler: async (ctx, _args) => {
    const deleted: string[] = [];

    for (let i = 1; i <= TEST_GIRLS.length; i++) {
      const tokenIdentifier = `seed_test_girl_${i}`;
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .unique();
      if (!user) continue;

      // Delete profile answers
      const profileRows = await ctx.db
        .query("profileAnswers")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      for (const row of profileRows) await ctx.db.delete(row._id);

      // Delete preference answers
      const prefRows = await ctx.db
        .query("preferenceAnswers")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      for (const row of prefRows) await ctx.db.delete(row._id);

      // Delete match scores involving this user
      const scoresA = await ctx.db
        .query("matchScores")
        .withIndex("by_user_a", (q) => q.eq("userA", user._id))
        .collect();
      for (const row of scoresA) await ctx.db.delete(row._id);

      const scoresB = await ctx.db
        .query("matchScores")
        .withIndex("by_user_b", (q) => q.eq("userB", user._id))
        .collect();
      for (const row of scoresB) await ctx.db.delete(row._id);

      await ctx.db.delete(user._id);
      deleted.push(user.displayName);
    }

    return { deleted };
  },
});
