import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppShell() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: "var(--nav-height)",
        }}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
