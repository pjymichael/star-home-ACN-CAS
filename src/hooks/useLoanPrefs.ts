import { useCallback, useSyncExternalStore } from "react";

const KEY = "starhome.loan";

export interface LoanPrefs {
  /** Mortgage term in years (e.g. 25). null when the user hasn't entered a value yet. */
  tenureYears: number | null;
  /** Annual interest rate as a percent (e.g. 5.25). null when the user hasn't entered a value yet. */
  interestRate: number | null;
  /** Most-recent loan amount used outside a property context, in GBP */
  lastLoanAmount: number | null;
}

const DEFAULTS: LoanPrefs = {
  tenureYears: null,
  interestRate: null,
  lastLoanAmount: null,
};

function read(): LoanPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      tenureYears:
        typeof parsed?.tenureYears === "number" && parsed.tenureYears > 0
          ? parsed.tenureYears
          : null,
      interestRate:
        typeof parsed?.interestRate === "number" && parsed.interestRate >= 0
          ? parsed.interestRate
          : null,
      lastLoanAmount:
        typeof parsed?.lastLoanAmount === "number" && parsed.lastLoanAmount > 0
          ? parsed.lastLoanAmount
          : null,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function write(prefs: LoanPrefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota errors
  }
}

let state: LoanPrefs = read();
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function setState(next: LoanPrefs): void {
  state = next;
  write(next);
  notify();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): LoanPrefs {
  return state;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = read();
      notify();
    }
  });
}

/** Cleared by signOut alongside bookmarks/recent/discover. */
export function clearLoanPrefs(): void {
  setState({ ...DEFAULTS });
}

export function useLoanPrefs() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const save = useCallback((next: Partial<LoanPrefs>) => {
    setState({ ...state, ...next });
  }, []);

  return { prefs, save };
}

/**
 * Standard loan amortisation. Returns the fixed monthly payment.
 *
 *   M = P × r(1+r)^n / [(1+r)^n − 1]
 *
 * Where P is principal, r is the monthly rate (annual / 12 / 100),
 * and n is the total number of payments (years × 12).
 */
export function monthlyPayment(principal: number, annualRatePct: number, years: number): number | null {
  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) return null;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}
