import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import PreferencesPage from "./pages/PreferencesPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import MatchDetailPage from "./pages/MatchDetailPage";
import MessagesPage from "./pages/MessagesPage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";
import AppShell from "./components/layout/AppShell";
import AdminPage from "./pages/AdminPage";
import MembershipPage from "./pages/MembershipPage";

const ADMIN_EMAIL = "ikunalrai@gmail.com";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);

  if (isLoading || user === undefined) return null;
  if (!isAuthenticated || !user) return <Navigate to="/" replace />;
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);

  // Wait while Clerk/Convex auth is resolving OR while the user record is loading
  if (isLoading || user === undefined) {
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

  if (!isAuthenticated) return <Navigate to="/" replace />;
  // user is null means authenticated but Convex record not yet provisioned — go to landing
  if (!user) return <Navigate to="/" replace />;
  if (!user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  if (!user.preferencesComplete) return <Navigate to="/preferences" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />

        <Route
          element={
            <AuthGate>
              <AppShell />
            </AuthGate>
          }
        >
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/match/:userId" element={<MatchDetailPage />} />
          <Route path="/membership" element={<MembershipPage />} />
        </Route>

        <Route path="/chat/:conversationId" element={
          <AuthGate><ChatPage /></AuthGate>
        } />
        <Route
          path="/sso-callback"
          element={<AuthenticateWithRedirectCallback />}
        />
        <Route element={<AdminGuard><AppShell /></AdminGuard>}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
