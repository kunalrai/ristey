import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const navigate = useNavigate();

  // Provision Convex user record once Clerk auth is confirmed
  useEffect(() => {
    if (!isAuthenticated || !clerkUser) return;

    createOrUpdateUser({
      displayName: clerkUser.fullName ?? clerkUser.username ?? "User",
      email: clerkUser.primaryEmailAddress?.emailAddress,
      avatarUrl: clerkUser.imageUrl,
    }).catch(console.error);
  }, [isAuthenticated, clerkUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate once the Convex user record is available
  useEffect(() => {
    if (!isAuthenticated) return;
    if (convexUser === undefined) return; // still loading
    if (!convexUser) return;             // not yet provisioned

    if (!convexUser.onboardingComplete) navigate("/onboarding", { replace: true });
    else if (!convexUser.preferencesComplete) navigate("/preferences", { replace: true });
    else navigate("/feed", { replace: true });
  }, [isAuthenticated, convexUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show spinner while Clerk is initialising OR while authenticated user
  // is being provisioned/redirected — never render <SignIn> for a signed-in user
  if (isLoading || isAuthenticated) {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-xl)",
        background: "linear-gradient(160deg, #c8b0c8 0%, var(--color-bg) 60%)",
      }}
    >
      <div
        className="animate-slide-up"
        style={{ textAlign: "center", maxWidth: 480, width: "100%" }}
      >
        <div style={{ fontSize: 64, marginBottom: "var(--space-md)" }}>💞</div>
        <h1
          style={{
            fontSize: "var(--font-2xl)",
            fontWeight: 800,
            marginBottom: "var(--space-sm)",
            background:
              "linear-gradient(135deg, var(--color-primary-light), var(--color-primary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Ristey
        </h1>
        <p
          style={{
            fontSize: "var(--font-md)",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-2xl)",
            lineHeight: 1.6,
          }}
        >
          Find your perfect match based on what truly matters to you.
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#800020",
                colorBackground: "#f0eaf0",
                colorText: "#1a1020",
                colorInputBackground: "#f7f2f7",
                colorInputText: "#1a1020",
                borderRadius: "12px",
              },
              elements: {
                card: {
                  border: "1px solid #d0c4d0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
