import type { Agent, Review } from "../types";

const REVIEWER_NAMES: string[] = [
  "Sarah K.",
  "James M.",
  "Olivia R.",
  "Daniel P.",
  "Charlotte H.",
  "Rupert A.",
  "Isabella W.",
  "Marcus B.",
  "Emma S.",
  "Aiden L.",
  "Phoebe G.",
  "Henry T.",
  "Tom F.",
  "Sophie N.",
  "Eleanor V.",
  "Oliver D.",
  "Grace J.",
  "Liam C.",
  "Harper E.",
  "Noah B.",
  "Ava M.",
  "William G.",
  "Mia P.",
  "Lucas K.",
  "Amelia R.",
  "Mason W.",
  "Ella H.",
  "Ethan S.",
  "Lily F.",
  "Jacob N.",
];

const BUYER_TEMPLATES: string[] = [
  "Couldn't have asked for a smoother first-time purchase. {agent} explained every form, every deadline, every quirk of buying in {area}.",
  "We saw eleven properties with {agent} before finding the right one. Never made us feel like we were wasting their time.",
  "Patient, thoughtful, and knew every street in {area}. Made buying feel less daunting.",
  "{agent} negotiated thousands off the asking price. Made our budget stretch further than we thought possible.",
  "Honest valuations, honest opinions. {agent} talked us out of one property which turned out to be exactly the right call.",
  "Closed in six weeks flat. {agent}'s contacts with surveyors and solicitors kept everything moving.",
  "Knew the {area} market inside out. Pointed us at the streets to target and the ones to avoid.",
  "Replied to messages on weekends. Genuinely felt like {agent} was working for us, not the seller.",
  "Our search took eight months and {agent} was as enthusiastic on viewing 40 as on viewing 1.",
  "Was nervous about buying in London as expats. {agent} took the time to walk us through every step.",
];

const SELLER_TEMPLATES: string[] = [
  "Sold our flat in {area} for over asking in three weeks. {agent} priced it perfectly.",
  "Honest valuation — no inflated numbers to win the listing. We trusted {agent} from day one.",
  "Brought us three serious offers within ten days. The advice on staging the flat made a real difference.",
  "{agent} pushed back when our buyer tried to renegotiate at the eleventh hour. We got what we'd agreed.",
  "Professional photography, slick brochure, the whole package. We had viewings booked within 24 hours of going live.",
  "Sold our family home of 22 years. {agent} treated the process with the care it deserved.",
  "Managed the chain better than I thought possible. Three sales, all completed on the same day.",
  "Re-listed with {agent} after another agency failed to sell in six months. Done in five weeks.",
  "Sold above guide price during a slow market. {agent} found the right buyer rather than just any buyer.",
  "Followed up with us a month after completion to make sure we were settled. Service beyond the sale.",
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildReview(agent: Agent, seed: number, idx: number): Review {
  // 65 % buyers, 35 % sellers — close to the rough split most agencies see
  const isBuyer = ((seed + idx * 5) % 100) < 65;
  const templates = isBuyer ? BUYER_TEMPLATES : SELLER_TEMPLATES;
  const nameIdx = (seed + idx * 17) % REVIEWER_NAMES.length;
  const templateIdx = (seed + idx * 11) % templates.length;
  const raw = templates[templateIdx];
  const text = raw.replace("{agent}", agent.name.split(" ")[0]).replace("{area}", agent.area);
  // ~85% five-star, rest four-star. Matches the headline ratings we already have (4.75–4.95).
  const rating = ((seed + idx * 7) % 100) < 85 ? 5 : 4;
  // Spread reviews across the past 11 months
  const daysAgo = 4 + idx * 41 + ((seed >> idx) % 9);
  return {
    id: `${agent.id}-r${idx}`,
    reviewerName: REVIEWER_NAMES[nameIdx],
    type: isBuyer ? "buyer" : "seller",
    rating,
    daysAgo,
    text,
  };
}

export function reviewsFor(agent: Agent, count = 8): Review[] {
  const seed = hash(agent.id);
  return Array.from({ length: count }, (_, i) => buildReview(agent, seed, i));
}

export function reviewTimeAgo(daysAgo: number): string {
  if (daysAgo < 1) return "today";
  if (daysAgo < 7) return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
  if (daysAgo < 30) {
    const w = Math.floor(daysAgo / 7);
    return `${w} week${w === 1 ? "" : "s"} ago`;
  }
  if (daysAgo < 365) {
    const m = Math.floor(daysAgo / 30);
    return `${m} month${m === 1 ? "" : "s"} ago`;
  }
  const y = Math.floor(daysAgo / 365);
  return `${y} year${y === 1 ? "" : "s"} ago`;
}
