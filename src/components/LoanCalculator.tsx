import { useEffect, useMemo, useState } from "react";
import type { Property } from "../types";
import { monthlyPayment, useLoanPrefs } from "../hooks/useLoanPrefs";

interface Props {
  /** When supplied, the loan amount field pre-fills as 40 % of the property price. */
  property?: Property | null;
  /** Header/context note shown at the top of the calculator. */
  header?: React.ReactNode;
}

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const gbpDp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

export default function LoanCalculator({ property, header }: Props) {
  const { prefs, save } = useLoanPrefs();

  const initialLoanAmount = useMemo(() => {
    if (property) return Math.round(property.price * 0.4);
    return prefs.lastLoanAmount ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.id]);

  const [loanAmount, setLoanAmount] = useState<string>(
    initialLoanAmount > 0 ? String(initialLoanAmount) : "",
  );
  const [tenure, setTenure] = useState<string>(
    prefs.tenureYears != null ? String(prefs.tenureYears) : "",
  );
  const [rate, setRate] = useState<string>(
    prefs.interestRate != null ? String(prefs.interestRate) : "",
  );

  // If the property changes (user opens calculator from a different listing), refill.
  useEffect(() => {
    if (property) {
      setLoanAmount(String(Math.round(property.price * 0.4)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.id]);

  const P = parseFloat(loanAmount);
  const t = parseFloat(tenure);
  const r = parseFloat(rate);
  const monthly = monthlyPayment(P, r, t);
  const totalRepayment = monthly != null ? monthly * t * 12 : null;
  const totalInterest = monthly != null ? totalRepayment! - P : null;
  const principalPct = totalRepayment ? Math.max(2, Math.min(98, (P / totalRepayment) * 100)) : 50;

  // Persist preferences whenever the user enters valid values.
  useEffect(() => {
    const tNum = parseFloat(tenure);
    const rNum = parseFloat(rate);
    const lNum = parseFloat(loanAmount);
    if (Number.isFinite(tNum) && tNum > 0 && tNum !== prefs.tenureYears) {
      save({ tenureYears: tNum });
    }
    if (Number.isFinite(rNum) && rNum >= 0 && rNum !== prefs.interestRate) {
      save({ interestRate: rNum });
    }
    if (!property && Number.isFinite(lNum) && lNum > 0 && lNum !== prefs.lastLoanAmount) {
      save({ lastLoanAmount: lNum });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenure, rate, loanAmount]);

  return (
    <div className="loan-calc">
      {header}

      <div className="loan-calc__fields">
        <label className="loan-field">
          <span className="loan-field__label">Loan amount</span>
          <div className="loan-field__input">
            <span className="loan-field__affix">£</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              placeholder="0"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
          </div>
        </label>

        <label className="loan-field">
          <span className="loan-field__label">Loan tenure</span>
          <div className="loan-field__input">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={40}
              step={1}
              placeholder="e.g. 25"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
            />
            <span className="loan-field__suffix">years</span>
          </div>
        </label>

        <label className="loan-field">
          <span className="loan-field__label">Net yearly interest rate</span>
          <div className="loan-field__input">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={20}
              step={0.05}
              placeholder="e.g. 5.25"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <span className="loan-field__suffix">% / yr</span>
          </div>
        </label>
      </div>

      <div className="loan-result">
        <div className="loan-result__label">Estimated monthly instalment</div>
        <div className="loan-result__value">
          {monthly != null ? gbpDp.format(monthly) : "—"}
          {monthly != null && <span className="loan-result__unit"> / month</span>}
        </div>

        {monthly != null && totalRepayment != null && totalInterest != null && (
          <>
            <div className="loan-breakdown" aria-hidden="true">
              <div className="loan-breakdown__segment loan-breakdown__principal" style={{ width: `${principalPct}%` }} />
              <div className="loan-breakdown__segment loan-breakdown__interest" style={{ width: `${100 - principalPct}%` }} />
            </div>
            <div className="loan-stats">
              <div className="loan-stat">
                <span className="loan-stat__swatch loan-stat__swatch--principal" aria-hidden="true" />
                <div>
                  <div className="loan-stat__label">Principal</div>
                  <div className="loan-stat__value">{gbp.format(P)}</div>
                </div>
              </div>
              <div className="loan-stat">
                <span className="loan-stat__swatch loan-stat__swatch--interest" aria-hidden="true" />
                <div>
                  <div className="loan-stat__label">Total interest</div>
                  <div className="loan-stat__value">{gbp.format(totalInterest)}</div>
                </div>
              </div>
              <div className="loan-stat">
                <div>
                  <div className="loan-stat__label">Total repayment</div>
                  <div className="loan-stat__value">{gbp.format(totalRepayment)}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {monthly == null && (
          <p className="muted loan-result__hint">
            Enter a loan amount, tenure, and interest rate to see your estimate.
          </p>
        )}
      </div>

      <p className="legal loan-calc__legal">
        Indicative only. Not a mortgage offer or financial advice.
      </p>
    </div>
  );
}
