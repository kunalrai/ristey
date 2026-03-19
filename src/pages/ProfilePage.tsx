import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";

const SECTION_LABELS: Record<string, string> = {
  location: "📍 Location",
  caste: "🏘️ Community",
  diet: "🍽️ Diet",
  kids: "👶 Kids",
  career: "💼 Career",
  music: "🎵 Music",
  movies: "🎬 Movies",
  politics: "🗳️ Politics",
  religion: "🙏 Religion",
  ethnicity: "🌏 Ethnicity",
};

export default function ProfilePage() {
  const user = useQuery(api.users.getCurrentUser);
  const profileAnswers = useQuery(api.profiles.getProfileAnswers, {});
  const updateName = useMutation(api.users.updateDisplayName);
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  if (!user || profileAnswers === undefined) {
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

  const initials = user.displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSaveName = async () => {
    if (nameValue.trim()) {
      await updateName({ displayName: nameValue.trim() });
    }
    setEditingName(false);
  };

  return (
    <div
      style={{
        padding: "var(--space-lg) var(--space-md)",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Avatar & name */}
      <div
        style={{
          background: "var(--color-bg-card)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-xl)",
          border: "1px solid var(--color-border)",
          textAlign: "center",
          marginBottom: "var(--space-md)",
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

        {editingName ? (
          <div style={{ display: "flex", gap: "var(--space-sm)" }}>
            <input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              style={{
                flex: 1,
                padding: "10px var(--space-md)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
                fontSize: "var(--font-md)",
                textAlign: "center",
                outline: "none",
              }}
            />
            <button
              onClick={handleSaveName}
              style={{
                padding: "10px var(--space-md)",
                background: "var(--color-primary)",
                borderRadius: "var(--radius-md)",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              Save
            </button>
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800 }}>
              {user.displayName}
            </h1>
            {user.email && (
              <p
                style={{
                  fontSize: "var(--font-sm)",
                  color: "var(--color-text-muted)",
                  marginTop: "var(--space-xs)",
                }}
              >
                {user.email}
              </p>
            )}
            <button
              onClick={() => {
                setNameValue(user.displayName);
                setEditingName(true);
              }}
              style={{
                marginTop: "var(--space-sm)",
                fontSize: "var(--font-sm)",
                color: "var(--color-primary)",
              }}
            >
              Edit name
            </button>
          </div>
        )}
      </div>

      {/* Profile answers */}
      <div
        style={{
          background: "var(--color-bg-card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          overflow: "hidden",
          marginBottom: "var(--space-md)",
        }}
      >
        <div
          style={{
            padding: "var(--space-md) var(--space-lg)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>My Profile</h2>
          <button
            onClick={() => navigate("/onboarding")}
            style={{ fontSize: "var(--font-sm)", color: "var(--color-primary)" }}
          >
            Edit
          </button>
        </div>

        {Object.entries(SECTION_LABELS).map(([key, label]) => {
          const val = (profileAnswers as Record<string, string>)[key];
          return (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "var(--space-md) var(--space-lg)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
                {label}
              </span>
              <span
                style={{
                  fontSize: "var(--font-sm)",
                  color: val ? "var(--color-text)" : "var(--color-text-subtle)",
                  textAlign: "right",
                  maxWidth: "60%",
                }}
              >
                {val
                  ? (() => {
                      try {
                        const parsed = JSON.parse(val) as string[];
                        if (Array.isArray(parsed))
                          return parsed.map((v) => v.replace(/_/g, " ")).join(", ");
                      } catch {
                        // not array
                      }
                      return val.replace(/_/g, " ");
                    })()
                  : "Not set"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Preferences */}
      <button
        onClick={() => navigate("/preferences")}
        style={{
          width: "100%",
          padding: "var(--space-md) var(--space-lg)",
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          color: "var(--color-text)",
          fontSize: "var(--font-base)",
          fontWeight: 600,
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          marginBottom: "var(--space-md)",
        }}
      >
        <span>⚖️ My Match Preferences</span>
        <span style={{ color: "var(--color-text-muted)" }}>→</span>
      </button>

      {/* Sign out */}
      <button
        onClick={() => signOut({ redirectUrl: "/" })}
        style={{
          width: "100%",
          padding: "var(--space-md) var(--space-lg)",
          background: "transparent",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          color: "var(--color-text-muted)",
          fontSize: "var(--font-base)",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
