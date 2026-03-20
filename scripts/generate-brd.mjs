import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, PageBreak,
} from "docx";
import { writeFileSync } from "fs";

const CRIMSON = "800020";
const GOLD    = "C5A059";
const NAVY    = "1C2B3A";
const STONE   = "F5F0E6";
const WHITE   = "FFFFFF";
const LIGHT   = "EDE8DC";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 36,
        color: CRIMSON,
        font: "Georgia",
      }),
    ],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: NAVY,
        font: "Georgia",
      }),
    ],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: CRIMSON,
        font: "Calibri",
      }),
    ],
  });
}

function body(text, { bold = false, italic = false, color = "333333" } = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        bold,
        italic,
        size: 22,
        color,
        font: "Calibri",
      }),
    ],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        size: 22,
        color: "333333",
        font: "Calibri",
      }),
    ],
  });
}

function rule() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { color: GOLD, size: 6, style: BorderStyle.SINGLE } },
    children: [],
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function labelValue(label, value) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, color: NAVY, font: "Calibri" }),
      new TextRun({ text: value, size: 22, color: "333333", font: "Calibri" }),
    ],
  });
}

function simpleTable(headers, rows, headerBg = CRIMSON, headerColor = WHITE) {
  const headerCells = headers.map((h) =>
    new TableCell({
      shading: { fill: headerBg, type: ShadingType.CLEAR },
      children: [
        new Paragraph({
          children: [new TextRun({ text: h, bold: true, size: 20, color: headerColor, font: "Calibri" })],
          spacing: { after: 60 },
        }),
      ],
    })
  );

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell) =>
        new TableCell({
          shading: { fill: ri % 2 === 0 ? WHITE : LIGHT, type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              children: [new TextRun({ text: cell, size: 20, color: "333333", font: "Calibri" })],
              spacing: { after: 60 },
            }),
          ],
        })
      ),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...dataRows],
  });
}

// ─── Cover Page ───────────────────────────────────────────────────────────────

