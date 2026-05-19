import { useNavigate, useSearchParams } from "react-router-dom";
import AuthForm from "../components/AuthForm";

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signin" ? "signin" : "signup";
  const returnTo = params.get("return") ?? "/search";

  return (
    <div className="page page--auth">
      <header className="auth-page__top">
        <button
          type="button"
          className="back"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          ‹
        </button>
        <div className="brand brand--inline">
          <span className="brand__star brand__star--sm">★</span>
          <span className="brand__name brand__name--sm">Star Homes</span>
        </div>
        <div style={{ width: 36 }} />
      </header>

      <div className="auth-page__inner">
        <AuthForm
          variant="page"
          initialMode={initialMode}
          onSuccess={() => navigate(returnTo, { replace: true })}
        />
      </div>
    </div>
  );
}
