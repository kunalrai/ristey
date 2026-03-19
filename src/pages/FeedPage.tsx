import { useRef, useState, useEffect, useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";

const CRIMSON   = "#800020";
const GOLD      = "#C5A059";
const STONE     = "#F5F0E6";
const STONE_100 = "#EDE8DC";
const TEXT      = "#1a140e";
const MUTED     = "#7a6e60";
const SERIF     = "'Noto Serif', Georgia, serif";
const SANS      = "'Inter', system-ui, sans-serif";

const LOCATION_LABELS: Record<string, string> = {
  north_india:  "North India",
  south_india:  "South India",
  east_india:   "East India",
  west_india:   "West India",
  northeast:    "Northeast India",
  abroad:       "International",
};

function fmtLocation(raw?: string) {
  if (!raw) return "";
  return LOCATION_LABELS[raw] ?? raw.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function buildQuote(profile: Record<string, string>): string {
  const parts: string[] = [];
  if (profile.career)   parts.push(`career in ${profile.career.replace(/_/g, " ")}`);
  if (profile.religion) parts.push(`${profile.religion.replace(/_/g, " ")} values`);
  if (profile.caste)    parts.push(`${profile.caste.replace(/_/g, " ")} heritage`);
  if (parts.length === 0) return "A thoughtful and intentional match.";
  return parts.join(", ").replace(/^\w/, c => c.toUpperCase()) + ".";
}

// ── Swipe card ─────────────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 80;

interface Match {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  mutualScore: number;
  profile: Record<string, string>;
  breakdown: string;
}

function SwipeCard({
  match,
  onSwipedLeft,
  onSwipedRight,
  isTop,
  stackOffset,
}: {
  match: Match;
  onSwipedLeft: () => void;
  onSwipedRight: () => void;
  isTop: boolean;
  stackOffset: number;
}) {
  const navigate  = useNavigate();
  const dragX     = useRef(0);
  const dragY     = useRef(0);
  const startX    = useRef(0);
  const startY    = useRef(0);
  const dragging  = useRef(false);
  const cardRef   = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<"like" | "pass" | null>(null);

  const applyTransform = (x: number) => {
    if (!cardRef.current) return;
    const rotate = x * 0.06;
    cardRef.current.style.transform = `translateX(${x}px) rotate(${rotate}deg)`;
    cardRef.current.style.transition = "none";
  };

  const resetTransform = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "translateX(0) rotate(0deg)";
    cardRef.current.style.transition = "transform 0.35s ease";
  };

  const flyOut = (direction: "left" | "right", cb: () => void) => {
    if (!cardRef.current) return;
    const x = direction === "right" ? 600 : -600;
    cardRef.current.style.transform = `translateX(${x}px) rotate(${x * 0.06}deg)`;
    cardRef.current.style.transition = "transform 0.3s ease";
    setTimeout(cb, 300);
  };

  // Touch
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    dragging.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isTop || !dragging.current) return;
    dragX.current = e.touches[0].clientX - startX.current;
    dragY.current = e.touches[0].clientY - startY.current;
    applyTransform(dragX.current);
    setIndicator(dragX.current > 20 ? "like" : dragX.current < -20 ? "pass" : null);
  };

  const onTouchEnd = () => {
    if (!isTop || !dragging.current) return;
    dragging.current = false;
    const x = dragX.current;
    dragX.current = 0;
    setIndicator(null);
    if (x > SWIPE_THRESHOLD)       flyOut("right", onSwipedRight);
    else if (x < -SWIPE_THRESHOLD) flyOut("left",  onSwipedLeft);
    else resetTransform();
  };

  // Mouse
  const onMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = true;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !isTop) return;
      dragX.current = e.clientX - startX.current;
      applyTransform(dragX.current);
      setIndicator(dragX.current > 20 ? "like" : dragX.current < -20 ? "pass" : null);
    };
    const onMouseUp = () => {
      if (!dragging.current || !isTop) return;
      dragging.current = false;
      const x = dragX.current;
      dragX.current = 0;
      setIndicator(null);
      if (x > SWIPE_THRESHOLD)       flyOut("right", onSwipedRight);
      else if (x < -SWIPE_THRESHOLD) flyOut("left",  onSwipedLeft);
      else resetTransform();
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, [isTop, onSwipedLeft, onSwipedRight]);

  const initials = match.displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const firstName = match.displayName.split(" ")[0];
  const location  = fmtLocation(match.profile.location);
  const quote     = buildQuote(match.profile);
  const pct       = Math.round(match.mutualScore);

  return (
    <div
      ref={cardRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        width: "100%",
        userSelect: "none",
        cursor: isTop ? "grab" : "default",
        transform: `scale(${1 - stackOffset * 0.04}) translateY(${stackOffset * 12}px)`,
        transition: "transform 0.3s ease",
        zIndex: 10 - stackOffset,
      }}
    >
      <div
        style={{
          background: STONE,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: isTop
            ? "0 8px 40px rgba(0,0,0,0.18)"
            : "0 4px 16px rgba(0,0,0,0.10)",
        }}
      >
        {/* ── Photo ── */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", maxHeight: 420 }}>
          {match.avatarUrl ? (
            <img
              src={match.avatarUrl}
              alt={match.displayName}
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: `linear-gradient(135deg, ${CRIMSON}, #3a0010)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 64, fontWeight: 800, color: "rgba(255,255,255,0.25)",
              fontFamily: SERIF,
            }}>
              {initials}
            </div>
          )}

          {/* Match % badge */}
          <div style={{
            position: "absolute", top: 16, left: 16,
            background: CRIMSON, color: "#fff",
            fontFamily: SANS, fontSize: 11, fontWeight: 800,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "6px 12px", borderRadius: 6,
          }}>
            {pct}% Match
          </div>

          {/* Like indicator */}
          {indicator === "like" && (
            <div style={{
              position: "absolute", top: 24, right: 20,
              border: "3px solid #4caf73", borderRadius: 8,
              padding: "4px 14px", color: "#4caf73",
              fontFamily: SANS, fontSize: 18, fontWeight: 800,
              transform: "rotate(-10deg)",
            }}>
              ♥ CURATE
            </div>
          )}

          {/* Pass indicator */}
          {indicator === "pass" && (
            <div style={{
              position: "absolute", top: 24, left: 20,
              border: "3px solid #aaa", borderRadius: 8,
              padding: "4px 14px", color: "#aaa",
              fontFamily: SANS, fontSize: 18, fontWeight: 800,
              transform: "rotate(10deg)",
            }}>
              ✕ PASS
            </div>
          )}
        </div>

        {/* ── Info panel ── */}
        <div
          style={{ padding: "18px 20px 22px", background: STONE_100 }}
          onClick={() => isTop && navigate(`/match/${match.userId}`)}
        >
          <p style={{
            fontFamily: SERIF, fontStyle: "italic", fontSize: 13,
            color: MUTED, lineHeight: 1.6, marginBottom: 10,
          }}>
            "{quote}"
          </p>
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 800, color: TEXT, lineHeight: 1.1, marginBottom: 6 }}>
            {firstName}
          </div>
          {location && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: SANS, fontSize: 13, color: MUTED }}>
              <span style={{ fontSize: 14 }}>📍</span> {location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Feed Page ───────────────────────────────────────────────────────────────
export default function FeedPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.matches.getMatchFeed,
    {},
    { initialNumItems: 20 }
  );

  const matches = results.filter(Boolean) as Match[];
  const [index, setIndex] = useState(0);

  // Load more when nearing the end
  useEffect(() => {
    if (status === "CanLoadMore" && index >= matches.length - 4) {
      loadMore(10);
    }
  }, [index, matches.length, status]);

  const handleSwipedLeft  = useCallback(() => setIndex(i => i + 1), []);
  const handleSwipedRight = useCallback(() => setIndex(i => i + 1), []);

  const remaining = matches.slice(index, index + 3);
  const done = index >= matches.length && status !== "LoadingFirstPage" && status !== "LoadingMore";

  return (
    <div style={{ minHeight: "100vh", background: STONE, fontFamily: SERIF, paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
            Curation for You
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 800, color: TEXT, lineHeight: 1.1 }}>
            Today's<br />Matches
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
          {matches.length > 0 && index < matches.length && (
            <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>
              {index + 1} / {matches.length}
            </div>
          )}
        </div>
      </div>

      {/* ── Card stack ── */}
      <div style={{ padding: "20px 20px 0", position: "relative" }}>

        {/* Loading */}
        {status === "LoadingFirstPage" && (
          <div style={{ height: 480, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontStyle: "italic" }}>
            Curating your matches…
          </div>
        )}

        {/* Empty */}
        {done && remaining.length === 0 && (
          <div style={{ height: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: MUTED }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>♛</div>
            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
              All caught up
            </div>
            <p style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>
              You've reviewed all your curated matches.<br />Check back soon.
            </p>
          </div>
        )}

        {/* Card stack — render up to 3 cards */}
        {remaining.length > 0 && (
          <div style={{ position: "relative", height: 560 }}>
            {[...remaining].reverse().map((match, revIdx) => {
              const stackOffset = remaining.length - 1 - revIdx;
              const isTop = stackOffset === 0;
              return (
                <SwipeCard
                  key={match.userId}
                  match={match}
                  isTop={isTop}
                  stackOffset={stackOffset}
                  onSwipedLeft={handleSwipedLeft}
                  onSwipedRight={handleSwipedRight}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── Action buttons ── */}
      {remaining.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "24px 20px 0" }}>
          <button
            onClick={() => {
              const top = remaining[0];
              if (!top) return;
              handleSwipedLeft();
            }}
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "#fff", border: "1.5px solid #ddd",
              fontSize: 22, cursor: "pointer",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
          <button
            onClick={() => {
              const top = remaining[0];
              if (!top) return;
              handleSwipedRight();
            }}
            style={{
              width: 64, height: 64, borderRadius: "50%",
              background: CRIMSON, border: "none",
              fontSize: 26, cursor: "pointer",
              boxShadow: `0 4px 16px rgba(128,0,32,0.35)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}
          >
            ♥
          </button>
          <button
            onClick={() => {
              const top = remaining[0];
              if (!top) return;
              // navigate to detail on star
            }}
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "#fff", border: "1.5px solid #ddd",
              fontSize: 20, cursor: "pointer",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: GOLD,
            }}
          >
            ★
          </button>
        </div>
      )}
    </div>
  );
}
