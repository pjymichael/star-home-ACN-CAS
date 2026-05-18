import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  photos: string[];
  alt: string;
  to: string;
}

export default function CardCarousel({ photos, alt, to }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = track.clientWidth;
        if (w > 0) setIndex(Math.round(track.scrollLeft / w));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="card-carousel">
      <div className="card-carousel__track" ref={trackRef}>
        {photos.map((src, i) => (
          <Link key={i} to={to} className="card-carousel__slide" tabIndex={i === 0 ? 0 : -1} aria-hidden={i === index ? undefined : true}>
            <img
              src={src}
              alt={i === 0 ? alt : ""}
              loading="lazy"
              draggable={false}
            />
          </Link>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="card-carousel__dots" aria-hidden="true">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`card-carousel__dot${i === index ? " is-active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
