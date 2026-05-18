import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import BottomNav from "./components/BottomNav";
import VerifyPage from "./pages/VerifyPage";
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
    return <Navigate to="/verify" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export default function App() {
  const { isVerified } = useAuth();
  const location = useLocation();
  const showNav = isVerified && location.pathname !== "/verify";

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/verify" element={<VerifyPage />} />
        <Route
          path="/search"
          element={
            <RequireAuth>
              <SearchPage />
            </RequireAuth>
          }
        />
        <Route
          path="/results"
          element={
            <RequireAuth>
              <ResultsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/property/:id"
          element={
            <RequireAuth>
              <PropertyDetailPage />
            </RequireAuth>
          }
        />
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
        <Route
          path="/compare"
          element={
            <RequireAuth>
              <ComparePage />
            </RequireAuth>
          }
        />
        <Route
          path="/agent/:id"
          element={
            <RequireAuth>
              <AgentDetailPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to={isVerified ? "/search" : "/verify"} replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  );
}
