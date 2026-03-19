import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// ── Design tokens ─────────────────────────────────────────────────────────────
const CRIMSON   = "#800020";
const GOLD      = "#C5A059";
const GOLD_DARK = "#9A7A3A";
const NAVY      = "#1C2B3A";
const STONE     = "#F5F0E6";
const STONE_100 = "#EDE8DC";
const STONE_200 = "#D9D0BE";
const TEXT      = "#1a140e";
const MUTED     = "#7a6e60";
const SERIF     = "'Noto Serif', Georgia, serif";
const SANS      = "'Inter', system-ui, sans-serif";

// ── Hook ──────────────────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return mobile;
}

// ── Reusable components ───────────────────────────────────────────────────────
function NavLink({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: SANS, fontSize: 14, fontWeight: 500,
        color: hovered ? CRIMSON : TEXT, textDecoration: "none",
        paddingBottom: 2,
        borderBottom: hovered ? `2px solid ${CRIMSON}` : "2px solid transparent",
        transition: "color 0.2s, border-color 0.2s",
      }}
    >
      {children}
    </a>
  );
}

function PrimaryBtn({ children, onClick, large, full }: { children: React.ReactNode; onClick?: () => void; large?: boolean; full?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: SANS, fontSize: large ? 15 : 14, fontWeight: 600,
        color: "#fff", background: CRIMSON,
        padding: large ? "16px 36px" : "11px 24px",
        borderRadius: 6, letterSpacing: "0.04em", textTransform: "uppercase",
        cursor: "pointer", opacity: hovered ? 0.85 : 1, transition: "opacity 0.2s",
        border: "none", whiteSpace: "nowrap",
        width: full ? "100%" : undefined,
      }}
    >
      {children}
    </button>
  );
}

function OutlineBtn({ children, onClick, large, full }: { children: React.ReactNode; onClick?: () => void; large?: boolean; full?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: SANS, fontSize: large ? 15 : 14, fontWeight: 600,
        color: "#fff",
        background: hovered ? "rgba(255,255,255,0.15)" : "transparent",
        padding: large ? "16px 36px" : "11px 24px",
        borderRadius: 6, letterSpacing: "0.04em", textTransform: "uppercase",
        cursor: "pointer", border: "1.5px solid rgba(255,255,255,0.6)",
        transition: "background 0.2s", whiteSpace: "nowrap",
        width: full ? "100%" : undefined,
      }}
    >
      {children}
    </button>
  );
}

// ── Static data ───────────────────────────────────────────────────────────────
const METHODOLOGY = [
  { weight: "45%", title: "Tradition",     subtitle: "Cultural Foundation",    icon: "♛", desc: "Deep cultural nuances, family values, and ancestral heritage form the bedrock of every curated match." },
  { weight: "35%", title: "Compatibility", subtitle: "Intellectual Alignment",  icon: "✦", desc: "Psychological profiling, intellectual pursuits, and shared philosophy — the architecture of lasting connection." },
  { weight: "20%", title: "Lifestyle",     subtitle: "Aesthetic Harmony",       icon: "◈", desc: "Aesthetic sensibilities, social temperament, and the quiet rhythms of daily life, aligned with care." },
];

const TESTIMONIALS = [
  { quote: "A match of intellect and spirit. The Curator understood what we could not articulate ourselves.", name: "A. & R. Mehta",       location: "Mumbai · London" },
  { quote: "For the first time, someone considered our family's values without us having to explain them.",  name: "The Krishnamurthys", location: "Chennai · Singapore" },
  { quote: "Discreet, considered, and deeply human. Exactly what we hoped for.",                            name: "S. Oberoi",           location: "New Delhi" },
];

