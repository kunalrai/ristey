import { NavLink } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
// api.chat is used for unread badge

const ADMIN_EMAIL = "ikunalrai@gmail.com";

const NAV_ITEMS = [
  { to: "/feed",      label: "Matches",  icon: "💞" },
  { to: "/messages",  label: "Messages", icon: "💬" },
  { to: "/profile",   label: "Profile",  icon: "👤" },
  { to: "/preferences", label: "Prefs", icon: "⚖️" },
];

export default function BottomNav() {
  const user      = useQuery(api.users.getCurrentUser);
  const unread    = useQuery(api.chat.getTotalUnread);
  const isAdmin   = user?.email === ADMIN_EMAIL;

  const items = isAdmin
    ? [...NAV_ITEMS, { to: "/admin", label: "Admin", icon: "🛡️" }]
    : NAV_ITEMS;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "var(--nav-height)",
        background: "var(--color-bg-card)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "8px 16px",
            borderRadius: "var(--radius-md)",
            color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
            fontSize: "var(--font-sm)",
            fontWeight: isActive ? 600 : 400,
            transition: "color 0.2s",
            textDecoration: "none",
            position: "relative",
          })}
        >
          <span style={{ fontSize: 22, position: "relative" }}>
            {item.icon}
            {item.to === "/messages" && (unread ?? 0) > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -6,
                minWidth: 16, height: 16, borderRadius: 8,
                background: "var(--color-primary)",
                color: "#fff", fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 3px",
              }}>
                {(unread ?? 0) > 9 ? "9+" : unread}
              </span>
            )}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
