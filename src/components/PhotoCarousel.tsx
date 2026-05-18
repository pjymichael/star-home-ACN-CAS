import { useState } from "react";

interface Props {
  photos: string[];
  alt: string;
}

export default function PhotoCarousel({ photos, alt }: Props) {
  const [index, setIndex] = useState(0);
  if (photos.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  return (
    <div className="carousel">
      <img src={photos[index]} alt={`${alt} — photo ${index + 1}`} className="carousel__img" />
      {photos.length > 1 && (
        <>
          <button type="button" className="carousel__nav carousel__nav--prev" onClick={prev} aria-label="Previous photo">
            ‹
          </button>
          <button type="button" className="carousel__nav carousel__nav--next" onClick={next} aria-label="Next photo">
            ›
          </button>
          <div className="carousel__dots" role="tablist">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show photo ${i + 1}`}
                className={`carousel__dot${i === index ? " is-active" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