const FOOTER_COLS = [
  { heading: "Navigate", links: ["Discover", "Our Philosophy", "Curators", "Membership"] },
  { heading: "Connect",  links: ["Begin Your Journey", "Curator Enquiries", "Media", "Partnerships"] },
  { heading: "Archives", links: ["Success Stories", "Heritage Library", "Curation Journal", "Press"] },
  { heading: "Brand",    links: ["Our Promise", "Privacy Charter", "Terms of Curation", "Contact"] },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user: clerkUser }            = useUser();
  const convexUser                     = useQuery(api.users.getCurrentUser);
  const createOrUpdateUser             = useMutation(api.users.createOrUpdateUser);
  const navigate                       = useNavigate();
  const signInRef                      = useRef<HTMLDivElement>(null);
  const [navScrolled, setNavScrolled]  = useState(false);
  const [menuOpen, setMenuOpen]        = useState(false);
  const isMobile                       = useIsMobile();

  const px = isMobile ? "20px" : "40px";

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

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollToSignIn = () => {
    setMenuOpen(false);
    signInRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (isLoading || isAuthenticated) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: STONE, fontFamily: SERIF, color: MUTED }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: STONE, overflowX: "hidden" }}>

      {/* ══ A. NAV ══════════════════════════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: navScrolled ? "rgba(245,240,230,0.95)" : "rgba(245,240,230,0.80)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderBottom: navScrolled ? `1px solid ${STONE_200}` : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: `0 ${px}`, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: isMobile ? 17 : 20, color: CRIMSON, letterSpacing: "-0.02em" }}>
            The Heritage Curator
          </div>

          {/* Desktop links */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {["Discover", "Our Philosophy", "Curators", "Membership"].map(l => <NavLink key={l}>{l}</NavLink>)}
            </div>
          )}

          {/* Desktop CTA / Mobile hamburger */}
          {isMobile ? (
            <button onClick={() => setMenuOpen(o => !o)} style={{ fontSize: 24, color: CRIMSON, lineHeight: 1, background: "none", border: "none", cursor: "pointer" }}>
              {menuOpen ? "✕" : "≡"}
            </button>
          ) : (
            <PrimaryBtn onClick={scrollToSignIn}>Begin Journey</PrimaryBtn>
          )}
        </div>

        {/* Mobile slide-down menu */}
        {isMobile && menuOpen && (
          <div style={{ background: STONE, borderTop: `1px solid ${STONE_200}`, padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {["Discover", "Our Philosophy", "Curators", "Membership"].map(l => (
              <a key={l} href="#" onClick={() => setMenuOpen(false)} style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: TEXT, textDecoration: "none" }}>{l}</a>
            ))}
            <PrimaryBtn full onClick={scrollToSignIn}>Begin Journey</PrimaryBtn>
          </div>
        )}
      </nav>

      {/* ══ B. HERO ═════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #1a0008 0%, ${CRIMSON} 45%, #4a1520 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", paddingTop: 64,
      }}>
        {/* Decorative rings — fewer on mobile */}
        {(isMobile ? [200, 360] : [300, 500, 700, 900]).map((size, i) => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: size, height: size, borderRadius: "50%",
            border: `1px solid rgba(212,175,55,${0.06 - i * 0.01})`,
            pointerEvents: "none",
          }} />
        ))}

        <div style={{ textAlign: "center", maxWidth: 780, padding: isMobile ? "40px 24px" : "0 40px", position: "relative" }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>
            ✦ &nbsp; Curated Matchmaking &nbsp; ✦
          </div>
          <h1 style={{
            fontFamily: SERIF,
            fontSize: isMobile ? 38 : "clamp(40px, 6vw, 72px)",
            fontWeight: 800, color: "#fff",
            lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: 24,
          }}>
            Curating Heritage,<br />
            <em style={{ fontStyle: "italic", color: GOLD }}>One Connection</em><br />
            at a Time
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: isMobile ? 15 : 18, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 40, maxWidth: 520, margin: "0 auto 40px" }}>
            Where tradition meets intention. A discreet curation of matches rooted in cultural heritage, family values, and intellectual alignment.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexDirection: isMobile ? "column" : "row", padding: isMobile ? "0 8px" : 0 }}>
            <PrimaryBtn large={!isMobile} full={isMobile} onClick={scrollToSignIn}>Begin Your Curation</PrimaryBtn>
            <OutlineBtn large={!isMobile} full={isMobile} onClick={scrollToSignIn}>Explore Your Potential</OutlineBtn>
          </div>

          {/* Stats */}
          <div style={{ marginTop: 56, display: "flex", justifyContent: "center", gap: isMobile ? 28 : 48, flexWrap: "wrap" }}>
            {[["2,400+", "Heritage Matches"], ["94%", "Satisfaction Rate"], ["38", "Cultural Backgrounds"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: SERIF, fontSize: isMobile ? 24 : 28, fontWeight: 800, color: GOLD }}>{num}</div>
                <div style={{ fontFamily: SANS, fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ C. METHODOLOGY ══════════════════════════════════════════════════ */}
      <section style={{ background: STONE, padding: isMobile ? "72px 24px" : "100px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD_DARK, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
              Our Approach
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 28 : "clamp(28px, 4vw, 48px)", fontWeight: 800, color: TEXT, letterSpacing: "-0.02em", marginBottom: 14 }}>
              The Art of the Match
            </h2>
            <p style={{ fontFamily: SERIF, fontSize: 15, color: MUTED, lineHeight: 1.8, maxWidth: 480, margin: "0 auto" }}>
              Our weighted algorithm considers what truly endures — not preferences, but principles.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 16 : 24 }}>
            {METHODOLOGY.map(({ weight, title, subtitle, desc, icon }) => (
              <div key={title} style={{ background: "#fff", border: `1px solid ${STONE_200}`, borderRadius: 16, padding: isMobile ? "28px 24px" : "40px 36px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -12, right: 20, fontFamily: SERIF, fontSize: 64, fontWeight: 800, color: STONE_100, lineHeight: 1, userSelect: "none" }}>{icon}</div>
                <div style={{ fontFamily: SERIF, fontSize: isMobile ? 40 : 48, fontWeight: 800, color: CRIMSON, lineHeight: 1, marginBottom: 14 }}>{weight}</div>
                <div style={{ width: 36, height: 2, background: GOLD, marginBottom: 16 }} />
                <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{title}</h3>
                <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD_DARK, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>{subtitle}</div>
                <p style={{ fontFamily: SERIF, fontSize: 14, color: MUTED, lineHeight: 1.8 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ D. SOCIAL PROOF ═════════════════════════════════════════════════ */}
      <section style={{ background: STONE_100, padding: isMobile ? "72px 24px" : "100px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 48 : 80, alignItems: "center" }}>
          {/* Testimonials */}
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD_DARK, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>Success Stories</div>
            <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 26 : "clamp(26px, 3vw, 40px)", fontWeight: 800, color: TEXT, letterSpacing: "-0.02em", marginBottom: 40 }}>
              Matches That<br /><em style={{ fontStyle: "italic" }}>Endure</em>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {TESTIMONIALS.map(({ quote, name, location }) => (
                <div key={name} style={{ borderLeft: `2px solid ${CRIMSON}`, paddingLeft: 20 }}>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: TEXT, lineHeight: 1.8, marginBottom: 10 }}>"{quote}"</p>
                  <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: CRIMSON }}>{name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 10, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>{location}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mosaic — hidden on mobile to keep it clean */}
          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "200px 200px", gap: 12 }}>
              {([
                [`linear-gradient(135deg, ${CRIMSON} 0%, #3a0010 100%)`, "♛"],
                [`linear-gradient(135deg, ${NAVY} 0%, #0d1a26 100%)`, "✦"],
                [`linear-gradient(135deg, #2a1a0a 0%, #6b4c1e 100%)`, "◈"],
                [`linear-gradient(135deg, #1a2a1a 0%, #3a5a2a 100%)`, "❦"],
              ] as [string, string][]).map(([bg, icon], i) => (
                <div key={i} style={{
                  background: bg,
                  borderRadius: i === 0 ? "16px 4px 4px 4px" : i === 1 ? "4px 16px 4px 4px" : i === 2 ? "4px 4px 4px 16px" : "4px 4px 16px 4px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 36, color: "rgba(255,255,255,0.15)", fontFamily: SERIF,
                }}>
                  {icon}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ E. BRAND AESTHETIC ══════════════════════════════════════════════ */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #0d1624 100%)`,
        padding: isMobile ? "80px 24px" : "120px 40px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: isMobile ? 300 : 600, height: isMobile ? 300 : 600, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
            A World Worth Sharing
          </div>
          <blockquote style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 26 : "clamp(24px, 4vw, 44px)", fontWeight: 700, color: "#fff", lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: 28 }}>
            "True class is invisible<br />until it is felt."
          </blockquote>
          <div style={{ width: 40, height: 2, background: GOLD, margin: "0 auto 28px" }} />
          <p style={{ fontFamily: SERIF, fontSize: isMobile ? 14 : 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.9, maxWidth: 440, margin: "0 auto" }}>
            From private cultural viewings to candlelit heritage dinners — every connection we curate reflects a life lived with intention and grace.
          </p>
        </div>
      </section>

      {/* ══ F. CONVERSION ═══════════════════════════════════════════════════ */}
      <section style={{ background: STONE, padding: isMobile ? "72px 24px" : "100px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD_DARK, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
            Entry by Invitation
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? 32 : "clamp(28px, 4vw, 52px)", fontWeight: 800, color: TEXT, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 18 }}>
            Your Legacy<br /><em style={{ fontStyle: "italic", color: CRIMSON }}>Awaits</em>
          </h2>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: MUTED, lineHeight: 1.9, maxWidth: 400, margin: "0 auto 40px" }}>
            Membership is granted to those who understand that the most meaningful connections are never rushed — only carefully curated.
          </p>
          <PrimaryBtn large={!isMobile} full={isMobile} onClick={scrollToSignIn}>Apply for Membership</PrimaryBtn>
          <p style={{ fontFamily: SANS, fontSize: 11, color: MUTED, marginTop: 16, letterSpacing: "0.04em" }}>
            Vetted applications only · Complete discretion assured
          </p>
        </div>
      </section>

      {/* ══ SIGN IN ══════════════════════════════════════════════════════════ */}
      <section ref={signInRef} style={{ background: STONE_100, padding: isMobile ? "60px 24px" : "80px 40px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD_DARK, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
            Begin Your Journey
          </div>
          <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? 22 : 28, fontWeight: 700, color: TEXT, marginBottom: 28 }}>
            Sign In to the Curator
          </h3>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SignIn
              appearance={{
                variables: {
                  colorPrimary: CRIMSON,
                  colorBackground: "#fff",
                  colorText: TEXT,
                  colorInputBackground: STONE,
                  colorInputText: TEXT,
                  colorTextSecondary: MUTED,
                  borderRadius: "10px",
                  fontFamily: SERIF,
                },
                elements: {
                  card: { boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: `1px solid ${STONE_200}` },
                  rootBox: { width: "100%" },
                },
              }}
            />
          </div>
        </div>
      </section>

      {/* ══ G. FOOTER ═══════════════════════════════════════════════════════ */}
      <footer style={{ background: NAVY, padding: isMobile ? "48px 24px 28px" : "64px 40px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Brand on mobile sits on top full-width; on desktop it's part of the grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "2fr 1fr 1fr 1fr 1fr",
            gap: isMobile ? "32px 24px" : 48,
            marginBottom: isMobile ? 40 : 64,
          }}>
            {/* Brand col — full width row on mobile */}
            <div style={{ gridColumn: isMobile ? "1 / -1" : undefined }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 12 }}>
                The Heritage Curator
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 260 }}>
                Discreet curation of meaningful connections rooted in culture, tradition, and intention.
              </p>
              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                {["♛", "✦", "◈"].map(icon => (
                  <div key={icon} style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontSize: 13 }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns — 2 per row on mobile, all 4 on desktop */}
            {FOOTER_COLS.map(({ heading, links }) => (
              <div key={heading}>
                <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
                  {heading}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {links.map(l => (
                    <a
                      key={l} href="#"
                      style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                    >
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 8 : 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
              © {new Date().getFullYear()} The Heritage Curator. All rights reserved.
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
              Curated with care.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
