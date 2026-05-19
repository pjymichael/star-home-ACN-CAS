import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAuthGate } from "./AuthGateProvider";

export default function BottomNav() {
  const navigate = useNavigate();
  const { isVerified } = useAuth();
  const { requireAuth } = useAuthGate();

  const gate = (e: React.MouseEvent, to: string, feature: string) => {
    if (isVerified) return;
    e.preventDefault();
    requireAuth({ feature, onSuccess: () => navigate(to) });
  };

  return (
    <nav className="bottom-nav bottom-nav--4" aria-label="Primary">
      <NavLink to="/search" className="bottom-nav__item">
        <SearchIcon />
        <span>Explore</span>
      </NavLink>
      <NavLink to="/discover" className="bottom-nav__item">
        <SparkleIcon />
        <span>Discover</span>
      </NavLink>
      <NavLink
        to="/recent"
        className="bottom-nav__item"
        onClick={(e) => gate(e, "/recent", "Sign in to keep track of properties you've viewed")}
      >
        <ClockIcon />
        <span>Recent</span>
      </NavLink>
      <NavLink
        to="/bookmarks"
        className="bottom-nav__item"
        onClick={(e) => gate(e, "/bookmarks", "Sign in to save your favourite properties")}
      >
        <HeartIcon />
        <span>Favourites</span>
      </NavLink>
    </nav>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 7l1.6 3.4L17 12l-3.4 1.6L12 17l-1.6-3.4L7 12l3.4-1.6z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
