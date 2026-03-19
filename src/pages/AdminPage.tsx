import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const BG = "#F5F0E6";
const CARD_BG = "#EDE8DC";
const CRIMSON = "#800020";
const GOLD = "#C5A059";
const NAVY = "#1C2B3A";

function StatCard({
  icon,
  label,
  value,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div
      style={{
        background: CARD_BG,
        borderRadius: 16,
        padding: "20px 20px 22px",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ color: CRIMSON, fontSize: 20 }}>{icon}</span>
        {badge && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: badgeColor ?? GOLD,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#7a6e60",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 4,
          fontFamily: "inherit",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: CRIMSON,
          lineHeight: 1,
          fontFamily: "Georgia, serif",
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
  const questions = useQuery(api.questions.getAllQuestions);
  const deleteUser = useMutation(api.admin.deleteUser);
  const updateQuestion = useMutation(api.questions.updateQuestion);

  const [view, setView] = useState<"dashboard" | "users" | "questions">("dashboard");
  const [navOpen, setNavOpen] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const mountTime = useRef(Date.now());
  useEffect(() => {
    if (stats !== undefined && latencyMs === null) {
      setLatencyMs(Date.now() - mountTime.current);
    }
  }, [stats, latencyMs]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [editingQ, setEditingQ] = useState<string | null>(null); // question _id being edited
  const [qDraft, setQDraft] = useState<{ text: string; defaultWeight: number }>({ text: "", defaultWeight: 5 });
  const [savingQ, setSavingQ] = useState(false);

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

  const successRate =
    stats && stats.totalUsers > 0
      ? Math.round((stats.prefsDone / stats.totalUsers) * 100)
      : 0;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "Georgia, serif" }}>
      {/* Top Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: BG,
        }}
      >
        <button
          onClick={() => setNavOpen(!navOpen)}
          style={{
            fontSize: 22,
            color: CRIMSON,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ≡
        </button>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: CRIMSON,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              lineHeight: 1.3,
            }}
          >
            THE HERITAGE
            <br />
            CURATOR
          </div>
        </div>

        <div
          style={{
            width: 36,
            height: 36,
            background: NAVY,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 16,
          }}
        >
          ⊞
        </div>
      </div>

      {/* Slide-out nav menu */}
      {navOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
          }}
          onClick={() => setNavOpen(false)}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 240,
              background: NAVY,
              padding: "56px 24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: GOLD,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Navigation
            </div>
            {[
              { label: "Dashboard", key: "dashboard" as const },
              { label: "Questions", key: "questions" as const },
              { label: "All Users", key: "users" as const },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => { setView(item.key); setNavOpen(false); }}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontSize: 15,
                  color: view === item.key ? "#fff" : "rgba(255,255,255,0.6)",
                  background: view === item.key ? "rgba(255,255,255,0.12)" : "transparent",
                  fontFamily: "Georgia, serif",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "8px 20px 100px", maxWidth: 520, margin: "0 auto" }}>

        {view === "dashboard" ? (
          <>
            {/* Hero */}
            <div style={{ marginBottom: 28 }}>
              <h1
                style={{
                  fontSize: 38,
                  fontWeight: 800,
                  color: "#1a140e",
                  lineHeight: 1.1,
                  marginBottom: 10,
                }}
              >
                Curatorial
                <br />
                Oversight
              </h1>
              <p style={{ fontSize: 14, color: "#7a6e60", lineHeight: 1.6, fontFamily: "Georgia, serif" }}>
                Morning, Curator. Here is the pulse of the heritage network.
              </p>
            </div>

            {/* Stat Cards */}
            {!stats ? (
              <div className="animate-pulse" style={{ color: "#7a6e60", marginBottom: 24 }}>
                Loading…
              </div>
            ) : (
              <>
                <StatCard
                  icon="👥"
                  label="Total Users"
                  badge={`+${stats.realUsers} real this week`}
                  badgeColor={GOLD}
                  value={stats.totalUsers.toLocaleString()}
                />
                <StatCard
                  icon="♥"
                  label="Active Matches"
                  badge={`${successRate}% success rate`}
                  badgeColor={GOLD}
                  value={stats.totalMatches.toLocaleString()}
                />
                <StatCard
                  icon="⚑"
                  label="High Matches"
                  badge={stats.highMatches > 0 ? "Action Required" : "All clear"}
                  badgeColor={stats.highMatches > 0 ? CRIMSON : GOLD}
                  value={stats.highMatches}
                />
              </>
            )}

            {/* Action Links */}
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => setView("questions")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "18px 20px",
                  background: CRIMSON,
                  color: "#fff",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "Georgia, serif",
                }}
              >
                Manage Questions
                <span style={{ fontSize: 18, fontWeight: 400 }}>→</span>
              </button>

              <button
                onClick={() => setView("users")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "18px 20px",
                  background: CARD_BG,
                  color: "#3a2e22",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "Georgia, serif",
                }}
              >
                Manage Users
                <span style={{ fontSize: 18, fontWeight: 400, color: CRIMSON }}>→</span>
              </button>
            </div>

            {/* System Health */}
            <div style={{ marginTop: 32 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a140e", marginBottom: 16 }}>
                System Health
              </h2>
              <div style={{ background: CARD_BG, borderRadius: 14, overflow: "hidden" }}>
                {/* Matching Engine row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7a6e60" }}>
                    Matching Engine
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2e7d5a", fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4caf73", display: "inline-block" }} />
                    {stats !== undefined ? "Optimal" : "Loading…"}
                  </span>
                </div>
                {/* DB Latency row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7a6e60" }}>
                    Database Latency
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>
                    {latencyMs !== null ? `${latencyMs}ms` : "—"}
                  </span>
                </div>
                {/* Quote */}
                <div style={{ padding: "14px 20px" }}>
                  <p style={{ fontSize: 12, fontStyle: "italic", color: "#9a8e80", lineHeight: 1.5 }}>
                    "Heritage Curator infrastructure is operating at peak historical performance."
                  </p>
                </div>
              </div>
            </div>

            {/* Membership Reach */}
            {stats && stats.totalUsers > 0 && (
              <div
                style={{
                  marginTop: 16,
                  background: CRIMSON,
                  borderRadius: 14,
                  padding: "20px 20px 24px",
                  marginBottom: 8,
                }}
              >
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 20 }}>
                  Membership Reach
                </h2>
                {[
                  {
                    label: "Onboarding Complete",
                    pct: Math.round((stats.onboarded / stats.totalUsers) * 100),
                  },
                  {
                    label: "Preferences Set",
                    pct: Math.round((stats.prefsDone / stats.totalUsers) * 100),
                  },
                ].map(({ label, pct }) => (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: GOLD }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: GOLD, borderRadius: 999, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : view === "questions" ? (
          <>
            {/* Questions view */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setView("dashboard")} style={{ color: CRIMSON, fontSize: 20 }}>←</button>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a140e" }}>Questions</h1>
              <span style={{ marginLeft: "auto", fontSize: 13, color: "#7a6e60" }}>
                {questions?.length ?? "—"} questions
              </span>
            </div>

            {!questions ? (
              <div style={{ color: "#7a6e60" }}>Loading…</div>
            ) : (
              questions.map((q) => {
                const isEditing = editingQ === q._id;
                return (
                  <div
                    key={q._id}
                    style={{
                      background: CARD_BG,
                      borderRadius: 12,
                      padding: "16px 18px",
                      marginBottom: 10,
                    }}
                  >
                    {/* Header row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                          textTransform: "uppercase", color: GOLD,
                        }}>
                          {q.category} · {q.type.replace("_", " ")}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: CRIMSON,
                          background: "rgba(128,0,32,0.08)", padding: "2px 8px", borderRadius: 999,
                        }}>
                          Weight {isEditing ? qDraft.defaultWeight : q.defaultWeight}/10
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => {
                              setEditingQ(q._id);
                              setQDraft({ text: q.text, defaultWeight: q.defaultWeight });
                            }}
                            style={{ fontSize: 13, color: "#7a6e60", padding: "2px 6px" }}
                          >
                            ✎
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div>
                        <textarea
                          value={qDraft.text}
                          onChange={(e) => setQDraft((d) => ({ ...d, text: e.target.value }))}
                          rows={2}
                          style={{
                            width: "100%", padding: "10px 12px",
                            background: "#f5f0e6", border: `1.5px solid ${CRIMSON}`,
                            borderRadius: 8, fontSize: 14, fontFamily: "Georgia, serif",
                            color: "#1a140e", outline: "none", resize: "vertical",
                            boxSizing: "border-box",
                          }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                          <label style={{ fontSize: 12, color: "#7a6e60", whiteSpace: "nowrap" }}>
                            Default Weight
                          </label>
                          <input
                            type="range" min={1} max={10}
                            value={qDraft.defaultWeight}
                            onChange={(e) => setQDraft((d) => ({ ...d, defaultWeight: Number(e.target.value) }))}
                            style={{ flex: 1, accentColor: CRIMSON }}
                          />
                          <span style={{ fontSize: 14, fontWeight: 700, color: CRIMSON, minWidth: 20 }}>
                            {qDraft.defaultWeight}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button
                            disabled={savingQ}
                            onClick={async () => {
                              setSavingQ(true);
                              try {
                                await updateQuestion({
                                  id: q._id,
                                  text: qDraft.text.trim(),
                                  defaultWeight: qDraft.defaultWeight,
                                });
                                setEditingQ(null);
                              } finally {
                                setSavingQ(false);
                              }
                            }}
                            style={{
                              padding: "8px 18px", background: CRIMSON, color: "#fff",
                              borderRadius: 8, fontSize: 13, fontWeight: 700,
                            }}
                          >
                            {savingQ ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingQ(null)}
                            style={{ padding: "8px 14px", fontSize: 13, color: "#7a6e60" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: 14, color: "#1a140e", lineHeight: 1.5, marginBottom: 8 }}>
                          {q.text}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {q.options?.map((opt) => (
                            <span key={opt.value} style={{
                              fontSize: 11, padding: "2px 8px",
                              background: "rgba(0,0,0,0.05)", borderRadius: 999,
                              color: "#7a6e60",
                            }}>
                              {opt.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        ) : (
          <>
            {/* Users view header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button
                onClick={() => setView("dashboard")}
                style={{ color: CRIMSON, fontSize: 20 }}
              >
                ←
              </button>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a140e" }}>All Users</h1>
              <span style={{ marginLeft: "auto", fontSize: 13, color: "#7a6e60" }}>
                {users?.length ?? "—"} total
              </span>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: CARD_BG,
                border: "none",
                borderRadius: 12,
                color: "#1a140e",
                marginBottom: 16,
                outline: "none",
                fontSize: 14,
                fontFamily: "Georgia, serif",
              }}
            />

            {!users ? (
              <div className="animate-pulse" style={{ color: "#7a6e60" }}>Loading users…</div>
            ) : filtered.length === 0 ? (
              <div style={{ color: "#7a6e60", textAlign: "center", padding: 32 }}>No users found</div>
            ) : (
              filtered.map((u) => (
                <div
                  key={u._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    background: CARD_BG,
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: u.avatarUrl
                        ? `url(${u.avatarUrl}) center/cover`
                        : `linear-gradient(135deg, ${CRIMSON}, #a3003a)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                      border: u.isSeed ? `2px dashed ${GOLD}` : "none",
                    }}
                  >
                    {!u.avatarUrl &&
                      u.displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1a140e",
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
                            fontSize: 9,
                            background: "#d4c9b0",
                            color: "#7a6e60",
                            padding: "1px 6px",
                            borderRadius: 999,
                            flexShrink: 0,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          seed
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 7px",
                          borderRadius: 999,
                          background: u.onboardingComplete ? "rgba(76,175,115,0.15)" : "rgba(0,0,0,0.06)",
                          color: u.onboardingComplete ? "#2e7d5a" : "#9a8e80",
                        }}
                      >
                        {u.onboardingComplete ? "✓ profile" : "no profile"}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 7px",
                          borderRadius: 999,
                          background: u.preferencesComplete ? "rgba(128,0,32,0.1)" : "rgba(0,0,0,0.06)",
                          color: u.preferencesComplete ? CRIMSON : "#9a8e80",
                        }}
                      >
                        {u.preferencesComplete ? "✓ prefs" : "no prefs"}
                      </span>
                    </div>
                  </div>

                  {confirmDelete === u._id ? (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleDelete(u._id)}
                        disabled={deleting}
                        style={{
                          fontSize: 12,
                          color: "#fff",
                          background: "#c0392b",
                          padding: "5px 10px",
                          borderRadius: 8,
                          fontWeight: 700,
                        }}
                      >
                        {deleting ? "…" : "Confirm"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{ fontSize: 12, color: "#7a6e60" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(u._id)}
                      style={{ fontSize: 18, color: "#b0a090", flexShrink: 0, padding: "4px 8px" }}
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
