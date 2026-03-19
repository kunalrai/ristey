interface StepIndicatorProps {
  current: number;
  total: number;
}

export default function StepIndicator({ current, total }: StepIndicatorProps) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "var(--space-xs)",
        }}
      >
        <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
          {current + 1} of {total}
        </span>
        <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: "var(--color-border)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--color-primary)",
            borderRadius: "var(--radius-full)",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
