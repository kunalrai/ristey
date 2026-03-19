import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";

const BG = "#F5F0E6";
const CARD_BG = "#EDE8DC";
const CRIMSON = "#800020";
const GOLD = "#C5A059";
const NAVY = "#1C2B3A";

// Map profile keys to display labels & Core Values category
const CORE_VALUE_KEYS: { key: string; label: string; sub?: string }[] = [
  { key: "caste",    label: "Heritage" },
  { key: "religion", label: "Belief" },
  { key: "ethnicity",label: "Ancestry" },
  { key: "location", label: "Location" },
  { key: "diet",     label: "Diet" },
  { key: "kids",     label: "Family" },
  { key: "career",   label: "Career" },
  { key: "politics", label: "Values" },
];

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

export default function ProfilePage() {
  const user          = useQuery(api.users.getCurrentUser);
  const profileAnswers = useQuery(api.profiles.getProfileAnswers, {});
  const bestMatch     = useQuery(api.matches.getBestMatchScore);
  const updateName    = useMutation(api.users.updateDisplayName);
  const generateUploadUrl = useMutation(api.users.generateAvatarUploadUrl);
  const updateAvatar  = useMutation(api.users.updateAvatar);
  const navigate      = useNavigate();
  const { signOut }   = useClerk();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue]     = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => { if (!uploadingAvatar) fileInputRef.current?.click(); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      await updateAvatar({ storageId });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveName = async () => {
    if (nameValue.trim()) await updateName({ displayName: nameValue.trim() });
    setEditingName(false);
  };

  if (!user || profileAnswers === undefined) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, color: "#7a6e60", fontFamily: "Georgia, serif" }}>
        Loading…
      </div>
    );
  }

  const answers = profileAnswers as Record<string, string>;
  const initials = user.displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const status = deriveStatus(user.onboardingComplete, user.preferencesComplete);
  const career = fmt(answers.career) || "Heritage Curator";
  const coreValues = CORE_VALUE_KEYS.map(({ key, label }) => ({ key, label, value: fmt(answers[key]) })).filter((v) => v.value);

  // Compose a brief about-me from answers
  const aboutParts: string[] = [];
  if (answers.religion)  aboutParts.push(`A ${fmt(answers.religion)} by faith`);
  if (answers.caste)     aboutParts.push(`rooted in ${fmt(answers.caste)} heritage`);
  if (answers.location)  aboutParts.push(`based in ${fmt(answers.location)}`);
  if (answers.career)    aboutParts.push(`working in ${fmt(answers.career)}`);
  if (answers.diet)      aboutParts.push(`following a ${fmt(answers.diet)} lifestyle`);
  const aboutText = aboutParts.length > 0
    ? aboutParts.join(", ") + ". I value deep connections built on shared culture and tradition."
    : "Complete your profile to share your story with potential matches.";

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "Georgia, serif", paddingBottom: 96 }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

      {/* ── Top Nav ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: BG }}>
        <button onClick={() => navigate(-1)} style={{ color: CRIMSON, fontSize: 20, lineHeight: 1 }}>←</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: CRIMSON, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.3 }}>
            THE HERITAGE<br />CURATOR
          </div>
        </div>
        <div style={{ width: 36, height: 36, background: NAVY, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>
          👤
        </div>
      </div>

      {/* ── Hero Photo ── */}
      <div
        onClick={handleAvatarClick}
        style={{ position: "relative", width: "100%", aspectRatio: "3/4", maxHeight: 420, cursor: "pointer", overflow: "hidden", flexShrink: 0 }}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: uploadingAvatar ? 0.6 : 1 }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(160deg, ${CRIMSON} 0%, #3a0010 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              fontWeight: 800,
              color: "rgba(255,255,255,0.3)",
            }}
          >
            {initials}
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,4,2,0.82) 0%, transparent 55%)" }} />

        {/* Upload hint */}
        {uploadingAvatar && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 14 }}>
            Uploading…
          </div>
        )}

        {/* Camera badge */}
        <div style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
          📷
        </div>

        {/* Name overlay */}
        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          {editingName ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                style={{
                  flex: 1, padding: "8px 12px", background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 10, color: "#fff", fontSize: 18, outline: "none", fontFamily: "Georgia, serif",
                }}
              />
              <button onClick={handleSaveName} style={{ padding: "8px 16px", background: CRIMSON, borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14 }}>
                Save
              </button>
            </div>
          ) : (
            <div onClick={(e) => { e.stopPropagation(); setNameValue(user.displayName); setEditingName(true); }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
                {user.displayName}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4, fontStyle: "italic" }}>
                {career}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Strip ── */}
      <div style={{ background: BG, display: "flex", borderBottom: `1px solid rgba(0,0,0,0.07)` }}>
        {[
          { label: "Status",  value: status,          color: CRIMSON },
          { label: "Intent",  value: user.preferencesComplete ? "Serious" : "Casual", color: GOLD },
          { label: "Match",   value: bestMatch != null ? `${bestMatch}%` : "—",       color: NAVY },
        ].map(({ label, value, color }, i) => (
          <div
            key={label}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "14px 8px",
              borderRight: i < 2 ? "1px solid rgba(0,0,0,0.07)" : "none",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9a8e80", marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px", maxWidth: 520, margin: "0 auto" }}>

        {/* ── About Me ── */}
        <div style={{ marginTop: 28, marginBottom: 28 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, fontWeight: 800, color: CRIMSON, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>✦</span> About Me
          </h2>
          <p style={{ fontSize: 15, color: "#4a3e32", lineHeight: 1.7 }}>
            {aboutText}
          </p>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.07)", marginBottom: 28 }} />

        {/* ── Core Values ── */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, fontWeight: 800, color: CRIMSON, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>♛</span> Core Values
          </h2>

          {coreValues.length === 0 ? (
            <p style={{ fontSize: 14, color: "#9a8e80", fontStyle: "italic" }}>
              Complete your profile to show your values.
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

        <div style={{ height: 1, background: "rgba(0,0,0,0.07)", marginBottom: 24 }} />

        {/* ── Actions ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => navigate("/onboarding")}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 20px", background: CRIMSON, color: "#fff",
              borderRadius: 12, fontSize: 12, fontWeight: 800,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}
          >
            Edit Profile <span style={{ fontSize: 16, fontWeight: 400 }}>→</span>
          </button>

          <button
            onClick={() => navigate("/preferences")}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 20px", background: CARD_BG, color: "#3a2e22",
              borderRadius: 12, fontSize: 12, fontWeight: 800,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}
          >
            Match Preferences
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD, display: "inline-block" }} />
          </button>

          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            style={{
              padding: "14px 20px", background: "transparent",
              border: `1px solid rgba(0,0,0,0.12)`, color: "#9a8e80",
              borderRadius: 12, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
