import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const CARD_STYLE: React.CSSProperties = {
  background: "var(--color-bg-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-xl)",
  padding: "var(--space-lg)",
};

function StatCard({
  icon,
  label,
  value,
  sub,
  subColor,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div style={CARD_STYLE}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "var(--space-sm)",
        }}
      >
        <span style={{ fontSize: 22 }}>{icon}</span>
        {sub && (
          <span
            style={{
              fontSize: "var(--font-sm)",
              fontWeight: 700,
              color: subColor ?? "var(--color-success)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: "var(--font-sm)",
          color: "var(--color-text-muted)",
          marginBottom: "var(--space-xs)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "var(--font-2xl)",
          fontWeight: 800,
          color: "var(--color-text)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const stats = useQuery(api.admin.getStats);
  const users = useQuery(api.admin.getAllUsers);
  const deleteUser = useMutation(api.admin.deleteUser);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const handleDelete = async (userId: string) => {
    setDeleting(true);
    try {
      await deleteUser({ userId: userId as Id<"users"> });
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = (users ?? []).filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        padding: "var(--space-lg) var(--space-md)",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(224,62,107,0.15)",
            border: "1px solid rgba(224,62,107,0.3)",
            borderRadius: "var(--radius-full)",
            padding: "4px 14px",
            fontSize: "var(--font-sm)",
            color: "var(--color-primary)",
            fontWeight: 700,
            marginBottom: "var(--space-md)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Admin
        </div>
        <h1 style={{ fontSize: "var(--font-2xl)", fontWeight: 800, lineHeight: 1.1 }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-xs)" }}>
          Pulse of the Ristey network
        </p>
      </div>

      {/* Stats grid */}
      {!stats ? (
        <div
          className="animate-pulse"
          style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-xl)" }}
        >
          Loading stats…
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-md)",
            marginBottom: "var(--space-xl)",
          }}
        >
          <StatCard
            icon="👥"
            label="Total Users"
            value={stats.totalUsers}
            sub={`${stats.realUsers} real`}
            subColor="var(--color-success)"
          />
          <StatCard
            icon="✅"
            label="Fully Onboarded"
            value={stats.prefsDone}
            sub={`${stats.onboarded} started`}
            subColor="var(--color-warning)"
          />
          <StatCard
            icon="💞"
            label="Match Pairs"
            value={stats.totalMatches}
            sub={`avg ${stats.avgScore}%`}
            subColor="var(--color-primary-light)"
          />
          <StatCard
            icon="🔥"
            label="High Matches"
            value={stats.highMatches}
            sub="≥ 70% score"
            subColor="var(--color-success)"
          />
          <StatCard
            icon="🌱"
            label="Seed Profiles"
            value={stats.seedUsers}
            sub="test data"
            subColor="var(--color-text-muted)"
          />
        </div>
      )}

      {/* Users table */}
      <div style={CARD_STYLE}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-md)",
          }}
        >
          <h2 style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>All Users</h2>
          <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
            {users?.length ?? "—"} total
          </span>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{
            width: "100%",
            padding: "10px var(--space-md)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text)",
            marginBottom: "var(--space-md)",
            outline: "none",
          }}
        />

        {!users ? (
          <div className="animate-pulse" style={{ color: "var(--color-text-muted)" }}>
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "var(--space-lg)" }}>
            No users found
          </div>
        ) : (
          filtered.map((u) => (
            <div
              key={u._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-md)",
                padding: "var(--space-md) 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: u.avatarUrl
                    ? `url(${u.avatarUrl}) center/cover`
                    : "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-light))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--font-sm)",
                  fontWeight: 700,
                  color: "#fff",
                  border: u.isSeed ? "2px dashed var(--color-text-subtle)" : "none",
                }}
              >
                {!u.avatarUrl &&
                  u.displayName
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-xs)",
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-base)",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.displayName}
                  </span>
                  {u.isSeed && (
                    <span
                      style={{
                        fontSize: 10,
                        background: "var(--color-bg-elevated)",
                        color: "var(--color-text-muted)",
                        padding: "1px 6px",
                        borderRadius: "var(--radius-full)",
                        flexShrink: 0,
                      }}
                    >
                      seed
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: "var(--radius-full)",
                      background: u.onboardingComplete
                        ? "rgba(76,175,115,0.15)"
                        : "var(--color-bg-elevated)",
                      color: u.onboardingComplete
                        ? "var(--color-success)"
                        : "var(--color-text-subtle)",
                    }}
                  >
                    {u.onboardingComplete ? "✓ profile" : "no profile"}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: "var(--radius-full)",
                      background: u.preferencesComplete
                        ? "rgba(224,62,107,0.15)"
                        : "var(--color-bg-elevated)",
                      color: u.preferencesComplete
                        ? "var(--color-primary-light)"
                        : "var(--color-text-subtle)",
                    }}
                  >
                    {u.preferencesComplete ? "✓ prefs" : "no prefs"}
                  </span>
                </div>
              </div>

              {/* Delete */}
              {confirmDelete === u._id ? (
                <div style={{ display: "flex", gap: "var(--space-xs)", flexShrink: 0 }}>
                  <button
                    onClick={() => handleDelete(u._id)}
                    disabled={deleting}
                    style={{
                      fontSize: "var(--font-sm)",
                      color: "#fff",
                      background: "#e03e3e",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: 700,
                    }}
                  >
                    {deleting ? "…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    style={{
                      fontSize: "var(--font-sm)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(u._id)}
                  style={{
                    fontSize: 18,
                    color: "var(--color-text-subtle)",
                    flexShrink: 0,
                    padding: "4px 8px",
                  }}
                >
                  🗑
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
