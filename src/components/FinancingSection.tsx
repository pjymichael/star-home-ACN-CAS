import type { Property } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useLoanPrefs, monthlyPayment } from "../hooks/useLoanPrefs";
import { useLoanCalculator } from "./LoanCalculatorProvider";

interface Props {
  property: Property;
}

const gbpDp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export default function FinancingSection({ property }: Props) {
  // Mortgages only make sense for buy listings.
  if (property.listing !== "buy") return null;

  return <FinancingBody property={property} />;
}

function FinancingBody({ property }: Props) {
  const { isVerified } = useAuth();
  const { prefs } = useLoanPrefs();
  const { open } = useLoanCalculator();

  const suggestedLoan = Math.round(property.price * 0.4);
  const hasPrefs = prefs.tenureYears != null && prefs.interestRate != null;
  const monthly = hasPrefs
    ? monthlyPayment(suggestedLoan, prefs.interestRate!, prefs.tenureYears!)
    : null;

  return (
    <section className="detail-section financing-section">
      <h2>Financing</h2>

      {!isVerified ? (
        <>
          <p className="muted">
            See your estimated monthly mortgage for this property. Sign in to use the calculator.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => open(property)}
          >
            Sign in to calculate
          </button>
        </>
      ) : hasPrefs && monthly != null ? (
        <>
          <div className="financing-summary">
            <div className="financing-summary__monthly">
              {gbpDp.format(monthly)}
              <span className="financing-summary__unit"> / month</span>
            </div>
            <div className="muted">
              Based on a {gbpDp.format(suggestedLoan)} loan (40 % of listed price) over {prefs.tenureYears} years at {prefs.interestRate}% / yr
            </div>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => open(property)}
          >
            Adjust calculation →
          </button>
        </>
      ) : (
        <>
          <div className="financing-summary">
            <div className="muted">
              Suggested loan amount: <strong>{gbpDp.format(suggestedLoan)}</strong> (40 % of listed price).
              Enter your tenure and interest rate to see your estimated monthly payment.
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => open(property)}
          >
            Calculate monthly payment →
          </button>
        </>
      )}

      <p className="legal financing-section__legal">
        Indicative only. Not a mortgage offer or financial advice.
      </p>
    </section>
  );
}
