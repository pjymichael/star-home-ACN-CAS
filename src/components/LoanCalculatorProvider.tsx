import { createContext, useCallback, useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Property } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useAuthGate } from "./AuthGateProvider";
import LoanCalculator from "./LoanCalculator";

interface LoanCalculatorValue {
  /** Open the calculator sheet. Optional property pre-fills loan amount at 40 %. */
  open: (property?: Property | null) => void;
}

const LoanCalculatorContext = createContext<LoanCalculatorValue | null>(null);

export function useLoanCalculator(): LoanCalculatorValue {
  const v = useContext(LoanCalculatorContext);
  if (!v) throw new Error("useLoanCalculator must be used inside LoanCalculatorProvider");
  return v;
}

// Routes where the FAB should never appear
const NO_FAB_ROUTES = new Set(["/", "/auth"]);

export function LoanCalculatorProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isVerified } = useAuth();
  const { requireAuth } = useAuthGate();
  const [open, setOpen] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);

  const openSheet = useCallback(
    (p?: Property | null) => {
      requireAuth({
        feature: "Sign in to use the home loan calculator",
        onSuccess: () => {
          setProperty(p ?? null);
          setOpen(true);
        },
      });
    },
    [requireAuth],
  );

  const close = () => {
    setOpen(false);
    setProperty(null);
  };

  const showFab = !NO_FAB_ROUTES.has(location.pathname);

  return (
    <LoanCalculatorContext.Provider value={{ open: openSheet }}>
      {children}
      {showFab && (
        <div className="calc-fab-anchor" aria-hidden={false}>
          <button
            type="button"
            className="calc-fab"
            aria-label={isVerified ? "Open home loan calculator" : "Sign in to use the home loan calculator"}
            onClick={() => openSheet(null)}
          >
            <CalcIcon />
          </button>
        </div>
      )}
      {open && (
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Home loan calculator">
          <div className="sheet__backdrop" onClick={close} />
          <div className="sheet__panel loan-sheet">
            <header className="loan-sheet__header">
              <div>
                <div className="loan-sheet__title">Home loan calculator</div>
                <div className="loan-sheet__sub">
                  {property ? `Mortgage for ${property.name}` : "Estimate your monthly mortgage"}
                </div>
              </div>
              <button type="button" className="loan-sheet__close" onClick={close} aria-label="Close">
                ×
              </button>
            </header>
            <div className="loan-sheet__body">
              <LoanCalculator
                property={property}
                header={
                  property ? (
                    <div className="loan-context">
                      <div className="loan-context__row">
                        <span>Property price</span>
                        <strong>£{property.price.toLocaleString("en-GB")}</strong>
                      </div>
                      <div className="loan-context__row">
                        <span>Suggested loan (40 %)</span>
                        <strong>£{Math.round(property.price * 0.4).toLocaleString("en-GB")}</strong>
                      </div>
                    </div>
                  ) : undefined
                }
              />
            </div>
          </div>
        </div>
      )}
    </LoanCalculatorContext.Provider>
  );
}

function CalcIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="12" x2="9" y2="12" />
      <line x1="12" y1="12" x2="13" y2="12" />
      <line x1="16" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="9" y2="16" />
      <line x1="12" y1="16" x2="13" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}
