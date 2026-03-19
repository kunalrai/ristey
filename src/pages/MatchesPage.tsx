import { usePaginatedQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import CompatibilityBar from "../components/feed/CompatibilityBar";

const CRIMSON = "#800020";
const GOLD    = "#C5A059";
const STONE   = "#F5F0E6";
const CARD_BG = "#EDE8DC";
const TEXT    = "#1a140e";
const MUTED   = "#7a6e60";
const SERIF   = "'Noto Serif', Georgia, serif";
const SANS    = "'Inter', system-ui, sans-serif";

export default function MatchesPage() {
  const navigate = useNavigate();
  const { results, status, loadMore } = usePaginatedQuery(
    api.matches.getMatchFeed,
    {},
    { initialNumItems: 20 }
  );

  return (
    <div style={{ minHeight: "100vh", background: STONE, fontFamily: SERIF, paddingBottom: 90 }}>

      {/* Header */}
      <div style={{ padding: "24px 20px 16px" }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
          Your Heritage Matches
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: TEXT, lineHeight: 1.1 }}>Matches</h1>
      </div>

      {/* Grid */}
      <div style={{ padding: "0 16px" }}>
        {status === "LoadingFirstPage" && (
          <div style={{ textAlign: "center", paddingTop: 60, color: MUTED, fontStyle: "italic" }}>
            Loading…
          </div>
        )}

        {status !== "LoadingFirstPage" && results.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❤️</div>
            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
              No matches yet
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>
              Complete your profile to start receiving curated matches.
            </p>
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}>
          {results.map((match) => {
            if (!match) return null;
            const initials = match.displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
            return (
              <div
                key={match.userId}
                onClick={() => navigate(`/match/${match.userId}`)}
                style={{
                  background: CARD_BG,
                  borderRadius: 16,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                {/* Avatar */}
                <div style={{
                  width: "100%", aspectRatio: "1",
                  background: match.avatarUrl
                    ? `url(${match.avatarUrl}) center/cover`
                    : `linear-gradient(135deg, ${CRIMSON}, #3a0010)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 700, color: "#fff",
                }}>
                  {!match.avatarUrl && initials}
                </div>

                {/* Info */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {match.displayName}
                  </div>
                  <CompatibilityBar score={match.mutualScore} />
                  <div style={{ fontFamily: SANS, fontSize: 10, color: MUTED, marginTop: 4 }}>
                    {Math.round(match.mutualScore)}% compatible
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {status === "CanLoadMore" && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              onClick={() => loadMore(20)}
              style={{
                padding: "10px 28px",
                background: "transparent",
                border: `1.5px solid ${CRIMSON}`,
                borderRadius: 24,
                color: CRIMSON,
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
