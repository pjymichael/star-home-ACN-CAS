import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import AuthForm from "./AuthForm";

interface RequireOpts {
  /** Short context explaining what they're being asked to sign in for. */
  feature?: string;
  /** Optional callback run after a successful sign-in / sign-up. */
  onSuccess?: () => void;
}

interface AuthGateValue {
  /** Run `onSuccess` immediately if the user is already verified; otherwise open the auth sheet. */
  requireAuth: (opts?: RequireOpts) => void;
}

const AuthGateContext = createContext<AuthGateValue | null>(null);

export function useAuthGate(): AuthGateValue {
  const v = useContext(AuthGateContext);
  if (!v) throw new Error("useAuthGate must be used inside AuthGateProvider");
  return v;
}

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const { isVerified } = useAuth();
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<string | undefined>(undefined);
  const pendingCallback = useRef<(() => void) | null>(null);

  const requireAuth = useCallback(
    (opts?: RequireOpts) => {
      if (isVerified) {
        opts?.onSuccess?.();
        return;
      }
      pendingCallback.current = opts?.onSuccess ?? null;
      setFeature(opts?.feature);
      setOpen(true);
    },
    [isVerified],
  );

  const close = () => {
    setOpen(false);
    pendingCallback.current = null;
  };

  const onSuccess = () => {
    const cb = pendingCallback.current;
    setOpen(false);
    pendingCallback.current = null;
    // Defer so the modal can close before the action fires
    if (cb) setTimeout(cb, 0);
  };

  return (
    <AuthGateContext.Provider value={{ requireAuth }}>
      {children}
      {open && (
        <div className="sheet auth-sheet" role="dialog" aria-modal="true" aria-label="Sign in">
          <div className="sheet__backdrop" onClick={close} />
          <div className="sheet__panel auth-sheet__panel">
            <header className="auth-sheet__header">
              <div>
                <div className="auth-sheet__title">Sign in or create an account</div>
                {feature && <div className="auth-sheet__feature">{feature}</div>}
              </div>
              <button type="button" className="auth-sheet__close" onClick={close} aria-label="Close">
                ×
              </button>
            </header>
            <AuthForm
              variant="sheet"
              initialMode="signup"
              reason={feature}
              onSuccess={onSuccess}
            />
          </div>
        </div>
      )}
    </AuthGateContext.Provider>
  );
}
