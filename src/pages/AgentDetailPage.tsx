import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { findAgent } from "../data/agents";
import { PROPERTIES } from "../data/properties";
import { reviewsFor } from "../data/reviews";
import MiniPropertyCard from "../components/MiniPropertyCard";
import MessengerSheet from "../components/MessengerSheet";
import ReviewCard from "../components/ReviewCard";
import { useAuthGate } from "../components/AuthGateProvider";

export default function AgentDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const agent = findAgent(id);
  const [chatOpen, setChatOpen] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const { requireAuth } = useAuthGate();

  const reviews = useMemo(() => (agent ? reviewsFor(agent, 8) : []), [agent]);

  const openMessenger = () =>
    requireAuth({
      feature: "Sign in to message the agent — we verify everyone so they know they're talking to a real person.",
      onSuccess: () => setChatOpen(true),
    });

  if (!agent) {
    return (
      <div className="page">
        <div className="empty empty--big">
          <h3>Agent not found</h3>
          <button type="button" className="btn btn--primary" onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  const listings = PROPERTIES.filter((p) => p.area === agent.area);
  // Use the agent's first listing as the property context for the messenger.
  const contextProperty = listings[0];

  return (
    <div className="page page--agent">
      <button type="button" className="back back--floating" onClick={() => navigate(-1)} aria-label="Back">
        ‹
      </button>

      <div className="agent-hero">
        <img src={agent.photo} alt={agent.name} className="agent-hero__photo" />
        <div className="agent-hero__name">{agent.name}</div>
        <div className="agent-hero__position">{agent.position}</div>
        <div className="agent-hero__area">Star Homes · {agent.area} branch</div>
        <div className="agent-hero__stats">
          <span>★ {agent.rating.toFixed(1)} ({agent.reviewCount} reviews)</span>
          <span aria-hidden="true">·</span>
          <span>{agent.yearsExperience} years</span>
        </div>
      </div>

      <div className="agent-detail-actions">
        <a className="btn btn--ghost" href={`tel:${agent.phone.replace(/\s/g, "")}`}>
          Call
        </a>
        <a className="btn btn--ghost" href={`mailto:${agent.email}`}>
          Email
        </a>
        <button type="button" className="btn btn--primary" onClick={openMessenger}>
          Message
        </button>
      </div>

      <section className="detail-section">
        <h2>About</h2>
        <p>{agent.bio}</p>
      </section>

      <section className="detail-section">
        <h2>Specialties</h2>
        <div className="chips chips--static">
          {agent.specialties.map((s) => (
            <span key={s} className="chip chip--static">{s}</span>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h2>Languages</h2>
        <p className="muted">{agent.languages.join(" · ")}</p>
      </section>

      <section className="detail-section">
        <h2>Contact</h2>
        <ul className="agent-contact-list">
          <li>
            <span>Phone</span>
            <a href={`tel:${agent.phone.replace(/\s/g, "")}`}>{agent.phone}</a>
          </li>
          <li>
            <span>Email</span>
            <a href={`mailto:${agent.email}`}>{agent.email}</a>
          </li>
          <li>
            <span>Office</span>
            <span>Star Homes {agent.area}</span>
          </li>
        </ul>
      </section>

      <section className="detail-section reviews-section">
        <div className="reviews-section__head">
          <h2>Reviews</h2>
          <div className="reviews-section__summary">
            <span className="reviews-section__rating">
              <StarFilled /> {agent.rating.toFixed(1)}
            </span>
            <span className="muted">· {agent.reviewCount} total</span>
          </div>
        </div>
        <div className="reviews-list">
          {(reviewsExpanded ? reviews : reviews.slice(0, 4)).map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
        {reviews.length > 4 && (
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => setReviewsExpanded((v) => !v)}
          >
            {reviewsExpanded
              ? "Show fewer reviews"
              : `View ${reviews.length - 4} more review${reviews.length - 4 === 1 ? "" : "s"}`}
          </button>
        )}
      </section>

      {listings.length > 0 && (
        <section className="similar-properties">
          <div className="similar-properties__head">
            <h2>{agent.name.split(" ")[0]}'s listings in {agent.area}</h2>
          </div>
          <div className="similar-properties__list">
            {listings.map((p) => (
              <MiniPropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}

      {contextProperty && (
        <MessengerSheet
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          agent={agent}
          property={contextProperty}
        />
      )}
    </div>
  );
}

function StarFilled() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.8 5.7 21l2.3-7.2-6-4.4h7.6z" />
    </svg>
  );
}
