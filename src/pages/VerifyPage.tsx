import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Step = "phone" | "code";

export default function VerifyPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneValid = /^\+?[0-9 ]{7,}$/.test(phone.trim());

  const submitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) {
      setError("Enter a valid phone number");
      return;
    }
    setError(null);
    setStep("code");
    setTimeout(() => inputs.current[0]?.focus(), 50);
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
    signIn(phone.trim());
    navigate("/search", { replace: true });
  };

  return (
    <div className="page page--verify">
      <div className="brand">
        <div className="brand__star">★</div>
        <div className="brand__name">Star Homes</div>
        <div className="brand__tag">London property, discovered.</div>
      </div>

      {step === "phone" ? (
        <form className="verify-form" onSubmit={submitPhone}>
          <h1>Sign in</h1>
          <p className="muted">We'll text you a 6-digit code to verify your number.</p>
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
          <button type="submit" className="btn btn--primary btn--block" disabled={!phoneValid}>
            Send code
          </button>
          <p className="legal">
            By continuing you agree to our terms. This is a demo — no SMS is actually sent.
          </p>
        </form>
      ) : (
        <form className="verify-form" onSubmit={submitCode}>
          <h1>Enter code</h1>
          <p className="muted">
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
          <button type="submit" className="btn btn--primary btn--block" disabled={digits.join("").length !== 6}>
            Verify and continue
          </button>
          <button type="button" className="link" onClick={() => setStep("phone")}>
            Use a different number
          </button>
        </form>
      )}
    </div>
  );
}
