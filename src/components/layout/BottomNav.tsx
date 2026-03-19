import { NavLink } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const CRIMSON = "#800020";
const GOLD    = "#C5A059";
const STONE   = "#F5F0E6";
const SANS    = "'Inter', system-ui, sans-serif";

const ADMIN_EMAIL = "ikunalrai@gmail.com";

const NAV_ITEMS = [
  {
    to: "/feed",
    label: "CURATED",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l1.09 3.26L16.5 4.5l-2.18 2.63L15.5 11 12 9.27 8.5 11l1.18-3.87L7.5 4.5l3.41.76L12 2z"
          fill={active ? CRIMSON : GOLD} />
        <circle cx="5" cy="5" r="1.2" fill={active ? CRIMSON : GOLD} opacity="0.6" />
        <circle cx="19" cy="5" r="1.2" fill={active ? CRIMSON : GOLD} opacity="0.6" />
        <circle cx="5" cy="19" r="1.2" fill={active ? CRIMSON : GOLD} opacity="0.6" />
        <circle cx="19" cy="19" r="1.2" fill={active ? CRIMSON : GOLD} opacity="0.6" />
        <path d="M5 12l1.5 1.5L9 10" stroke={active ? CRIMSON : GOLD} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        <path d="M15 12l1.5 1.5L19 10" stroke={active ? CRIMSON : GOLD} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    to: "/messages",
    label: "MESSAGES",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          fill="none"
          stroke={active ? CRIMSON : GOLD}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/matches",
    label: "MATCHES",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill={active ? CRIMSON : "none"}
          stroke={active ? CRIMSON : GOLD}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "PROFILE",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="4"
          fill="none"
          stroke={active ? CRIMSON : GOLD}
          strokeWidth="1.8"
        />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          fill="none"
          stroke={active ? CRIMSON : GOLD}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const user      = useQuery(api.users.getCurrentUser);
  const unread    = useQuery(api.chat.getTotalUnread);
  const isAdmin   = user?.email === ADMIN_EMAIL;

  const adminItem = {
    to: "/admin",
    label: "ADMIN",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z"
          fill="none"
          stroke={active ? CRIMSON : GOLD}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  const items = isAdmin ? [...NAV_ITEMS, adminItem] : NAV_ITEMS;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: STONE,
        borderTop: "1px solid rgba(197,160,89,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "var(--nav-height)",
      }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to + item.label}
          to={item.to}
          end={item.to === "/feed"}
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 12px",
            color: isActive ? CRIMSON : GOLD,
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.1em",
            fontFamily: SANS,
            textDecoration: "none",
            position: "relative",
            flex: 1,
          })}
        >
          {({ isActive }) => (
            <>
              <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon(isActive)}
                {item.to === "/messages" && (unread ?? 0) > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -6,
                    minWidth: 15, height: 15, borderRadius: 8,
                    background: CRIMSON,
                    color: "#fff", fontSize: 8, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 3px",
                  }}>
                    {(unread ?? 0) > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
