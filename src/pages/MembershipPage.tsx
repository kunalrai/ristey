import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const CRIMSON = "#800020";
const GOLD = "#C5A059";
const STONE = "#F5F0E6";
const CARD_BG = "#EDE8DC";
const SERIF = "'Noto Serif', Georgia, serif";
const SANS = "'Inter', system-ui, sans-serif";

interface TierConfig {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  highlight: boolean;
  badge?: string;
}

const TIERS: TierConfig[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    priceNote: "Forever",
    features: [
      "Browse blurred match profiles",
      "Complete your heritage profile",
      "Basic compatibility scores",
    ],
    highlight: false,
  },
  {
    id: "curator",
    name: "Curator",
    price: "₹999",
    priceNote: "per month",
    features: [
      "Full profile visibility",
      "Unlimited messaging",
      "Verified member badge",
      "All compatibility details",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "heritage",
    name: "Heritage",
    price: "₹2,499",
    priceNote: "per month",
    features: [
      "Everything in Curator",
      "Priority ranking in matches",
      "Detailed compatibility reports",
      "Family co-login access",
    ],
    highlight: false,
  },
  {
    id: "concierge",
    name: "Concierge",
    price: "₹9,999",
    priceNote: "per month",
    features: [
      "Everything in Heritage",
      "Personal human curator",
      "5 handpicked introductions/month",
      "Private curator consultations",
    ],
    highlight: false,
  },
];

export default function MembershipPage() {
  const membership = useQuery(api.users.getMembership);
  const upgradeMembership = useMutation(api.users.upgradeMembership);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentTier = membership?.tier ?? "free";

  async function handleUpgrade(tierId: string) {
    if (tierId === currentTier) return;
    setUpgrading(tierId);
    setError(null);
    setConfirmed(null);
    try {
      await upgradeMembership({ tier: tierId });
      setConfirmed(tierId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed. Please try again.");
    } finally {
      setUpgrading(null);
    }
  }

  const tierLabel: Record<string, string> = {
    free: "Free",
    curator: "Curator",
    heritage: "Heritage",
    concierge: "Concierge",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: STONE,
        fontFamily: SANS,
        padding: "24px 16px 48px",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(22px, 4vw, 32px)",
            color: CRIMSON,
            marginBottom: 4,
            fontWeight: 700,
          }}
        >
          Membership
        </h1>
        <p style={{ color: "#555", fontSize: 15, marginBottom: 24 }}>
          Choose the plan that suits your heritage journey.
        </p>

        {/* Current tier badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: CARD_BG,
            border: `1px solid ${GOLD}`,
            borderRadius: 24,
            padding: "8px 18px",
            marginBottom: 32,
          }}
        >
          <span style={{ color: "#666", fontSize: 13, fontFamily: SANS }}>
            Current plan:
          </span>
          <span
            style={{
              color: CRIMSON,
              fontWeight: 700,
              fontSize: 14,
              fontFamily: SERIF,
              textTransform: "capitalize",
            }}
          >
            {tierLabel[currentTier] ?? currentTier}
          </span>
          {membership?.expiresAt && (
            <span style={{ color: "#888", fontSize: 12 }}>
              · expires {new Date(membership.expiresAt).toLocaleDateString("en-IN")}
            </span>
          )}
        </div>

        {/* Confirmation banner */}
        {confirmed && (
          <div
            style={{
              backgroundColor: "#e8f5e9",
              border: "1px solid #a5d6a7",
              borderRadius: 8,
              padding: "12px 18px",
              marginBottom: 24,
              color: "#2e7d32",
              fontSize: 14,
              fontFamily: SANS,
            }}
          >
            You have been upgraded to <strong>{tierLabel[confirmed]}</strong>. Welcome aboard!
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              border: "1px solid #ef9a9a",
              borderRadius: 8,
              padding: "12px 18px",
              marginBottom: 24,
              color: "#c62828",
              fontSize: 14,
              fontFamily: SANS,
            }}
          >
            {error}
          </div>
        )}

        {/* Tier cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 20,
          }}
        >
          {TIERS.map((tier) => {
            const isCurrent = currentTier === tier.id;
            const isLoading = upgrading === tier.id;

            return (
              <div
                key={tier.id}
                style={{
                  backgroundColor: CARD_BG,
                  border: tier.highlight
                    ? `2px solid ${CRIMSON}`
                    : `1px solid #d4c9b0`,
                  borderRadius: 14,
                  padding: "28px 22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: tier.highlight
                    ? `0 4px 18px rgba(128,0,32,0.12)`
                    : `0 2px 8px rgba(0,0,0,0.06)`,
                }}
              >
                {/* Most Popular badge */}
                {tier.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: -13,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: CRIMSON,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      padding: "4px 14px",
                      borderRadius: 20,
                      fontFamily: SANS,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tier.badge}
                  </div>
                )}

                {/* Tier name */}
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontSize: 20,
                    fontWeight: 700,
                    color: tier.highlight ? CRIMSON : "#3a2e22",
                    marginBottom: 4,
                    marginTop: tier.badge ? 6 : 0,
                  }}
                >
                  {tier.name}
                </h2>

                {/* Price */}
                <div style={{ marginBottom: 20 }}>
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#2a1f14",
                      fontFamily: SERIF,
                    }}
                  >
                    {tier.price}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#888",
                      marginLeft: 4,
                      fontFamily: SANS,
                    }}
                  >
                    {tier.priceNote}
                  </span>
                </div>

                {/* Features */}
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 24px 0",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        fontSize: 13.5,
                        color: "#4a3f30",
                        fontFamily: SANS,
                        lineHeight: 1.4,
                      }}
                    >
                      <span
                        style={{
                          color: GOLD,
                          fontSize: 15,
                          marginTop: 1,
                          flexShrink: 0,
                        }}
                      >
                        ✦
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isCurrent || isLoading}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    borderRadius: 8,
                    border: isCurrent
                      ? `1.5px solid ${GOLD}`
                      : tier.highlight
                      ? "none"
                      : `1.5px solid ${CRIMSON}`,
                    backgroundColor: isCurrent
                      ? "transparent"
                      : tier.highlight
                      ? CRIMSON
                      : "transparent",
                    color: isCurrent
                      ? GOLD
                      : tier.highlight
                      ? "#fff"
                      : CRIMSON,
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: isCurrent ? "default" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  {isCurrent
                    ? "Current Plan"
                    : isLoading
                    ? "Upgrading…"
                    : tier.id === "free"
                    ? "Downgrade to Free"
                    : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p
          style={{
            textAlign: "center",
            color: "#999",
            fontSize: 12,
            marginTop: 32,
            fontFamily: SANS,
            lineHeight: 1.6,
          }}
        >
          Membership upgrades are simulated for demo purposes. In production, payment processing
          would be handled securely via a payment gateway.
        </p>
      </div>
    </div>
  );
}
