interface WeightSliderProps {
  weight: number;
  onChange: (w: number) => void;
}

const LABELS = [
  { value: 0, label: "Not important" },
  { value: 5, label: "Somewhat" },
  { value: 10, label: "Must-have" },
];

export default function WeightSlider({ weight, onChange }: WeightSliderProps) {
  const pct = (weight / 10) * 100;
  const color =
    weight === 0
      ? "var(--color-text-subtle)"
      : weight <= 4
      ? "var(--color-warning)"
      : weight <= 7
      ? "var(--color-primary-light)"
      : "var(--color-primary)";

  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-md)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-sm)",
        }}
      >
        <span style={{ fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
          How important is this?
        </span>
        <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, color }}>
          {weight === 0
            ? "Skip"
            : weight <= 3
            ? "Low"
            : weight <= 6
            ? "Medium"
            : weight <= 8
            ? "High"
            : "Essential"}
        </span>
      </div>

      <div style={{ position: "relative" }}>
        <div
          style={{
            height: 4,
            background: "var(--color-border)",
            borderRadius: "var(--radius-full)",
            marginBottom: "var(--space-sm)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: color,
              borderRadius: "var(--radius-full)",
              transition: "width 0.1s, background 0.2s",
            }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={weight}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute",
            top: -8,
            left: 0,
            width: "100%",
            opacity: 0,
            cursor: "pointer",
            height: 20,
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {LABELS.map((l) => (
          <span
            key={l.value}
            style={{
              fontSize: 11,
              color: "var(--color-text-subtle)",
            }}
          >
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