const coverPage = [
  new Paragraph({ spacing: { before: 1200 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "THE HERITAGE CURATOR",
        bold: true,
        size: 52,
        color: CRIMSON,
        font: "Georgia",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: "Ristey — Curated Matchmaking Platform",
        size: 30,
        color: GOLD,
        font: "Georgia",
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: {
      bottom: { color: GOLD, size: 8, style: BorderStyle.SINGLE },
      top:    { color: GOLD, size: 8, style: BorderStyle.SINGLE },
    },
    spacing: { before: 100, after: 100 },
    children: [
      new TextRun({
        text: "Business Requirements Document (BRD)",
        bold: true,
        size: 28,
        color: NAVY,
        font: "Calibri",
        allCaps: true,
      }),
    ],
  }),
  new Paragraph({ spacing: { before: 400 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Version 1.0", size: 24, color: "666666", font: "Calibri" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "March 2026", size: 24, color: "666666", font: "Calibri" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100 },
    children: [new TextRun({ text: "Prepared by: Kunal Rai", size: 24, color: "666666", font: "Calibri" })],
  }),
  pageBreak(),
];

// ─── 1. Executive Summary ─────────────────────────────────────────────────────

const section1 = [
  h1("1. Executive Summary"),
  body(
    "Ristey (The Heritage Curator) is a mobile-first Progressive Web App (PWA) designed for South Asian matrimonial matchmaking. Unlike traditional matrimonial portals that rely on manual filtering, Ristey uses a weighted compatibility scoring algorithm based on cosine similarity to algorithmically surface the most compatible matches for each user."
  ),
  body(
    "The platform combines a modern swipe-based discovery interface with serious cultural and lifestyle compatibility signals — enabling users to find partners who align with their values around family, religion, career, diet, and personal interests. An integrated real-time messaging system and AI-powered seed personas ensure an engaging experience even during early platform growth."
  ),
  body(
    "This Business Requirements Document defines the functional requirements, business objectives, user personas, system scope, and success metrics for Ristey v1.0."
  ),
  rule(),
];

// ─── 2. Business Objectives ───────────────────────────────────────────────────

const section2 = [
  h1("2. Business Objectives"),
  h2("2.1 Primary Objectives"),
  bullet("Build a premium, curated matchmaking platform for the South Asian diaspora."),
  bullet("Differentiate from traditional matrimonial portals through algorithmic compatibility scoring and modern UX."),
  bullet("Drive user engagement via real-time messaging and high-quality match recommendations."),
  bullet("Establish a sustainable monetisation model through tiered memberships."),
  h2("2.2 Secondary Objectives"),
  bullet("Leverage AI-generated personas to simulate an active network during early user acquisition."),
  bullet("Provide administrators with full control over the question bank and platform settings."),
  bullet("Deliver a seamless mobile experience through PWA capabilities (offline, installable, push-ready)."),
  rule(),
];

// ─── 3. Scope ─────────────────────────────────────────────────────────────────

const section3 = [
  h1("3. Project Scope"),
  h2("3.1 In Scope"),
  bullet("User registration and authentication via Clerk SSO (Google, email)"),
  bullet("Multi-step onboarding — gender selection, profile question answers"),
  bullet("Preference setup — per-question weights for compatibility scoring"),
  bullet("Weighted cosine-similarity matching engine (pre-computed scores stored in DB)"),
  bullet("Swipe-based match feed with compatibility percentages"),
  bullet("Detailed match profile view with per-dimension score breakdown"),
  bullet("Real-time in-app messaging between matched users"),
  bullet("AI persona responses for seed/test profiles via OpenRouter (Gemini 2.0 Flash)"),
  bullet("Membership tier management — Free, Curator, Heritage, Concierge"),
  bullet("Admin dashboard — question management, user management, settings"),
  bullet("Profile photo upload with crop and rotate support"),
  bullet("PWA — installable, offline-capable, service-worker caching"),
  h2("3.2 Out of Scope (v1.0)"),
  bullet("Native iOS / Android apps"),
  bullet("Video calling or audio messaging"),
  bullet("Payment gateway integration (memberships are manually assigned for now)"),
  bullet("Push notifications (infrastructure ready, not activated)"),
  bullet("Family / guardian account linking"),
  bullet("Background verification or identity proofing"),
  rule(),
];

// ─── 4. Stakeholders ──────────────────────────────────────────────────────────

const section4 = [
  h1("4. Stakeholders"),
  new Paragraph({ spacing: { after: 160 }, children: [] }),
  simpleTable(
    ["Stakeholder", "Role", "Responsibilities"],
    [
      ["Kunal Rai", "Product Owner / Admin", "Product vision, prioritisation, admin operations"],
      ["End Users (Seekers)", "Primary Users", "Create profiles, set preferences, discover & message matches"],
      ["Seed Profiles", "Simulated Users", "AI-powered personas to populate the match feed during early growth"],
      ["Convex Platform", "Infrastructure", "Real-time database, serverless backend functions"],
      ["Clerk", "Auth Provider", "User authentication, session management, JWT issuance"],
      ["OpenRouter / Google", "AI Provider", "Gemini 2.0 Flash model for AI persona responses"],
    ]
  ),
  new Paragraph({ spacing: { before: 160 }, children: [] }),
  rule(),
];

// ─── 5. User Personas ─────────────────────────────────────────────────────────

const section5 = [
  h1("5. User Personas"),

  h3("Persona 1 — The Modern Professional"),
  labelValue("Age", "26–34"),
  labelValue("Background", "Second-generation South Asian, UK / US / Canada / India"),
  labelValue("Goals", "Find a life partner who shares cultural values but has a modern outlook"),
  labelValue("Frustrations", "Traditional matrimonial sites feel outdated; dating apps lack serious intent"),
  labelValue("Behaviour", "Fills in detailed preferences, checks the feed daily, messages quickly when score is high"),

  new Paragraph({ spacing: { before: 160 }, children: [] }),
  h3("Persona 2 — The Family-Oriented Traditionalist"),
  labelValue("Age", "23–30"),
  labelValue("Background", "India-based or recent immigrant, family involved in partner search"),
  labelValue("Goals", "Find a compatible partner who respects family values and cultural identity"),
  labelValue("Frustrations", "Random matches with no cultural alignment; no way to express what really matters"),
  labelValue("Behaviour", "Weights religion and family questions heavily, reads profiles carefully"),

  new Paragraph({ spacing: { before: 160 }, children: [] }),
  h3("Persona 3 — The Admin / Curator"),
  labelValue("Role", "Platform administrator"),
  labelValue("Goals", "Maintain question quality, monitor platform health, manage seed profiles and API keys"),
  labelValue("Access", "Restricted to authorised email — full admin dashboard"),
  rule(),
];

// ─── 6. Functional Requirements ───────────────────────────────────────────────

const section6 = [
  h1("6. Functional Requirements"),
  pageBreak(),

  h2("6.1 Authentication & User Management"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["ID", "Requirement", "Priority"],
    [
      ["FR-01", "Users must be able to register and log in via Clerk SSO (Google or email/password).", "Must Have"],
      ["FR-02", "On first login, a user record must be created in the database with default onboarding flags.", "Must Have"],
      ["FR-03", "Unauthenticated users must be redirected to the landing page.", "Must Have"],
      ["FR-04", "User profile must store: display name, avatar URL, gender, membership tier, and activity timestamps.", "Must Have"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),

  h2("6.2 Onboarding"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["ID", "Requirement", "Priority"],
    [
      ["FR-05", "New users must complete a gender selection step before accessing the feed.", "Must Have"],
      ["FR-06", "Users must answer all profile questions (location, diet, kids, career, religion, etc.) during onboarding.", "Must Have"],
      ["FR-07", "Profile answers must be persisted per-user per-question in the profileAnswers table.", "Must Have"],
      ["FR-08", "Users must be able to re-visit and update their profile answers at any time.", "Should Have"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),

  h2("6.3 Preferences"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["ID", "Requirement", "Priority"],
    [
      ["FR-09", "After onboarding, users must complete a preferences step assigning weights (1–10) to each question.", "Must Have"],
      ["FR-10", "Preference weights must be stored per-user per-question in the preferenceAnswers table.", "Must Have"],
      ["FR-11", "Updating preferences must trigger recomputation of match scores for that user.", "Must Have"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),

  h2("6.4 Matching Engine"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["ID", "Requirement", "Priority"],
    [
      ["FR-12", "The system must compute a directional compatibility score from each user's perspective using weighted cosine similarity.", "Must Have"],
      ["FR-13", "Scoring strategies per question: exact_match (single/boolean), overlap (multi-select cosine).", "Must Have"],
      ["FR-14", "Mutual score must be computed as the harmonic mean of both directional scores.", "Must Have"],
      ["FR-15", "Scores must be pre-computed and stored in the matchScores table for fast feed queries.", "Must Have"],
      ["FR-16", "The feed must only surface opposite-gender candidates.", "Must Have"],
      ["FR-17", "Match scores must be recomputed when a user updates their profile or preferences.", "Must Have"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),

  h2("6.5 Match Feed"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["ID", "Requirement", "Priority"],
    [
      ["FR-18", "The feed must display match cards sorted by mutual compatibility score (descending).", "Must Have"],
      ["FR-19", "Each card must show: name, age (if available), compatibility percentage, and headline attributes.", "Must Have"],
      ["FR-20", "Users must be able to swipe left (pass) or swipe right (like) on cards.", "Must Have"],
      ["FR-21", "Tapping a card must open a detailed match profile view.", "Must Have"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),

  h2("6.6 Messaging"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["ID", "Requirement", "Priority"],
    [
      ["FR-22", "Users must be able to initiate a conversation from a match profile.", "Must Have"],
      ["FR-23", "Messages must be delivered in real time via Convex subscriptions.", "Must Have"],
      ["FR-24", "Conversation list must display last message preview and unread count per conversation.", "Must Have"],
      ["FR-25", "Unread counts must update automatically when new messages arrive.", "Must Have"],
      ["FR-26", "Messages from seed personas must be handled by the AI response system (Gemini 2.0 Flash).", "Must Have"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),

  h2("6.7 Admin Dashboard"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["ID", "Requirement", "Priority"],
    [
      ["FR-27", "Admin access must be restricted to a single authorised email address.", "Must Have"],
      ["FR-28", "Admin must be able to view platform stats: total users, active matches, success rate.", "Must Have"],
      ["FR-29", "Admin must be able to add new profile/preference questions with text, category, type, weight, and options.", "Must Have"],
      ["FR-30", "Admin must be able to edit the text and default weight of existing questions.", "Must Have"],
      ["FR-31", "Admin must be able to delete questions.", "Must Have"],
      ["FR-32", "Admin must be able to delete user accounts and all associated data.", "Must Have"],
      ["FR-33", "Admin must be able to update the OpenRouter API key from the dashboard.", "Must Have"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),

  h2("6.8 Profile & Avatar"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["ID", "Requirement", "Priority"],
    [
      ["FR-34", "Users must be able to upload a profile photo.", "Must Have"],
      ["FR-35", "The avatar upload flow must support in-browser crop and rotation before saving.", "Must Have"],
      ["FR-36", "Display name must be editable from the profile page.", "Should Have"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),

  h2("6.9 Membership"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["ID", "Requirement", "Priority"],
    [
      ["FR-37", "The system must support four membership tiers: Free, Curator, Heritage, Concierge.", "Should Have"],
      ["FR-38", "Membership tier and expiry must be stored on the user record.", "Should Have"],
      ["FR-39", "A membership page must display the available tiers and their benefits.", "Should Have"],
    ]
  ),
  rule(),
];

// ─── 7. Non-Functional Requirements ───────────────────────────────────────────

const section7 = [
  h1("7. Non-Functional Requirements"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["ID", "Category", "Requirement"],
    [
      ["NFR-01", "Performance", "Feed must load within 2 seconds on a standard 4G connection."],
      ["NFR-02", "Performance", "Match score computation for a new user must complete within 5 seconds."],
      ["NFR-03", "Real-Time", "Chat messages must appear within 500ms for both sender and receiver."],
      ["NFR-04", "Availability", "Platform must target 99.9% uptime, leveraging Convex's managed infrastructure."],
      ["NFR-05", "Security", "All API endpoints must validate authentication via Clerk JWT before executing."],
      ["NFR-06", "Security", "Admin mutations must verify the caller's email against the authorised admin address."],
      ["NFR-07", "Security", "The OpenRouter API key must be stored in the database, never exposed to the client."],
      ["NFR-08", "Scalability", "The matching engine must support up to 10,000 users without architectural changes."],
      ["NFR-09", "Accessibility", "The UI must be usable on mobile viewports (min 320px width)."],
      ["NFR-10", "PWA", "The app must be installable on iOS and Android and support offline browsing of cached content."],
      ["NFR-11", "Privacy", "No personally identifiable information must be shared with third-party AI providers beyond what is necessary for persona responses."],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),
  rule(),
];

// ─── 8. System Architecture Overview ─────────────────────────────────────────

const section8 = [
  h1("8. System Architecture Overview"),
  h2("8.1 Architecture Layers"),
  bullet("Frontend: React 18 + TypeScript SPA, bundled by Vite, served as a PWA."),
  bullet("Backend: Convex — serverless functions (queries, mutations, actions) with a real-time reactive database."),
  bullet("Auth: Clerk handles identity; Convex verifies Clerk-issued JWTs on every backend call."),
  bullet("AI Layer: Convex actions call the OpenRouter HTTP API to generate persona chat responses."),
  bullet("Storage: All data in Convex's managed database. Convex File Storage for user avatars."),

  h2("8.2 Key Data Tables"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["Table", "Purpose"],
    [
      ["users", "Core user record — auth identity, profile metadata, membership, flags"],
      ["questions", "Question bank — text, type, options, scoring strategy, default weight, order"],
      ["profileAnswers", "User's profile answers, keyed by userId + questionKey"],
      ["preferenceAnswers", "User's preference weights per question"],
      ["matchScores", "Pre-computed directional and mutual scores for every eligible pair"],
      ["conversations", "Canonical conversation record per user pair, with unread counts"],
      ["messages", "Individual chat messages linked to conversations"],
      ["settings", "Key-value store for admin-managed secrets (e.g. OPENROUTER_API_KEY)"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),

  h2("8.3 Matching Algorithm Summary"),
  body("For each candidate pair (A, B):"),
  bullet("Fetch both users' profileAnswers and A's preferenceAnswers."),
  bullet("For each shared question, compute per-question similarity: 1.0 for exact match, cosine overlap for multi-select."),
  bullet("Score A→B = weighted cosine of (weight × similarity) vectors."),
  bullet("Score B→A = same, using B's preference weights."),
  bullet("Mutual Score = harmonic mean of Score(A→B) and Score(B→A) × 100."),
  bullet("Store all three scores in matchScores table for fast retrieval."),
  rule(),
];

// ─── 9. Integrations ──────────────────────────────────────────────────────────

const section9 = [
  h1("9. External Integrations"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["Integration", "Provider", "Purpose", "Authentication"],
    [
      ["Authentication", "Clerk", "User sign-up, sign-in, JWT issuance, session management", "Publishable key (client), JWT verification (Convex)"],
      ["AI Chat Responses", "OpenRouter → Gemini 2.0 Flash", "Generate authentic responses from seed/AI personas", "API key stored in DB settings table"],
      ["Backend & Database", "Convex", "Serverless functions, real-time data subscriptions, file storage", "Clerk JWT verified per request"],
      ["Image Processing", "sharp (local)", "Server-side image optimisation during avatar upload", "N/A — runs in Convex action"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),
  rule(),
];

// ─── 10. Assumptions & Constraints ───────────────────────────────────────────

const section10 = [
  h1("10. Assumptions & Constraints"),
  h2("10.1 Assumptions"),
  bullet("Users are adults (18+) seeking long-term partnerships."),
  bullet("The platform is targeted at South Asian users globally (India, UK, US, Canada, UAE, Australia)."),
  bullet("Users will access the app primarily on mobile browsers; PWA install is optional."),
  bullet("Seed profiles are used only to bootstrap the network during early growth and are clearly not real users in the admin view."),
  bullet("The admin is a single trusted individual (the product owner) for v1.0."),
  h2("10.2 Constraints"),
  bullet("Budget: Initial build is bootstrapped — no paid infrastructure beyond Clerk and Convex free tiers where possible."),
  bullet("Convex free tier limits (document count, bandwidth) apply until the platform scales."),
  bullet("The OpenRouter API key is a single shared key; rate limits apply based on the selected plan."),
  bullet("Admin access is hardcoded to a single email — multi-admin support is deferred to v2."),
  rule(),
];

// ─── 11. Success Metrics & KPIs ───────────────────────────────────────────────

const section11 = [
  h1("11. Success Metrics & KPIs"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["Metric", "Target (3 months)", "How Measured"],
    [
      ["Registered Users", "500 real users", "Admin dashboard — realUsers count"],
      ["Onboarding Completion Rate", "> 70%", "onboarded / totalUsers × 100"],
      ["Preferences Completion Rate", "> 60%", "prefsDone / totalUsers × 100"],
      ["High-Compatibility Matches (≥70%)", "> 200 pairs", "matchScores where mutualScore ≥ 70"],
      ["Messages Sent per Active User", "> 5 per week", "messages table volume / activeUsers"],
      ["Average Match Score", "> 55%", "Avg(mutualScore) across all matchScores"],
      ["PWA Install Rate", "> 20% of mobile users", "Browser install prompt events"],
      ["AI Persona Response Rate", "100% within 10 seconds", "Convex action completion monitoring"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),
  rule(),
];

// ─── 12. Risks ────────────────────────────────────────────────────────────────

const section12 = [
  h1("12. Risks & Mitigations"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["Risk", "Likelihood", "Impact", "Mitigation"],
    [
      ["Low initial user count makes feed sparse", "High", "High", "Seed profiles with AI personas simulate an active network"],
      ["OpenRouter API rate limits / outages", "Medium", "Medium", "Graceful fallback — AI response silently skipped, no crash"],
      ["Match score quality disappoints users", "Medium", "High", "Allow full preference re-weighting; iterate question bank via admin UI"],
      ["Clerk pricing increases at scale", "Low", "Medium", "Auth layer abstracted — can swap provider with minimal backend change"],
      ["Convex free tier limits hit early", "Medium", "Medium", "Upgrade to paid Convex plan; archive old matchScores periodically"],
      ["Data privacy concerns (cultural sensitivity)", "Medium", "High", "No caste question; religion/identity questions are optional to weight"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),
  rule(),
];

// ─── 13. Roadmap ──────────────────────────────────────────────────────────────

const section13 = [
  h1("13. Roadmap"),
  new Paragraph({ spacing: { after: 120 }, children: [] }),
  simpleTable(
    ["Phase", "Timeline", "Deliverables"],
    [
      ["Phase 1 — Foundation", "Complete (Mar 2026)", "Auth, onboarding, preferences, matching engine, basic feed, messaging, PWA"],
      ["Phase 2 — Growth", "Apr – May 2026", "Push notifications, photo verification, expanded question bank, referral system"],
      ["Phase 3 — Monetisation", "Jun – Jul 2026", "Payment gateway, membership gate on advanced features, premium match insights"],
      ["Phase 4 — Scale", "Aug 2026+", "Native app wrappers, family account linking, background verification, multi-language support"],
    ]
  ),
  new Paragraph({ spacing: { before: 200 }, children: [] }),
  rule(),
];

// ─── 14. Approval ─────────────────────────────────────────────────────────────

const section14 = [
  h1("14. Document Approval"),
  body("This BRD is subject to review and sign-off by the product owner before development begins on each phase."),
  new Paragraph({ spacing: { before: 200 }, children: [] }),
  simpleTable(
    ["Role", "Name", "Signature", "Date"],
    [
      ["Product Owner", "Kunal Rai", "", "March 2026"],
      ["Technical Lead", "Kunal Rai", "", "March 2026"],
    ]
  ),
  new Paragraph({ spacing: { before: 400 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "— The Heritage Curator · Confidential —",
        italics: true,
        size: 18,
        color: GOLD,
        font: "Georgia",
      }),
    ],
  }),
];

// ─── Build Document ───────────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22, color: "333333" },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
        },
      },
      children: [
        ...coverPage,
        ...section1,
        ...section2,
        ...section3,
        pageBreak(),
        ...section4,
        ...section5,
        pageBreak(),
        ...section6,
        pageBreak(),
        ...section7,
        ...section8,
        pageBreak(),
        ...section9,
        ...section10,
        ...section11,
        pageBreak(),
        ...section12,
        ...section13,
        ...section14,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  writeFileSync("docs/Ristey_BRD_v1.0.docx", buffer);
  console.log("✓ docs/Ristey_BRD_v1.0.docx generated successfully");
});
