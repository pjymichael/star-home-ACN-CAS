import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isVerified, name } = useAuth();

  return (
    <div className="landing">
      <div className="landing__bg" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"
          alt=""
        />
        <div className="landing__scrim" />
      </div>

      <header className="landing__top">
        <div className="brand brand--inline">
          <span className="brand__star brand__star--sm">★</span>
          <span className="brand__name brand__name--sm">Star Homes</span>
        </div>
        {!isVerified && (
          <button
            type="button"
            className="link landing__signin"
            onClick={() => navigate("/auth?mode=signin")}
          >
            Sign in
          </button>
        )}
      </header>

      <main className="landing__content">
        <div className="landing__eyebrow">London · Established 1962</div>
        <h1 className="landing__title">
          Find a London<br />you call home.
        </h1>
        <p className="landing__lede">
          Curated residential properties from the city's leading estate agency.
          Rent or buy across thirty branches.
        </p>

        <div className="landing__actions">
          <button
            type="button"
            className="btn btn--primary btn--xl btn--block"
            onClick={() => navigate("/search")}
          >
            Start exploring
          </button>
          {!isVerified ? (
            <Link to="/auth" className="btn btn--outlined-light btn--xl btn--block">
              Create an account
            </Link>
          ) : (
            <div className="landing__welcome">
              Welcome back{name ? `, ${name.split(" ")[0]}` : ""}.
            </div>
          )}
        </div>

        <div className="landing__stats">
          <div className="landing__stat">
            <div className="landing__stat-value">30+</div>
            <div className="landing__stat-label">London branches</div>
          </div>
          <div className="landing__stat">
            <div className="landing__stat-value">12k+</div>
            <div className="landing__stat-label">Active listings</div>
          </div>
          <div className="landing__stat">
            <div className="landing__stat-value">60 yrs</div>
            <div className="landing__stat-label">Of London expertise</div>
          </div>
        </div>
      </main>
    </div>
  );
}
