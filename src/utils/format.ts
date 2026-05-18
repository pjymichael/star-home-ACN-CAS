import type { Listing } from "../types";

const compact = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const fullGbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function formatPrice(price: number, listing: Listing): string {
  if (listing === "rent") {
    return `${fullGbp.format(price)} pcm`;
  }
  return fullGbp.format(price);
}

export function formatPriceShort(price: number, listing: Listing): string {
  if (listing === "rent") {
    return `£${compact.format(price)} pcm`;
  }
  return `£${compact.format(price)}`;
}
