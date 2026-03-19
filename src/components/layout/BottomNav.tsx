import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/feed", label: "Matches", icon: "💞" },
  { to: "/profile", label: "Profile", icon: "👤" },
  { to: "/preferences", label: "Preferences", icon: "⚖️" },
];

export default function BottomNav() {
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
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "8px 20px",
            borderRadius: "var(--radius-md)",
            color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
            fontSize: "var(--font-sm)",
            fontWeight: isActive ? 600 : 400,
            transition: "color 0.2s",
            textDecoration: "none",
          })}
        >
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
