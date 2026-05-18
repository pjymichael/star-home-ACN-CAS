import { useEffect, useRef, useState } from "react";
import type { Agent, Property } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  agent: Agent;
  property: Property;
}

interface Message {
  id: number;
  sender: "bot" | "user" | "agent";
  body: React.ReactNode;
}

interface QuickReply {
  label: string;
  onPick: () => void;
}

let msgId = 0;
const next = () => ++msgId;

const VIEWING_SLOTS = [
  { label: "Tomorrow, 10:00", offsetDays: 1, hour: 10 },
  { label: "Tomorrow, 17:30", offsetDays: 1, hour: 17, minute: 30 },
  { label: "Saturday, 11:00", offsetDays: nextSaturdayOffset(), hour: 11 },
  { label: "Saturday, 14:00", offsetDays: nextSaturdayOffset(), hour: 14 },
];

function nextSaturdayOffset(): number {
  const today = new Date().getDay();
  // Saturday is 6. If today is Saturday, schedule for next Saturday (7 days).
  const delta = (6 - today + 7) % 7;
  return delta === 0 ? 7 : delta;
}

function formatSlot(slot: typeof VIEWING_SLOTS[number]): string {
  const d = new Date();
  d.setDate(d.getDate() + slot.offsetDays);
  d.setHours(slot.hour, slot.minute ?? 0, 0, 0);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessengerSheet({ open, onClose, agent, property }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [typing, setTyping] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [composer, setComposer] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset conversation each time the sheet opens
  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setQuickReplies([]);
    setEscalated(false);
    setComposer("");
    setTimeout(() => greet(), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, property.id]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  function addBot(body: React.ReactNode): void {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: next(), sender: "bot", body }]);
    }, 700);
  }

  function addUser(text: string): void {
    setMessages((m) => [...m, { id: next(), sender: "user", body: text }]);
  }

  function addAgent(text: string): void {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: next(), sender: "agent", body: text }]);
    }, 1100);
  }

  function greet(): void {
    addBot(
      <>
        Hi! I'm <strong>Star Bot</strong>, the Star Homes assistant. I can answer quick questions about{" "}
        <strong>{property.name}</strong> straight away, or hand you over to {agent.name.split(" ")[0]}.
      </>,
    );
    setTimeout(() => offerMain(), 1100);
  }

  function offerMain(): void {
    setQuickReplies([
      { label: "Is it still available?", onPick: askAvailable },
      { label: "Book a viewing", onPick: askViewing },
      { label: "What's included?", onPick: askIncluded },
      { label: "Mortgage / financing", onPick: askMortgage },
      { label: `Speak to ${agent.name.split(" ")[0]}`, onPick: escalate },
    ]);
  }

  function askAvailable(): void {
    addUser("Is this property still available?");
    setQuickReplies([]);
    addBot(
      <>
        Yes — <strong>{property.name}</strong> is still on the market as of today. Would you like to book a
        viewing or ask something else?
      </>,
    );
    setTimeout(() => offerMain(), 1200);
  }

  function askViewing(): void {
    addUser("Book a viewing");
    setQuickReplies([]);
    addBot(
      <>
        I can arrange that. Pick a time below — {agent.name.split(" ")[0]} (or a colleague) will meet you at{" "}
        <strong>{property.address}</strong>.
      </>,
    );
    setTimeout(() => {
      setQuickReplies(
        VIEWING_SLOTS.map((slot) => ({
          label: slot.label,
          onPick: () => confirmViewing(slot),
        })),
      );
    }, 1100);
  }

  function confirmViewing(slot: typeof VIEWING_SLOTS[number]): void {
    const when = formatSlot(slot);
    addUser(`Book ${slot.label}`);
    setQuickReplies([]);
    addBot(
      <>
        Booked! Your viewing is confirmed for <strong>{when}</strong>. You'll get a calendar invite by email and a
        reminder the day before. Anything else?
      </>,
    );
    setTimeout(() => offerMain(), 1300);
  }

  function askIncluded(): void {
    addUser("What's included?");
    setQuickReplies([]);
    if (property.listing === "rent") {
      addBot(
        <>
          For this rental, the monthly price covers building service charge and water. Tenants are responsible for
          council tax, gas, electricity and internet. A 5-week deposit applies.
        </>,
      );
    } else {
      addBot(
        <>
          The sale price is freehold (subject to title check) and includes fitted appliances and bespoke wardrobes
          shown in the photos. Stamp duty and legal fees are payable separately.
        </>,
      );
    }
    setTimeout(() => offerMain(), 1300);
  }

  function askMortgage(): void {
    addUser("Mortgage / financing");
    setQuickReplies([]);
    addBot(
      <>
        Star Homes works with three FCA-regulated mortgage partners. I can connect you with our in-house advisor for
        a free 15-minute call — would that help?
      </>,
    );
    setTimeout(() => {
      setQuickReplies([
        {
          label: "Yes, book a call",
          onPick: () => {
            addUser("Yes, book a call");
            setQuickReplies([]);
            addBot(<>Great — our advisor will call you within the next working day on the number on file.</>);
            setTimeout(() => offerMain(), 1200);
          },
        },
        { label: "Not now", onPick: () => offerMain() },
      ]);
    }, 1100);
  }

  function escalate(): void {
    addUser(`Speak to ${agent.name.split(" ")[0]}`);
    setQuickReplies([]);
    addBot(
      <>
        Connecting you with <strong>{agent.name}</strong> now. They usually reply within an hour — you can also call
        them directly.
      </>,
    );
    setEscalated(true);
    setTimeout(
      () =>
        addAgent(
          `Hi! ${agent.name.split(" ")[0]} here. I'm just stepping into a viewing — happy to help. What would you like to know about ${property.name}?`,
        ),
      1800,
    );
  }

  function sendComposer(e: React.FormEvent): void {
    e.preventDefault();
    const text = composer.trim();
    if (!text) return;
    addUser(text);
    setComposer("");
    if (!escalated) {
      // Bot doesn't really understand free text in this prototype.
      addBot(
        <>
          I can't answer that one directly. Want me to hand you over to {agent.name.split(" ")[0]}?
        </>,
      );
      setTimeout(() => {
        setQuickReplies([
          { label: `Yes, speak to ${agent.name.split(" ")[0]}`, onPick: escalate },
          { label: "Back to main menu", onPick: () => offerMain() },
        ]);
      }, 1100);
    } else {
      // Pretend the agent is responding.
      addAgent("Thanks — let me check on that and come back to you shortly.");
    }
  }

  if (!open) return null;

  return (
    <div className="sheet messenger" role="dialog" aria-modal="true" aria-label={`Message ${agent.name}`}>
      <div className="sheet__backdrop" onClick={onClose} />
      <div className="sheet__panel messenger__panel">
        <header className="messenger__header">
          <img src={agent.photo} alt="" className="messenger__avatar" />
          <div className="messenger__head-text">
            <div className="messenger__name">
              {escalated ? agent.name : "Star Bot"}
            </div>
            <div className="messenger__status">
              {escalated ? `Typing with ${agent.name.split(" ")[0]}` : "Instant answers · powered by AI"}
            </div>
          </div>
          <button type="button" className="messenger__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="messenger__scroll" ref={scrollRef}>
          <div className="messenger__property">
            <img src={property.pictures[0]} alt="" />
            <div>
              <div className="messenger__property-name">{property.name}</div>
              <div className="messenger__property-addr">{property.address}</div>
            </div>
          </div>

          {messages.map((m) => (
            <div key={m.id} className={`bubble bubble--${m.sender}`}>
              {m.sender !== "user" && (
                <div className="bubble__avatar">
                  {m.sender === "agent" ? (
                    <img src={agent.photo} alt="" />
                  ) : (
                    <span className="bubble__bot">★</span>
                  )}
                </div>
              )}
              <div className="bubble__body">{m.body}</div>
            </div>
          ))}

          {typing && (
            <div className="bubble bubble--bot">
              <div className="bubble__avatar">
                <span className="bubble__bot">★</span>
              </div>
              <div className="bubble__body bubble__typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          {quickReplies.length > 0 && (
            <div className="quick-replies">
              {quickReplies.map((r) => (
                <button key={r.label} type="button" className="quick-reply" onClick={r.onPick}>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="messenger__composer" onSubmit={sendComposer}>
          <input
            type="text"
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            placeholder={escalated ? `Message ${agent.name.split(" ")[0]}...` : "Type your message..."}
            aria-label="Message"
          />
          <button type="submit" className="messenger__send" disabled={!composer.trim()} aria-label="Send">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
