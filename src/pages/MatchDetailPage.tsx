import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const BG       = "#F5F0E6";
const CARD_BG  = "#EDE8DC";
const CRIMSON  = "#800020";
const GOLD     = "#C5A059";
const NAVY     = "#1C2B3A";

const CORE_VALUE_KEYS: { key: string; label: string }[] = [
  { key: "religion",  label: "Belief"    },
  { key: "ethnicity", label: "Ancestry"  },
  { key: "location",  label: "Location"  },
  { key: "diet",      label: "Diet"      },
  { key: "kids",      label: "Family"    },
  { key: "career",    label: "Career"    },
  { key: "politics",  label: "Values"    },
];

const BREAKDOWN_LABELS: Record<string, { label: string; icon: string }> = {
  location:  { label: "Location",  icon: "📍" },
  diet:      { label: "Diet",      icon: "🍽️" },
  kids:      { label: "Family",    icon: "👶" },
  career:    { label: "Career",    icon: "💼" },
  music:     { label: "Music",     icon: "🎵" },
  movies:    { label: "Movies",    icon: "🎬" },
  politics:  { label: "Politics",  icon: "🗳️" },
  religion:  { label: "Religion",  icon: "🙏" },
  ethnicity: { label: "Ethnicity", icon: "🌏" },
};

interface BreakdownEntry {
  rawScore: number;
  weight: number;
  weightedContribution: number;
}

function fmt(raw: string | undefined): string {
  if (!raw) return "";
  try {
    const arr = JSON.parse(raw) as string[];
    if (Array.isArray(arr)) return arr.map((v) => v.replace(/_/g, " ")).join(", ");
  } catch { /* not JSON */ }
  return raw.replace(/_/g, " ");
}

function deriveStatus(onboarded: boolean, prefsDone: boolean): string {
  if (onboarded && prefsDone) return "Platinum";
  if (onboarded) return "Active";
  return "New";
}

