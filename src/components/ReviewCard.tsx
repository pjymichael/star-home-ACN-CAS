import type { Review } from "../types";
import { reviewTimeAgo } from "../data/reviews";

interface Props {
  review: Review;
}

export default function ReviewCard({ review }: Props) {
  return (
    <article className="review-card">
      <header className="review-card__head">
        <div className="review-card__avatar" aria-hidden="true">
          {review.reviewerName.charAt(0)}
        </div>
        <div className="review-card__id">
          <div className="review-card__name">{review.reviewerName}</div>
          <div className="review-card__meta">
            <span className={`review-card__tag review-card__tag--${review.type}`}>
              {review.type === "buyer" ? "Buyer" : "Seller"}
            </span>
            <span className="review-card__sep" aria-hidden="true">·</span>
            <span className="review-card__date">{reviewTimeAgo(review.daysAgo)}</span>
          </div>
        </div>
        <Stars value={review.rating} />
      </header>
      <p className="review-card__text">{review.text}</p>
    </article>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="review-stars" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < value ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.8 5.7 21l2.3-7.2-6-4.4h7.6z" />
        </svg>
      ))}
    </div>
  );
}
