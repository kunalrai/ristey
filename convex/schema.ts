import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),   // from Clerk JWT subject
    email: v.optional(v.string()),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    gender: v.optional(v.string()), // "male" | "female" | "other"
    onboardingComplete: v.boolean(),
    preferencesComplete: v.boolean(),
    createdAt: v.number(),
    lastActive: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_onboarding", ["onboardingComplete"]),

  questions: defineTable({
    key: v.string(),
    category: v.string(),
    text: v.string(),
    type: v.union(
      v.literal("single_select"),
      v.literal("multi_select"),
      v.literal("location"),
      v.literal("boolean")
    ),
    options: v.optional(
      v.array(v.object({ value: v.string(), label: v.string() }))
    ),
    defaultWeight: v.number(),
    scoringStrategy: v.union(
      v.literal("exact_match"),
      v.literal("overlap"),
      v.literal("boolean_match")
    ),
    order: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_order", ["order"]),

  profileAnswers: defineTable({
    userId: v.id("users"),
    questionKey: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_question", ["userId", "questionKey"]),

  preferenceAnswers: defineTable({
    userId: v.id("users"),
    questionKey: v.string(),
    value: v.string(),
    weight: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_question", ["userId", "questionKey"]),

  conversations: defineTable({
    userA: v.id("users"),   // always the lexicographically smaller ID
    userB: v.id("users"),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.number(),
    lastSenderId: v.optional(v.id("users")),
    unreadA: v.number(),    // unread count for userA
    unreadB: v.number(),
  })
    .index("by_user_a", ["userA", "lastMessageAt"])
    .index("by_user_b", ["userB", "lastMessageAt"])
    .index("by_pair",   ["userA", "userB"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
    sentAt: v.number(),
  })
    .index("by_conversation", ["conversationId", "sentAt"]),

  matchScores: defineTable({
    userA: v.id("users"),
    userB: v.id("users"),
    scoreAtoB: v.number(),
    scoreBtoA: v.number(),
    mutualScore: v.number(),
    breakdown: v.string(),
    computedAt: v.number(),
  })
    .index("by_user_a", ["userA", "mutualScore"])
    .index("by_user_b", ["userB", "mutualScore"])
    .index("by_pair", ["userA", "userB"]),
});
