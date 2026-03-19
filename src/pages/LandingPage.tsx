import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const BG      = "#F5F0E6";
const CARD_BG = "#EDE8DC";
const CRIMSON = "#800020";
const GOLD    = "#C5A059";
const NAVY    = "#1C2B3A";

const PILLARS = [
  { icon: "♛", title: "Heritage",   desc: "Rooted in culture, community, and ancestry." },
  { icon: "♥", title: "Tradition",  desc: "Values that stand the test of generations." },
  { icon: "✦", title: "Intention",  desc: "Serious matches built on shared purpose." },
];

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user: clerkUser }            = useUser();
  const convexUser                     = useQuery(api.users.getCurrentUser);
  const createOrUpdateUser             = useMutation(api.users.createOrUpdateUser);
  const navigate                       = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !clerkUser) return;
    createOrUpdateUser({
      displayName: clerkUser.fullName ?? clerkUser.username ?? "User",
      email: clerkUser.primaryEmailAddress?.emailAddress,
      avatarUrl: clerkUser.imageUrl,
    }).catch(console.error);
  }, [isAuthenticated, clerkUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthenticated) return;
    if (convexUser === undefined) return;
    if (!convexUser) return;
    if (!convexUser.onboardingComplete) navigate("/onboarding", { replace: true });
    else if (!convexUser.preferencesComplete) navigate("/preferences", { replace: true });
    else navigate("/feed", { replace: true });
  }, [isAuthenticated, convexUser]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || isAuthenticated) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, fontFamily: "Georgia, serif", color: "#7a6e60" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "Georgia, serif", overflowX: "hidden" }}>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: CRIMSON, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.4 }}>
          THE HERITAGE<br />CURATOR
        </div>
        <div style={{ width: 36, height: 36, background: NAVY, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>
          ❤️
        </div>
      </div>

      {/* ── Hero ── */}
      <div
        style={{
          margin: "0 20px 0",
          borderRadius: 20,
          background: `linear-gradient(160deg, ${CRIMSON} 0%, #3a0010 100%)`,
          padding: "48px 28px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative rings */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.15)" }} />

        <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
          ✦ Heritage Matchmaking
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 16 }}>
          Find Your<br />Heritage<br />Match
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 0, maxWidth: 260 }}>
          Where tradition meets intention. Curated connections rooted in culture, values, and ancestry.
        </p>
      </div>

      {/* ── Pillars ── */}
      <div style={{ display: "flex", gap: 10, padding: "20px 20px 0", overflowX: "auto", scrollbarWidth: "none" }}>
        {PILLARS.map(({ icon, title, desc }) => (
          <div
            key={title}
            style={{
              flex: "0 0 140px",
              background: CARD_BG,
              borderRadius: 14,
              padding: "18px 16px",
            }}
          >
            <div style={{ fontSize: 18, color: CRIMSON, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1a140e", marginBottom: 5 }}>{title}</div>
            <div style={{ fontSize: 11, color: "#7a6e60", lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* ── Divider with tag ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "28px 24px 20px" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "#9a8e80", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Begin Your Journey
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
      </div>

      {/* ── Sign In Card ── */}
      <div style={{ padding: "0 20px 48px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <SignIn
            appearance={{
              variables: {
                colorPrimary: CRIMSON,
                colorBackground: CARD_BG,
                colorText: "#1a140e",
                colorInputBackground: BG,
                colorInputText: "#1a140e",
                colorTextSecondary: "#7a6e60",
                borderRadius: "14px",
                fontFamily: "Georgia, serif",
              },
              elements: {
                card: {
                  border: "none",
                  boxShadow: "none",
                  background: "transparent",
                },
                rootBox: { width: "100%" },
              },
            }}
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: "center", padding: "0 24px 32px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: CRIMSON, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
          The Heritage Curator
        </div>
        <p style={{ fontSize: 11, color: "#9a8e80", lineHeight: 1.6 }}>
          Curating meaningful connections rooted in heritage and intention.
        </p>
      </div>

    </div>
  );
}
