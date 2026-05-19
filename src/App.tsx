import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { AuthGateProvider } from "./components/AuthGateProvider";
import BottomNav from "./components/BottomNav";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import SearchPage from "./pages/SearchPage";
import ResultsPage from "./pages/ResultsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import BookmarksPage from "./pages/BookmarksPage";
import RecentlyViewedPage from "./pages/RecentlyViewedPage";
import ComparePage from "./pages/ComparePage";
import AgentDetailPage from "./pages/AgentDetailPage";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isVerified } = useAuth();
  const location = useLocation();
  if (!isVerified) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?return=${returnTo}`} replace />;
  }
  return children;
}

// Routes where the bottom nav should NOT show
const NO_NAV_ROUTES = new Set(["/", "/auth"]);

export default function App() {
  const location = useLocation();
  const showNav = !NO_NAV_ROUTES.has(location.pathname);

  return (
    <AuthGateProvider>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/agent/:id" element={<AgentDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route
            path="/bookmarks"
            element={
              <RequireAuth>
                <BookmarksPage />
              </RequireAuth>
            }
          />
          <Route
            path="/recent"
            element={
              <RequireAuth>
                <RecentlyViewedPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {showNav && <BottomNav />}
      </div>
    </AuthGateProvider>
  );
}
