interface Option {
  value: string;
  label: string;
}

interface QuestionStepProps {
  question: string;
  type: "single_select" | "multi_select" | "location" | "boolean";
  options?: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function QuestionStep({
  question,
  type,
  options = [],
  value,
  onChange,
}: QuestionStepProps) {
  const selected: string[] =
    type === "multi_select" && value
      ? JSON.parse(value)
      : [];

  const toggleMulti = (opt: string) => {
    const set = new Set(selected);
    if (set.has(opt)) set.delete(opt);
    else set.add(opt);
    onChange(JSON.stringify([...set]));
  };

  return (
    <div>
      <h2
        style={{
          fontSize: "var(--font-xl)",
          fontWeight: 700,
          marginBottom: "var(--space-xl)",
          lineHeight: 1.3,
        }}
      >
        {question}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
        {options.map((opt) => {
          const isSelected =
            type === "multi_select"
              ? selected.includes(opt.value)
              : value === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() =>
                type === "multi_select"
                  ? toggleMulti(opt.value)
                  : onChange(opt.value)
              }
              style={{
                padding: "14px var(--space-md)",
                borderRadius: "var(--radius-md)",
                border: isSelected
                  ? "2px solid var(--color-primary)"
                  : "2px solid var(--color-border)",
                background: isSelected
                  ? "rgba(224, 62, 107, 0.12)"
                  : "var(--color-bg-card)",
                color: isSelected ? "var(--color-primary-light)" : "var(--color-text)",
                fontSize: "var(--font-base)",
                fontWeight: isSelected ? 600 : 400,
                textAlign: "left",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: type === "multi_select" ? "var(--radius-sm)" : "50%",
                  border: isSelected
                    ? "2px solid var(--color-primary)"
                    : "2px solid var(--color-border)",
                  background: isSelected ? "var(--color-primary)" : "transparent",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                }}
              >
                {isSelected && "✓"}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {type === "multi_select" && (
        <p
          style={{
            marginTop: "var(--space-md)",
            fontSize: "var(--font-sm)",
            color: "var(--color-text-muted)",
          }}
        >
          Select all that apply
        </p>
      )}
    </div>
  );
}
