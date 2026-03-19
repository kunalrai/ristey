import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import CompatibilityBar from "../components/feed/CompatibilityBar";

const QUESTION_LABELS: Record<string, { label: string; icon: string }> = {
  location: { label: "Location", icon: "📍" },
  caste: { label: "Caste / Community", icon: "🏘️" },
  diet: { label: "Diet", icon: "🍽️" },
  kids: { label: "Kids", icon: "👶" },
  career: { label: "Career", icon: "💼" },
  music: { label: "Music", icon: "🎵" },
  movies: { label: "Movies", icon: "🎬" },
  politics: { label: "Politics", icon: "🗳️" },
  religion: { label: "Religion", icon: "🙏" },
  ethnicity: { label: "Ethnicity", icon: "🌏" },
};

interface BreakdownEntry {
  rawScore: number;
  weight: number;
  weightedContribution: number;
}

export default function MatchDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const getOrCreateConversation = useMutation(api.chat.getOrCreateConversation);

  const handleMessage = async () => {
    const convoId = await getOrCreateConversation({ otherUserId: userId as Id<"users"> });
    navigate(`/chat/${convoId}`);
  };

  const detail = useQuery(api.matches.getMatchDetail, {
    targetUserId: userId as Id<"users">,
  });

  if (detail === undefined) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!detail) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
        }}
      >
        Match not found.
      </div>
    );
  }

  const { user, score, profile } = detail;
  const breakdown: Record<string, BreakdownEntry> = score?.breakdown
    ? JSON.parse(score.breakdown)
    : {};

  const initials = user.displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        padding: "var(--space-md)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-lg)" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ color: "var(--color-text-muted)", fontSize: "var(--font-sm)", padding: "var(--space-sm) 0" }}
        >
          ← Back
        </button>
        <button
          onClick={handleMessage}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 20px",
            background: "#800020", color: "#fff",
            borderRadius: 10, fontSize: 13, fontWeight: 700,
            fontFamily: "'Noto Serif', Georgia, serif",
            letterSpacing: "0.04em",
          }}
        >
          💬 Message
        </button>
      </div>

      <div
        className="animate-fade-in"
        style={{
          background: "var(--color-bg-card)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-xl)",
          border: "1px solid var(--color-border)",
          marginBottom: "var(--space-md)",
          textAlign: "center",
        }}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto var(--space-md)",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--font-xl)",
              fontWeight: 700,
              color: "#fff",
              margin: "0 auto var(--space-md)",
            }}
          >
            {initials}
          </div>
        )}
        <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800 }}>
          {user.displayName}
        </h1>
        {profile.location && (
          <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-xs)" }}>
            📍 {profile.location.replace(/_/g, " ")}
          </p>
        )}
        {score && (
          <div style={{ marginTop: "var(--space-lg)" }}>
            <CompatibilityBar score={score.mutualScore} size="lg" />
          </div>
        )}
      </div>

      {score && Object.keys(breakdown).length > 0 && (
        <div
          style={{
            background: "var(--color-bg-card)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-lg)",
            border: "1px solid var(--color-border)",
            marginBottom: "var(--space-md)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--font-md)",
              fontWeight: 700,
              marginBottom: "var(--space-lg)",
            }}
          >
            Compatibility Breakdown
          </h2>
          {Object.entries(breakdown)
            .sort((a, b) => b[1].weightedContribution - a[1].weightedContribution)
            .map(([key, entry]) => {
              const meta = QUESTION_LABELS[key] ?? { label: key, icon: "•" };
              return (
                <div key={key} style={{ marginBottom: "var(--space-md)" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "var(--space-xs)",
                    }}
                  >
                    <span style={{ fontSize: "var(--font-sm)" }}>
                      {meta.icon} {meta.label}
                    </span>
                    <span
                      style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}
                    >
                      Weight: {entry.weight}/10
                    </span>
                  </div>
                  <CompatibilityBar score={entry.rawScore * 100} />
                  {profile[key] && (
                    <p
                      style={{
                        fontSize: "var(--font-sm)",
                        color: "var(--color-text-muted)",
                        marginTop: "var(--space-xs)",
                      }}
                    >
                      Their answer:{" "}
                      <span style={{ color: "var(--color-text)" }}>
                        {(() => {
                          try {
                            const p = JSON.parse(profile[key]) as string[];
                            if (Array.isArray(p))
                              return p.map((v) => v.replace(/_/g, " ")).join(", ");
                          } catch {
                            // not array
                          }
                          return profile[key].replace(/_/g, " ");
                        })()}
                      </span>
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {score && (
        <div
          style={{
            background: "var(--color-bg-card)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-lg)",
            border: "1px solid var(--color-border)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-md)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "var(--font-2xl)",
                fontWeight: 800,
                color: "var(--color-primary)",
              }}
            >
              {Math.round(score.scoreAtoB)}%
            </div>
            <div style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
              You → Them
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "var(--font-2xl)",
                fontWeight: 800,
                color: "var(--color-primary-light)",
              }}
            >
              {Math.round(score.scoreBtoA)}%
            </div>
            <div style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
              Them → You
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
