import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";

type Mode = "signin" | "signup";
type Step = "details" | "code";

interface Props {
  /** Optional initial tab — defaults to signup which is the more common new-user path. */
  initialMode?: Mode;
  /** Called when the user completes auth successfully. */
  onSuccess?: () => void;
  /** Optional reason shown above the form, e.g. "Sign in to save favourites". */
  reason?: string;
  /** Render variant — "page" centres on the whole screen, "sheet" is for a modal. */
  variant?: "page" | "sheet";
}

export default function AuthForm({ initialMode = "signup", onSuccess, reason, variant = "page" }: Props) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset to details step when switching tabs
  useEffect(() => {
    setStep("details");
    setDigits(["", "", "", "", "", ""]);
    setError(null);
  }, [mode]);

  const phoneValid = /^\+?[0-9 ]{7,}$/.test(phone.trim());
  const nameValid = name.trim().length >= 2;
  const detailsValid = mode === "signin" ? phoneValid : phoneValid && nameValid;

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailsValid) {
      setError(mode === "signup" && !nameValid ? "Enter your name" : "Enter a valid phone number");
      return;
    }
    setError(null);
    setStep("code");
    setTimeout(() => inputs.current[0]?.focus(), 60);
  };

  const updateDigit = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, "").slice(0, 1);
    setDigits((d) => {
      const next = [...d];
      next[i] = v;
      return next;
    });
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 0) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    inputs.current[Math.min(text.length, 5)]?.focus();
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter all 6 digits");
      return;
    }
    setError(null);
    signIn(phone.trim(), mode === "signup" ? name.trim() : "");
    onSuccess?.();
  };

  return (
    <div className={`auth-form auth-form--${variant}`}>
      {reason && <div className="auth-form__reason">{reason}</div>}

      <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          className={`auth-tab${mode === "signin" ? " is-active" : ""}`}
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={`auth-tab${mode === "signup" ? " is-active" : ""}`}
          onClick={() => setMode("signup")}
        >
          Create account
        </button>
      </div>

      {step === "details" ? (
        <form onSubmit={submitDetails} className="auth-form__body">
          <h2 className="auth-form__title">
            {mode === "signin" ? "Welcome back" : "Join Star Homes"}
          </h2>
          <p className="auth-form__subtitle">
            {mode === "signin"
              ? "Enter your number and we'll text you a 6-digit code."
              : "Two quick details and we'll verify your number."}
          </p>

          {mode === "signup" && (
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}

          <label className="field">
            <span>Mobile number</span>
            <input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+44 7700 900000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={error ? true : undefined}
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn--primary btn--block" disabled={!detailsValid}>
            Send code
          </button>

          <p className="legal">
            {mode === "signup" ? "By creating an account" : "By signing in"} you agree to our terms.
            This is a demo — no SMS is actually sent.
          </p>
        </form>
      ) : (
        <form onSubmit={submitCode} className="auth-form__body">
          <h2 className="auth-form__title">Enter code</h2>
          <p className="auth-form__subtitle">
            We sent a code to <strong>{phone}</strong>. Any 6 digits will work in this demo.
          </p>

          <div className="otp" onPaste={onPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={d}
                onChange={(e) => updateDigit(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {error && <div className="error">{error}</div>}

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={digits.join("").length !== 6}
          >
            {mode === "signup" ? "Verify and create account" : "Verify and sign in"}
          </button>

          <button type="button" className="link" onClick={() => setStep("details")}>
            Use a different number
          </button>
        </form>
      )}
    </div>
  );
}
