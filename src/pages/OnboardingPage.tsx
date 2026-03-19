import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import QuestionStep from "../components/ui/QuestionStep";
import StepIndicator from "../components/ui/StepIndicator";

const GENDERS = [
  { value: "male", label: "Man", emoji: "👨" },
  { value: "female", label: "Woman", emoji: "👩" },
  { value: "other", label: "Other", emoji: "🧑" },
];

export default function OnboardingPage() {
  const questions = useQuery(api.questions.getAllQuestions) ?? [];
  const saveAnswers = useMutation(api.profiles.saveProfileAnswers);
  const updateGender = useMutation(api.users.updateGender);
  const navigate = useNavigate();

  const [gender, setGender] = useState("");
  const [genderSaved, setGenderSaved] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Gender picker screen
  if (!genderSaved) {
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
        <h1
          style={{
            fontSize: "var(--font-lg)",
            fontWeight: 800,
            color: "var(--color-primary)",
            marginBottom: "var(--space-sm)",
          }}
        >
          About You
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-xl)" }}>
          I am a…
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", flex: 1 }}>
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGender(g.value)}
              style={{
                padding: "var(--space-lg)",
                borderRadius: "var(--radius-xl)",
                border: `2px solid ${gender === g.value ? "var(--color-primary)" : "var(--color-border)"}`,
                background: gender === g.value ? "rgba(224,62,107,0.1)" : "var(--color-bg-card)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-md)",
                fontSize: "var(--font-md)",
                fontWeight: 600,
                color: gender === g.value ? "var(--color-primary)" : "var(--color-text)",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 32 }}>{g.emoji}</span>
              {g.label}
            </button>
          ))}
        </div>
        <button
          disabled={!gender || saving}
          onClick={async () => {
            setSaving(true);
            await updateGender({ gender });
            setSaving(false);
            setGenderSaved(true);
          }}
          style={{
            marginTop: "var(--space-xl)",
            padding: 16,
            borderRadius: "var(--radius-md)",
            background: gender ? "var(--color-primary)" : "var(--color-bg-elevated)",
            color: gender ? "#fff" : "var(--color-text-subtle)",
            fontSize: "var(--font-base)",
            fontWeight: 700,
            cursor: gender ? "pointer" : "not-allowed",
          }}
        >
          {saving ? "Saving…" : "Continue →"}
        </button>
      </div>
    );
  }

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
        Loading questions…
      </div>
    );
  }

  const current = questions[step];
  const currentValue = answers[current.key] ?? "";
  const isAnswered =
    current.type === "multi_select"
      ? (() => {
          try {
            return (JSON.parse(currentValue) as string[]).length > 0;
          } catch {
            return false;
          }
        })()
      : currentValue !== "";

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
    } else {
      setSaving(true);
      const answerArray = Object.entries(answers).map(([questionKey, value]) => ({
        questionKey,
        value,
      }));
      await saveAnswers({ answers: answerArray, complete: true });
      navigate("/preferences");
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
            marginBottom: "var(--space-md)",
          }}
        >
          About You
        </h1>
        <StepIndicator current={step} total={questions.length} />
      </div>

      <div className="animate-fade-in" key={step} style={{ flex: 1 }}>
        <QuestionStep
          question={current.text}
          type={current.type}
          options={current.options}
          value={currentValue}
          onChange={(val) => setAnswers((prev) => ({ ...prev, [current.key]: val }))}
        />
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
          {saving ? "Saving…" : step < questions.length - 1 ? "Next →" : "Finish →"}
        </button>
      </div>
    </div>
  );
}
