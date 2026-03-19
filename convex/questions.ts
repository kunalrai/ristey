import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const QUESTION_BANK = [
  {
    key: "location",
    category: "basics",
    text: "Where are you located?",
    type: "single_select" as const,
    options: [
      { value: "north_india", label: "North India" },
      { value: "south_india", label: "South India" },
      { value: "east_india", label: "East India" },
      { value: "west_india", label: "West India" },
      { value: "central_india", label: "Central India" },
      { value: "northeast_india", label: "Northeast India" },
      { value: "abroad", label: "Abroad / NRI" },
    ],
    defaultWeight: 7,
    scoringStrategy: "exact_match" as const,
    order: 1,
  },
  {
    key: "caste",
    category: "identity",
    text: "What is your caste / community?",
    type: "single_select" as const,
    options: [
      { value: "brahmin", label: "Brahmin" },
      { value: "kshatriya", label: "Kshatriya" },
      { value: "vaishya", label: "Vaishya" },
      { value: "other_hindu", label: "Other Hindu" },
      { value: "muslim", label: "Muslim" },
      { value: "christian", label: "Christian" },
      { value: "sikh", label: "Sikh" },
      { value: "jain", label: "Jain" },
      { value: "buddhist", label: "Buddhist" },
      { value: "prefer_not_to_say", label: "Prefer not to say" },
    ],
    defaultWeight: 6,
    scoringStrategy: "exact_match" as const,
    order: 2,
  },
  {
    key: "diet",
    category: "lifestyle",
    text: "What is your diet preference?",
    type: "single_select" as const,
    options: [
      { value: "veg", label: "Vegetarian" },
      { value: "non_veg", label: "Non-Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "eggetarian", label: "Eggetarian" },
      { value: "jain", label: "Jain" },
    ],
    defaultWeight: 6,
    scoringStrategy: "exact_match" as const,
    order: 3,
  },
  {
    key: "kids",
    category: "family",
    text: "Do you want kids?",
    type: "single_select" as const,
    options: [
      { value: "yes", label: "Yes, definitely" },
      { value: "open", label: "Open to it" },
      { value: "no", label: "No" },
      { value: "already_have", label: "I already have kids" },
    ],
    defaultWeight: 9,
    scoringStrategy: "exact_match" as const,
    order: 4,
  },
  {
    key: "career",
    category: "values",
    text: "How important is career to you?",
    type: "single_select" as const,
    options: [
      { value: "very_important", label: "Very important – it's my priority" },
      { value: "balanced", label: "Balanced – career and life equally" },
      { value: "family_first", label: "Family first, career secondary" },
      { value: "flexible", label: "Flexible / Still figuring out" },
    ],
    defaultWeight: 7,
    scoringStrategy: "exact_match" as const,
    order: 5,
  },
  {
    key: "music",
    category: "interests",
    text: "What kind of music do you enjoy?",
    type: "multi_select" as const,
    options: [
      { value: "bollywood", label: "Bollywood" },
      { value: "classical", label: "Classical / Hindustani" },
      { value: "pop", label: "Pop / International" },
      { value: "rock", label: "Rock / Metal" },
      { value: "hip_hop", label: "Hip-Hop / Rap" },
      { value: "devotional", label: "Devotional / Spiritual" },
      { value: "jazz", label: "Jazz / Blues" },
      { value: "edm", label: "EDM / Electronic" },
    ],
    defaultWeight: 4,
    scoringStrategy: "overlap" as const,
    order: 6,
  },
  {
    key: "movies",
    category: "interests",
    text: "What genres of movies / shows do you like?",
    type: "multi_select" as const,
    options: [
      { value: "drama", label: "Drama" },
      { value: "comedy", label: "Comedy" },
      { value: "action", label: "Action / Thriller" },
      { value: "romance", label: "Romance" },
      { value: "documentary", label: "Documentary" },
      { value: "horror", label: "Horror / Suspense" },
      { value: "sci_fi", label: "Sci-Fi / Fantasy" },
      { value: "anime", label: "Anime" },
    ],
    defaultWeight: 3,
    scoringStrategy: "overlap" as const,
    order: 7,
  },
  {
    key: "politics",
    category: "values",
    text: "How would you describe your political views?",
    type: "single_select" as const,
    options: [
      { value: "progressive", label: "Progressive / Liberal" },
      { value: "moderate", label: "Moderate / Centrist" },
      { value: "conservative", label: "Conservative / Traditional" },
      { value: "apolitical", label: "Apolitical / Don't care much" },
    ],
    defaultWeight: 5,
    scoringStrategy: "exact_match" as const,
    order: 8,
  },
  {
    key: "religion",
    category: "identity",
    text: "How religious / spiritual are you?",
    type: "single_select" as const,
    options: [
      { value: "very_religious", label: "Very religious – it's central to my life" },
      { value: "moderately", label: "Moderately religious" },
      { value: "spiritual_not_religious", label: "Spiritual but not religious" },
      { value: "not_religious", label: "Not religious / Atheist" },
    ],
    defaultWeight: 7,
    scoringStrategy: "exact_match" as const,
    order: 9,
  },
  {
    key: "ethnicity",
    category: "identity",
    text: "What is your ethnicity / background?",
    type: "single_select" as const,
    options: [
      { value: "south_asian", label: "South Asian" },
      { value: "east_asian", label: "East Asian" },
      { value: "southeast_asian", label: "Southeast Asian" },
      { value: "middle_eastern", label: "Middle Eastern" },
      { value: "african", label: "African" },
      { value: "european", label: "European" },
      { value: "latin", label: "Latin / Hispanic" },
      { value: "mixed", label: "Mixed / Other" },
    ],
    defaultWeight: 4,
    scoringStrategy: "exact_match" as const,
    order: 10,
  },
];

export const seedQuestions = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("questions").collect();
    if (existing.length > 0) return { seeded: false, count: existing.length };

    for (const q of QUESTION_BANK) {
      await ctx.db.insert("questions", q);
    }
    return { seeded: true, count: QUESTION_BANK.length };
  },
});

export const getAllQuestions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("questions").withIndex("by_order").collect();
  },
});

export const updateQuestion = mutation({
  args: {
    id: v.id("questions"),
    text: v.string(),
    defaultWeight: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user || user.email !== "ikunalrai@gmail.com") throw new Error("Forbidden");
    await ctx.db.patch(args.id, {
      text: args.text,
      defaultWeight: Math.min(10, Math.max(1, args.defaultWeight)),
    });
  },
});
