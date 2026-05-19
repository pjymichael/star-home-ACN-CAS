import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { Property } from "../types";
import { formatPrice } from "../utils/format";

export interface SwipeCardHandle {
  /** Programmatically animate the card off to the right (like). */
  swipeRight: () => void;
  /** Programmatically animate the card off to the left (pass). */
  swipeLeft: () => void;
}

interface Props {
  property: Property;
  matchScore?: number;
  onLike: () => void;
  onPass: () => void;
  onOpen: () => void;
  /** Stacking depth (0 = top of stack). Affects visual scale + offset. */
  depth: number;
  /** Top card is interactive — back-of-stack cards are decorative only. */
  active: boolean;
  /** Optional gatekeeper for a drag-right release. Return false to cancel
   *  the release (the card snaps back to centre). The handler can also kick
   *  off a side-effect like opening an auth modal. */
  onBeforeLike?: () => boolean;
}

const SWIPE_THRESHOLD = 110; // px
const RELEASE_MS = 320;

const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard(
  { property, matchScore, onLike, onPass, onOpen, depth, active, onBeforeLike },
  ref,
) {
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [released, setReleased] = useState<"like" | "pass" | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  const release = (dir: "like" | "pass") => {
    if (released) return;
    setReleased(dir);
    window.setTimeout(() => {
      if (dir === "like") onLike();
      else onPass();
    }, RELEASE_MS - 40);
  };

  useImperativeHandle(ref, () => ({
    swipeRight: () => release("like"),
    swipeLeft: () => release("pass"),
  }));

  const onPointerDown = (e: React.PointerEvent) => {
    if (!active || released) return;
    start.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current || released) return;
    const nx = e.clientX - start.current.x;
    const ny = e.clientY - start.current.y;
    if (Math.abs(nx) > 4 || Math.abs(ny) > 4) moved.current = true;
    setDx(nx);
    setDy(ny);
  };

  const finish = () => {
    start.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      const dir = dx > 0 ? "like" : "pass";
      if (dir === "like" && onBeforeLike && onBeforeLike() === false) {
        // Gatekeeper rejected the release — snap back to centre.
        setDx(0);
        setDy(0);
        return;
      }
      release(dir);
    } else {
      setDx(0);
      setDy(0);
    }
  };

  const onClick = () => {
    if (!moved.current && !released) onOpen();
  };

  const rotation = dx / 18;
  const likeOpacity = released === "like" ? 1 : Math.max(0, Math.min(1, dx / SWIPE_THRESHOLD));
  const passOpacity = released === "pass" ? 1 : Math.max(0, Math.min(1, -dx / SWIPE_THRESHOLD));

  let transform: string;
  if (released === "like") {
    transform = "translate(140%, -20%) rotate(28deg)";
  } else if (released === "pass") {
    transform = "translate(-140%, -20%) rotate(-28deg)";
  } else {
    const stackScale = 1 - depth * 0.04;
    const stackY = depth * 12;
    transform = `translate(${dx}px, ${dy + stackY}px) rotate(${rotation}deg) scale(${stackScale})`;
  }

  return (
    <div
      className="swipe-card"
      style={{
        transform,
        zIndex: 10 - depth,
        transition: start.current && !released ? "none" : `transform ${RELEASE_MS}ms cubic-bezier(.2,.8,.2,1)`,
        pointerEvents: active && !released ? "auto" : "none",
        opacity: depth > 2 ? 0 : 1,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
      onClick={onClick}
    >
      <div className="swipe-card__media">
        <img src={property.pictures[0]} alt={property.name} draggable={false} />
        <div className="swipe-card__gradient" aria-hidden="true" />

        {typeof matchScore === "number" && (
          <div className="swipe-card__match" aria-label={`Match score ${Math.round(matchScore * 100)} percent`}>
            {Math.round(matchScore * 100)}% match
          </div>
        )}

        <span className={`pill pill--${property.listing} swipe-card__pill`}>
          {property.listing === "rent" ? "Rent" : "For sale"}
        </span>

        <div className="swipe-card__stamp swipe-card__stamp--like" style={{ opacity: likeOpacity }}>
          LIKE
        </div>
        <div className="swipe-card__stamp swipe-card__stamp--pass" style={{ opacity: passOpacity }}>
          PASS
        </div>

        <div className="swipe-card__overlay">
          <div className="swipe-card__price">{formatPrice(property.price, property.listing)}</div>
          <div className="swipe-card__name">{property.name}</div>
          <div className="swipe-card__meta">
            <span>{property.bedrooms === 0 ? "Studio" : `${property.bedrooms} bed`}</span>
            <span aria-hidden="true">·</span>
            <span>{property.size} sqm</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{property.type}</span>
          </div>
          <div className="swipe-card__area">{property.area} — {property.address}</div>
        </div>
      </div>
    </div>
  );
});

export default SwipeCard;
