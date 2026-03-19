import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import QuestionStep from "../components/ui/QuestionStep";
import WeightSlider from "../components/ui/WeightSlider";
import StepIndicator from "../components/ui/StepIndicator";

export default function PreferencesPage() {
  const questions = useQuery(api.questions.getAllQuestions) ?? [];
  const existing = useQuery(api.preferences.getPreferenceAnswers) ?? {};
  const savePrefs = useMutation(api.preferences.savePreferenceAnswers);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Record<string, { value: string; weight: number }>>({});
  const [saving, setSaving] = useState(false);

  if (questions.length === 0) {
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

  const current = questions[step];
  const existingMap = existing as Record<string, { value: string; weight: number }>;
  const currentPref = prefs[current.key] ?? {
    value: existingMap[current.key]?.value ?? "",
    weight: existingMap[current.key]?.weight ?? current.defaultWeight,
  };

  const isAnswered =
    current.type === "multi_select"
      ? (() => {
          try {
            return (JSON.parse(currentPref.value) as string[]).length > 0;
          } catch {
            return false;
          }
        })()
      : currentPref.value !== "";

  const setCurrentPref = (partial: Partial<{ value: string; weight: number }>) => {
    setPrefs((prev) => ({ ...prev, [current.key]: { ...currentPref, ...partial } }));
  };

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
    } else {
      setSaving(true);
      const merged = { ...prefs };
      for (const q of questions) {
        if (!merged[q.key]) {
          merged[q.key] = existingMap[q.key] ?? { value: "", weight: q.defaultWeight };
        }
      }
      const prefArray = Object.entries(merged)
        .filter(([, v]) => v.value !== "")
        .map(([questionKey, v]) => ({ questionKey, value: v.value, weight: v.weight }));
      await savePrefs({ prefs: prefArray, complete: true });
      navigate("/feed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "var(--space-xl) var(--space-md)",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h1
          style={{
            fontSize: "var(--font-lg)",
            fontWeight: 800,
            color: "var(--color-primary)",
            marginBottom: "var(--space-sm)",
          }}
        >
          What You're Looking For
        </h1>
        <p
          style={{
            fontSize: "var(--font-sm)",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-md)",
          }}
        >
          Set your preferences and how important each one is.
        </p>
        <StepIndicator current={step} total={questions.length} />
      </div>

      <div className="animate-fade-in" key={step} style={{ flex: 1 }}>
        <QuestionStep
          question={current.text}
          type={current.type}
          options={current.options}
          value={currentPref.value}
          onChange={(val) => setCurrentPref({ value: val })}
        />
        <div style={{ marginTop: "var(--space-lg)" }}>
          <WeightSlider
            weight={currentPref.weight}
            onChange={(w) => setCurrentPref({ weight: w })}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-md)",
          marginTop: "var(--space-xl)",
          paddingBottom: "var(--space-lg)",
        }}
      >
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-card)",
              color: "var(--color-text)",
              fontSize: "var(--font-base)",
              fontWeight: 600,
            }}
          >
            ← Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!isAnswered || saving}
          style={{
            flex: 2,
            padding: 16,
            borderRadius: "var(--radius-md)",
            background: isAnswered ? "var(--color-primary)" : "var(--color-bg-elevated)",
            color: isAnswered ? "#fff" : "var(--color-text-subtle)",
            fontSize: "var(--font-base)",
            fontWeight: 700,
            cursor: isAnswered ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {saving
            ? "Computing matches…"
            : step < questions.length - 1
            ? "Next →"
            : "Find Matches →"}
        </button>
      </div>
    </div>
  );
}
