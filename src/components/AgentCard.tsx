import { Link } from "react-router-dom";
import type { Agent, Property } from "../types";

interface Props {
  agent: Agent;
  property: Property;
  onMessage: () => void;
}

export default function AgentCard({ agent, property, onMessage }: Props) {
  const subject = encodeURIComponent(`Enquiry: ${property.name}`);
  const body = encodeURIComponent(
    `Hi ${agent.name.split(" ")[0]},\n\nI'm interested in ${property.name} (${property.address}). Could you tell me more?\n\nThanks`,
  );

  return (
    <section className="agent-card">
      <div className="agent-card__head">
        <span className="agent-card__eyebrow">Your Star Homes agent</span>
        <Link to={`/agent/${agent.id}`} className="agent-card__profile">
          <img src={agent.photo} alt={agent.name} className="agent-card__photo" loading="lazy" />
          <div className="agent-card__meta">
            <div className="agent-card__name">{agent.name}</div>
            <div className="agent-card__position">{agent.position}</div>
            <div className="agent-card__stats">
              <span className="agent-card__rating">
                <StarIcon /> {agent.rating.toFixed(1)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{agent.yearsExperience} yrs in {agent.area}</span>
            </div>
          </div>
          <span className="agent-card__chev" aria-hidden="true">›</span>
        </Link>
      </div>

      <div className="agent-card__actions">
        <a
          className="agent-action"
          href={`tel:${agent.phone.replace(/\s/g, "")}`}
          aria-label={`Call ${agent.name}`}
        >
          <PhoneIcon />
          <span>Call</span>
        </a>
        <a
          className="agent-action"
          href={`mailto:${agent.email}?subject=${subject}&body=${body}`}
          aria-label={`Email ${agent.name}`}
        >
          <MailIcon />
          <span>Email</span>
        </a>
        <button
          type="button"
          className="agent-action agent-action--primary"
          onClick={onMessage}
          aria-label={`Message ${agent.name}`}
        >
          <ChatIcon />
          <span>Message</span>
        </button>
      </div>

      <Link to={`/agent/${agent.id}`} className="agent-card__link">
        View full profile →
      </Link>
    </section>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.8 5.7 21l2.3-7.2-6-4.4h7.6z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.92.34 1.83.62 2.7a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.38-1.38a2 2 0 0 1 2.11-.45c.87.28 1.78.49 2.7.62a2 2 0 0 1 1.72 2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 6 10 7 10-7" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
