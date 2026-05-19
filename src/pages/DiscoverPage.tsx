import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PROPERTIES } from "../data/properties";
import { useDiscover } from "../hooks/useDiscover";
import { useBookmarks } from "../hooks/useBookmarks";
import { useAuthGate } from "../components/AuthGateProvider";
import SwipeCard, { type SwipeCardHandle } from "../components/SwipeCard";

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { state, has, like, pass, undo, reset, score } = useDiscover();
  const { toggle: toggleFav, has: hasFav } = useBookmarks();
  const { requireAuth } = useAuthGate();
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimer = useRef<number | null>(null);

  const deck = useMemo(() => {
    const unseen = PROPERTIES.filter((p) => !has(p.id));
    const hasSignal =
      state.likedIds.length + state.passedIds.length > 0;
    if (!hasSignal) {
      // Cold start — round-robin through areas so the first cards feel varied.
      const byArea: Record<string, typeof unseen> = {};
      for (const p of unseen) (byArea[p.area] ??= []).push(p);
      const order: typeof unseen = [];
      let added = true;
      while (added) {
        added = false;
        for (const area of Object.keys(byArea)) {
          const next = byArea[area].shift();
          if (next) {
            order.push(next);
            added = true;
          }
        }
      }
      return order;
    }
    return [...unseen].sort((a, b) => score(b) - score(a));
    // We intentionally don't include `has` and `score` in deps — they would
    // resort the deck on every render and undo card animation continuity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.likedIds.length, state.passedIds.length]);

  const top = deck[0];
  const lastActionId = useRef<string | null>(null);
  const topCardRef = useRef<SwipeCardHandle | null>(null);

  function flash(message: string): void {
    setFeedback(message);
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback(null), 1400);
  }

  // Called by SwipeCard AFTER its fly-off animation completes (whether triggered
  // by drag or by button). Commits the like and updates the taste profile.
  const commitLike = () => {
    if (!top) return;
    lastActionId.current = top.id;
    like(top);
    if (!hasFav(top.id)) toggleFav(top.id);
    flash("Saved to your favourites");
  };

  const commitPass = () => {
    if (!top) return;
    lastActionId.current = top.id;
    pass(top);
  };

  // Button handlers: check auth first, then trigger the card's animation. The
  // animation then calls commitLike/commitPass once it's finished.
  const onLikeButton = () => {
    if (!top) return;
    requireAuth({
      feature: "Sign in to save the homes you love",
      onSuccess: () => topCardRef.current?.swipeRight(),
    });
  };

  const onPassButton = () => {
    if (!top) return;
    topCardRef.current?.swipeLeft();
  };

  const handleUndo = () => {
    const id = lastActionId.current;
    if (!id) return;
    undo(id);
    lastActionId.current = null;
  };

  const handleOpen = () => {
    if (!top) return;
    navigate(`/property/${top.id}`);
  };

  const seenCount = state.likedIds.length + state.passedIds.length;
  const totalCount = PROPERTIES.length;
  const progress = Math.round((seenCount / totalCount) * 100);

  return (
    <div className="page page--discover">
      <header className="discover-header">
        <div>
          <h1>Discover</h1>
          <p className="muted">
            Swipe right on what you love. We'll find more like it.
          </p>
        </div>
        {seenCount > 0 && (
          <button type="button" className="link link--quiet" onClick={reset}>
            Reset
          </button>
        )}
      </header>

      <div className="discover-progress" aria-hidden="true">
        <div className="discover-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="swipe-stage">
        {deck.length === 0 ? (
          <div className="empty empty--big">
            <h3>You've seen everything</h3>
            <p>
              You swiped through every London property in our catalogue.
              Reset to start again, or check your favourites.
            </p>
            <div className="discover-empty-actions">
              <button type="button" className="btn btn--ghost" onClick={reset}>
                Reset deck
              </button>
              <button type="button" className="btn btn--primary" onClick={() => navigate("/bookmarks")}>
                See favourites
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Render in reverse so the topmost card is last in DOM (paints on top) */}
            {deck.slice(0, 3).reverse().map((p, idxFromEnd) => {
              const depth = 2 - idxFromEnd; // 0 = top
              const isTop = depth === 0;
              return (
                <SwipeCard
                  key={p.id}
                  ref={isTop ? topCardRef : null}
                  property={p}
                  matchScore={seenCount >= 3 ? score(p) : undefined}
                  depth={depth}
                  active={isTop}
                  onLike={commitLike}
                  onPass={commitPass}
                  onOpen={handleOpen}
                />
              );
            })}
            {feedback && (
              <div className="swipe-flash" role="status">
                {feedback}
              </div>
            )}
          </>
        )}
      </div>

      {deck.length > 0 && (
        <div className="swipe-controls">
          <button
            type="button"
            className="swipe-btn swipe-btn--pass"
            onClick={onPassButton}
            aria-label="Pass"
          >
            <CrossIcon />
          </button>
          <button
            type="button"
            className="swipe-btn swipe-btn--undo"
            onClick={handleUndo}
            disabled={!lastActionId.current}
            aria-label="Undo last swipe"
          >
            <UndoIcon />
          </button>
          <button
            type="button"
            className="swipe-btn swipe-btn--like"
            onClick={onLikeButton}
            aria-label="Like and save"
          >
            <HeartIcon />
          </button>
        </div>
      )}

      <p className="discover-tip muted">
        Tip · drag the card sideways to swipe, or use the buttons.
      </p>
    </div>
  );
}

function CrossIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
    </svg>
  );
}
