const MIN = 60_000;
const HR = 60 * MIN;
const DAY = 24 * HR;

export function timeAgo(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  if (diff < MIN) return "just now";
  if (diff < HR) {
    const m = Math.floor(diff / MIN);
    return `${m} min${m === 1 ? "" : "s"} ago`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HR);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const d = Math.floor(diff / DAY);
  if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
