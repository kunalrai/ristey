interface CompatibilityBarProps {
  score: number;
  size?: "sm" | "lg";
}

export default function CompatibilityBar({ score, size = "sm" }: CompatibilityBarProps) {
  const color =
    score >= 80
      ? "var(--color-success)"
      : score >= 60
      ? "var(--color-primary)"
      : score >= 40
      ? "var(--color-warning)"
      : "var(--color-text-subtle)";

  if (size === "lg") {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: `6px solid ${color}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-sm)",
            background: `${color}18`,
          }}
        >
          <span style={{ fontSize: "var(--font-xl)", fontWeight: 800, color }}>
            {Math.round(score)}
          </span>
          <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>/ 100</span>
        </div>
        <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
          Compatibility
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "var(--color-border)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: color,
            borderRadius: "var(--radius-full)",
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, color, minWidth: 36 }}>
        {Math.round(score)}%
      </span>
    </div>
  );
}