export default function MatchDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const getOrCreateConversation = useMutation(api.chat.getOrCreateConversation);

  const detail = useQuery(api.matches.getMatchDetail, {
    targetUserId: userId as Id<"users">,
  });

  const handleMessage = async () => {
    const convoId = await getOrCreateConversation({ otherUserId: userId as Id<"users"> });
    navigate(`/chat/${convoId}`);
  };

  if (detail === undefined) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, color: "#7a6e60", fontFamily: "Georgia, serif" }}>
        Loading…
      </div>
    );
  }

  if (!detail) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, color: "#7a6e60", fontFamily: "Georgia, serif" }}>
        Match not found.
      </div>
    );
  }

  const { user, score, profile } = detail;

  const initials = user.displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const status   = deriveStatus(user.onboardingComplete, user.preferencesComplete);
  const career   = fmt(profile.career) || "Heritage Curator";

  const coreValues = CORE_VALUE_KEYS
    .map(({ key, label }) => ({ key, label, value: fmt(profile[key]) }))
    .filter((v) => v.value);

  const aboutParts: string[] = [];
  if (profile.religion)  aboutParts.push(`A ${fmt(profile.religion)} by faith`);
  if (profile.location)  aboutParts.push(`based in ${fmt(profile.location)}`);
  if (profile.career)    aboutParts.push(`working in ${fmt(profile.career)}`);
  if (profile.diet)      aboutParts.push(`following a ${fmt(profile.diet)} lifestyle`);
  const aboutText = aboutParts.length > 0
    ? aboutParts.join(", ") + ". Values deep connections built on shared culture and tradition."
    : "This member hasn't completed their profile yet.";

  const breakdown: Record<string, BreakdownEntry> = score?.breakdown
    ? JSON.parse(score.breakdown)
    : {};

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "Georgia, serif", paddingBottom: 96 }}>

      {/* ── Top Nav ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: BG }}>
        <button onClick={() => navigate(-1)} style={{ color: CRIMSON, fontSize: 20, lineHeight: 1 }}>←</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: CRIMSON, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.3 }}>
            THE HERITAGE<br />CURATOR
          </div>
        </div>
        <button
          onClick={handleMessage}
          style={{
            width: 36, height: 36, background: CRIMSON, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 16,
          }}
        >
          💬
        </button>
      </div>

      {/* ── Hero Photo ── */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", maxHeight: 420, overflow: "hidden", flexShrink: 0 }}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(160deg, ${CRIMSON} 0%, #3a0010 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 72, fontWeight: 800, color: "rgba(255,255,255,0.3)",
          }}>
            {initials}
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,4,2,0.82) 0%, transparent 55%)" }} />

        {/* Score badge */}
        {score && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
            borderRadius: 20, padding: "4px 12px",
            fontSize: 13, fontWeight: 800, color: "#fff",
          }}>
            {Math.round(score.mutualScore)}% match
          </div>
        )}

        {/* Name overlay */}
        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
            {user.displayName}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4, fontStyle: "italic" }}>
            {career}
          </div>
        </div>
      </div>

      {/* ── Status Strip ── */}
      <div style={{ background: BG, display: "flex", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        {[
          { label: "Status", value: status,                                                    color: CRIMSON },
          { label: "Intent", value: user.preferencesComplete ? "Serious" : "Casual",           color: GOLD   },
          { label: "Match",  value: score ? `${Math.round(score.mutualScore)}%` : "—",         color: NAVY   },
        ].map(({ label, value, color }, i) => (
          <div
            key={label}
            style={{
              flex: 1, textAlign: "center", padding: "14px 8px",
              borderRight: i < 2 ? "1px solid rgba(0,0,0,0.07)" : "none",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e80", marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px", maxWidth: 520, margin: "0 auto" }}>

        {/* ── About ── */}
        <div style={{ marginTop: 28, marginBottom: 28 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, fontWeight: 800, color: CRIMSON, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>✦</span> About
          </h2>
          <p style={{ fontSize: 15, color: "#4a3e32", lineHeight: 1.7 }}>{aboutText}</p>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.07)", marginBottom: 28 }} />

        {/* ── Core Values ── */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, fontWeight: 800, color: CRIMSON, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>♛</span> Core Values
          </h2>

          {coreValues.length === 0 ? (
            <p style={{ fontSize: 14, color: "#9a8e80", fontStyle: "italic" }}>
              This member hasn't shared their values yet.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {coreValues.map(({ key, label, value }) => (
                <div key={key} style={{ background: CARD_BG, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e80", marginBottom: 6 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a140e", lineHeight: 1.3 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Compatibility Breakdown ── */}
        {score && Object.keys(breakdown).length > 0 && (
          <>
            <div style={{ height: 1, background: "rgba(0,0,0,0.07)", marginBottom: 28 }} />
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, fontWeight: 800, color: CRIMSON, marginBottom: 16 }}>
                <span style={{ fontSize: 16 }}>◈</span> Compatibility
              </h2>

              {/* Directional scores */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                <div style={{ background: CARD_BG, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e80", marginBottom: 6 }}>
                    You → Them
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: CRIMSON }}>{Math.round(score.scoreAtoB)}%</div>
                </div>
                <div style={{ background: CARD_BG, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e80", marginBottom: 6 }}>
                    Them → You
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: GOLD }}>{Math.round(score.scoreBtoA)}%</div>
                </div>
              </div>

              {/* Per-dimension breakdown */}
              {Object.entries(breakdown)
                .sort((a, b) => b[1].weightedContribution - a[1].weightedContribution)
                .map(([key, entry]) => {
                  const meta = BREAKDOWN_LABELS[key] ?? { label: key, icon: "•" };
                  const pct  = Math.round(entry.rawScore * 100);
                  return (
                    <div key={key} style={{ background: CARD_BG, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a140e" }}>
                          {meta.icon} {meta.label}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {profile[key] && (
                            <span style={{ fontSize: 11, color: "#9a8e80" }}>
                              {fmt(profile[key])}
                            </span>
                          )}
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: pct >= 80 ? "#2e7d5a" : pct >= 50 ? GOLD : CRIMSON,
                            background: pct >= 80 ? "rgba(76,175,115,0.12)" : pct >= 50 ? "rgba(197,160,89,0.12)" : "rgba(128,0,32,0.08)",
                            padding: "2px 8px", borderRadius: 999,
                          }}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: 3, background: "rgba(0,0,0,0.08)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`, borderRadius: 999,
                          background: pct >= 80 ? "#4caf73" : pct >= 50 ? GOLD : CRIMSON,
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#9a8e80", marginTop: 4 }}>
                        Weight {entry.weight}/10
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {/* ── Message Button ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          <button
            onClick={handleMessage}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 20px", background: CRIMSON, color: "#fff",
              borderRadius: 12, fontSize: 12, fontWeight: 800,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}
          >
            Send a Message <span style={{ fontSize: 16, fontWeight: 400 }}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
