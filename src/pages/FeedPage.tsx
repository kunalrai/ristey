import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import MatchCard from "../components/feed/MatchCard";

export default function FeedPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.matches.getMatchFeed,
    {},
    { initialNumItems: 15 }
  );

  return (
    <div
      style={{
        padding: "var(--space-lg) var(--space-md)",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800 }}>Your Matches</h1>
        <p style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
          Ranked by mutual compatibility
        </p>
      </div>

      {status === "LoadingFirstPage" && (
        <div style={{ paddingTop: "var(--space-2xl)", textAlign: "center" }}>
          <div
            className="animate-pulse"
            style={{ color: "var(--color-text-muted)", fontSize: "var(--font-md)" }}
          >
            Finding your matches…
          </div>
        </div>
      )}

      {status !== "LoadingFirstPage" && results.length === 0 && (
        <div
          style={{
            textAlign: "center",
            paddingTop: "var(--space-2xl)",
            color: "var(--color-text-muted)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: "var(--space-md)" }}>🔍</div>
          <p style={{ fontSize: "var(--font-md)", fontWeight: 600 }}>No matches yet</p>
          <p style={{ fontSize: "var(--font-sm)", marginTop: "var(--space-sm)" }}>
            More people joining soon. Check back later!
          </p>
        </div>
      )}

      <div className="animate-fade-in">
        {results.map((match) => {
          if (!match) return null;
          return (
            <MatchCard
              key={match.userId}
              userId={match.userId}
              displayName={match.displayName}
              avatarUrl={match.avatarUrl}
              mutualScore={match.mutualScore}
              profile={match.profile}
              breakdown={match.breakdown}
            />
          );
        })}
      </div>

      {status === "CanLoadMore" && (
        <button
          onClick={() => loadMore(15)}
          style={{
            width: "100%",
            padding: "var(--space-md)",
            marginTop: "var(--space-md)",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-muted)",
            fontSize: "var(--font-base)",
            cursor: "pointer",
          }}
        >
          Load more
        </button>
      )}
    </div>
  );
}
