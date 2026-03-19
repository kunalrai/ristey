import { Link } from "react-router-dom";
import CompatibilityBar from "./CompatibilityBar";

interface MatchCardProps {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  mutualScore: number;
  profile: Record<string, string>;
  breakdown: string;
}

const PROFILE_ICONS: Record<string, string> = {
  location: "📍",
  diet: "🍽️",
  kids: "👶",
  religion: "🙏",
  career: "💼",
  politics: "🗳️",
  ethnicity: "🌏",
};

export default function MatchCard({
  userId,
  displayName,
  avatarUrl,
  mutualScore,
  profile,
  breakdown,
}: MatchCardProps) {
  // Find top 3 highest scoring traits
  let topTraits: string[] = [];
  try {
    const bd = JSON.parse(breakdown) as Record<string, { rawScore: number }>;
    topTraits = Object.entries(bd)
      .sort((a, b) => b[1].rawScore - a[1].rawScore)
      .slice(0, 3)
      .map(([key]) => key);
  } catch {
    topTraits = [];
  }

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      to={`/match/${userId}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "var(--color-bg-card)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-lg)",
          border: "1px solid var(--color-border)",
          marginBottom: "var(--space-md)",
          transition: "transform 0.15s, box-shadow 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "flex-start" }}>
          {/* Avatar */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: avatarUrl
                ? `url(${avatarUrl}) center/cover`
                : "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--font-md)",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {!avatarUrl && initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "var(--space-xs)",
              }}
            >
              <h3
                style={{
                  fontSize: "var(--font-md)",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </h3>
              <span
                style={{
                  fontSize: "var(--font-sm)",
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                  marginLeft: "var(--space-sm)",
                }}
              >
                {profile.location?.replace(/_/g, " ") ?? ""}
              </span>
            </div>

            <CompatibilityBar score={mutualScore} />
          </div>
        </div>

        {/* Top matching traits */}
        {topTraits.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "var(--space-xs)",
              marginTop: "var(--space-md)",
              flexWrap: "wrap",
            }}
          >
            {topTraits.map((key) => (
              <span
                key={key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  background: "rgba(224, 62, 107, 0.1)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--font-sm)",
                  color: "var(--color-primary-light)",
                  border: "1px solid rgba(224, 62, 107, 0.2)",
                }}
              >
                {PROFILE_ICONS[key] ?? "✓"} {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
