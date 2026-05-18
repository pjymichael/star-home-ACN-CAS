import type { Property, PropertyType } from "../types";
import { photosFor } from "./photos";

/**
 * SVG floorplan as a data URI. Keeps the prototype fully self-contained.
 * `rooms` are normalised rectangles inside a 0–1 coordinate space.
 */
function floorplanSvg(
  rooms: { x: number; y: number; w: number; h: number; label: string }[],
): string {
  const W = 600;
  const H = 400;
  const body = rooms
    .map((r) => {
      const x = r.x * W;
      const y = r.y * H;
      const w = r.w * W;
      const h = r.h * H;
      const cx = x + w / 2;
      const cy = y + h / 2;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#0A1F44" stroke-width="3"/><text x="${cx}" y="${cy}" font-family="system-ui,sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="#0A1F44">${r.label}</text>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#F0EBE1"/>${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const FP_STUDIO = floorplanSvg([
  { x: 0.05, y: 0.05, w: 0.55, h: 0.6, label: "Living / Bed" },
  { x: 0.05, y: 0.68, w: 0.3, h: 0.27, label: "Bath" },
  { x: 0.38, y: 0.68, w: 0.27, h: 0.27, label: "Kitchen" },
  { x: 0.62, y: 0.05, w: 0.33, h: 0.9, label: "Balcony" },
]);

const FP_1BED = floorplanSvg([
  { x: 0.05, y: 0.05, w: 0.45, h: 0.45, label: "Living" },
  { x: 0.52, y: 0.05, w: 0.43, h: 0.45, label: "Kitchen" },
  { x: 0.05, y: 0.52, w: 0.55, h: 0.43, label: "Bedroom" },
  { x: 0.62, y: 0.52, w: 0.33, h: 0.43, label: "Bath" },
]);

const FP_2BED = floorplanSvg([
  { x: 0.05, y: 0.05, w: 0.55, h: 0.45, label: "Living / Dining" },
  { x: 0.62, y: 0.05, w: 0.33, h: 0.45, label: "Kitchen" },
  { x: 0.05, y: 0.52, w: 0.3, h: 0.43, label: "Bed 1" },
  { x: 0.37, y: 0.52, w: 0.3, h: 0.43, label: "Bed 2" },
  { x: 0.69, y: 0.52, w: 0.26, h: 0.43, label: "Bath" },
]);

const FP_3BED = floorplanSvg([
  { x: 0.05, y: 0.05, w: 0.55, h: 0.4, label: "Living / Dining" },
  { x: 0.62, y: 0.05, w: 0.33, h: 0.4, label: "Kitchen" },
  { x: 0.05, y: 0.47, w: 0.28, h: 0.48, label: "Master" },
  { x: 0.35, y: 0.47, w: 0.28, h: 0.48, label: "Bed 2" },
  { x: 0.65, y: 0.47, w: 0.3, h: 0.23, label: "Bed 3" },
  { x: 0.65, y: 0.72, w: 0.3, h: 0.23, label: "Bath" },
]);

const FP_HOUSE = floorplanSvg([
  { x: 0.05, y: 0.05, w: 0.42, h: 0.4, label: "Living" },
  { x: 0.5, y: 0.05, w: 0.45, h: 0.4, label: "Dining / Kitchen" },
  { x: 0.05, y: 0.48, w: 0.28, h: 0.47, label: "Master" },
  { x: 0.35, y: 0.48, w: 0.26, h: 0.22, label: "Bed 2" },
  { x: 0.35, y: 0.73, w: 0.26, h: 0.22, label: "Bed 3" },
  { x: 0.63, y: 0.48, w: 0.32, h: 0.22, label: "Bed 4" },
  { x: 0.63, y: 0.73, w: 0.32, h: 0.22, label: "Bath" },
]);

function fp(bedrooms: number, type: PropertyType): string {
  if (type === "house" || type === "maisonette") return FP_HOUSE;
  if (bedrooms === 0) return FP_STUDIO;
  if (bedrooms === 1) return FP_1BED;
  if (bedrooms === 2) return FP_2BED;
  return FP_3BED;
}

interface Spec {
  area: string;
  name: string;
  listing: "rent" | "buy";
  price: number;
  size: number;
  type: PropertyType;
  bedrooms: number;
  lat: number;
  lng: number;
  address: string;
  description: string;
}

const SPECS: Spec[] = [
  // ─── Camden ─────────────────────────────────────────────────────────
  { area: "Camden", name: "Canal View Studio", listing: "rent", price: 1600, size: 32, type: "studio", bedrooms: 0, lat: 51.5408, lng: -0.1438, address: "12 Regent's Canal Walk, NW1", description: "Light-filled studio overlooking the canal towpath, steps from the market and Tube." },
  { area: "Camden", name: "Parkway Two-Bed", listing: "rent", price: 2750, size: 68, type: "flat", bedrooms: 2, lat: 51.5391, lng: -0.1462, address: "44 Parkway, NW1", description: "Bright two-bedroom flat above an independent café on a leafy street." },
  { area: "Camden", name: "Camden Lock Loft", listing: "rent", price: 3400, size: 82, type: "flat", bedrooms: 2, lat: 51.5417, lng: -0.1469, address: "5 Camden Lock Place, NW1", description: "Warehouse-style loft with double-height ceilings overlooking the lock." },
  { area: "Camden", name: "Chalk Farm Maisonette", listing: "rent", price: 3200, size: 95, type: "maisonette", bedrooms: 3, lat: 51.5442, lng: -0.1521, address: "8 Chalk Farm Road, NW1", description: "Split-level maisonette with a private roof terrace and original sash windows." },
  { area: "Camden", name: "Primrose Hill Terrace", listing: "buy", price: 1950000, size: 145, type: "house", bedrooms: 4, lat: 51.5447, lng: -0.1565, address: "18 Regent's Park Road, NW1", description: "Period terrace house overlooking Primrose Hill, with a south-facing garden." },
  { area: "Camden", name: "Camden Square House", listing: "buy", price: 1450000, size: 130, type: "house", bedrooms: 4, lat: 51.5468, lng: -0.1342, address: "9 Camden Square, NW1", description: "Detached Victorian on a quiet garden square with original cornicing throughout." },
  { area: "Camden", name: "Regent's Park Penthouse", listing: "buy", price: 2750000, size: 165, type: "flat", bedrooms: 3, lat: 51.5358, lng: -0.1473, address: "Park Crescent Penthouse, NW1", description: "Top-floor penthouse with wrap-around terrace and direct park views." },
  { area: "Camden", name: "Belsize Park Mansion", listing: "buy", price: 4800000, size: 280, type: "house", bedrooms: 6, lat: 51.5462, lng: -0.1656, address: "33 Belsize Park Gardens, NW3", description: "Stately double-fronted detached home with off-street parking and mature gardens." },

  // ─── Shoreditch ─────────────────────────────────────────────────────
  { area: "Shoreditch", name: "Boundary Studio", listing: "rent", price: 1750, size: 30, type: "studio", bedrooms: 0, lat: 51.5256, lng: -0.0779, address: "16 Boundary Street, E2", description: "Compact studio with exposed brick in the heart of the gallery district." },
  { area: "Shoreditch", name: "Rivington Loft", listing: "rent", price: 2400, size: 55, type: "flat", bedrooms: 1, lat: 51.5263, lng: -0.0793, address: "9 Rivington Street, EC2A", description: "Warehouse conversion with polished concrete and a south-facing balcony." },
  { area: "Shoreditch", name: "Hoxton Square Flat", listing: "rent", price: 3100, size: 78, type: "flat", bedrooms: 2, lat: 51.5274, lng: -0.0807, address: "21 Hoxton Square, N1", description: "Two-bed apartment overlooking the leafy square with vaulted ceilings." },
  { area: "Shoreditch", name: "Curtain Road Maisonette", listing: "rent", price: 3800, size: 110, type: "maisonette", bedrooms: 3, lat: 51.5256, lng: -0.0816, address: "67 Curtain Road, EC2A", description: "Three-bed duplex above a design studio with private street entrance." },
  { area: "Shoreditch", name: "Old Street Penthouse", listing: "buy", price: 1850000, size: 145, type: "flat", bedrooms: 3, lat: 51.5263, lng: -0.0843, address: "1 Old Street Yard, EC1V", description: "Top-floor penthouse with wrap-around terrace and skyline views." },
  { area: "Shoreditch", name: "Brick Lane Townhouse", listing: "buy", price: 2300000, size: 175, type: "house", bedrooms: 4, lat: 51.5212, lng: -0.0719, address: "92 Brick Lane, E1", description: "Georgian-style townhouse on four floors with a courtyard garden." },
  { area: "Shoreditch", name: "Spitalfields Heritage Home", listing: "buy", price: 3400000, size: 220, type: "house", bedrooms: 5, lat: 51.5197, lng: -0.0747, address: "14 Princelet Street, E1", description: "Grade II-listed Huguenot silk merchant's house with original panelling." },
  { area: "Shoreditch", name: "Bishopsgate Sky Suite", listing: "buy", price: 5200000, size: 250, type: "flat", bedrooms: 4, lat: 51.5208, lng: -0.0809, address: "Tower 1, Bishopsgate, EC2N", description: "Sub-penthouse on the 42nd floor with concierge, gym and 270° London views." },

  // ─── Notting Hill ───────────────────────────────────────────────────
  { area: "Notting Hill", name: "Portobello Garden Studio", listing: "rent", price: 1950, size: 36, type: "studio", bedrooms: 0, lat: 51.5147, lng: -0.2058, address: "5 Portobello Road, W11", description: "Garden-level studio with private patio just off the famous market." },
  { area: "Notting Hill", name: "Ladbroke Mews Flat", listing: "rent", price: 3200, size: 72, type: "flat", bedrooms: 2, lat: 51.5117, lng: -0.2071, address: "5 Ladbroke Mews, W11", description: "Quiet mews flat with high ceilings and a private courtyard entrance." },
  { area: "Notting Hill", name: "Holland Park Apartment", listing: "rent", price: 4500, size: 98, type: "flat", bedrooms: 2, lat: 51.5095, lng: -0.2061, address: "112 Holland Park Avenue, W11", description: "Lateral apartment in a white-stucco mansion block, lift to all floors." },
  { area: "Notting Hill", name: "Notting Hill Maisonette", listing: "rent", price: 5800, size: 132, type: "maisonette", bedrooms: 3, lat: 51.5128, lng: -0.1989, address: "8 Kensington Park Gardens, W11", description: "Three-bed duplex with private garden in a pastel-fronted terrace." },
  { area: "Notting Hill", name: "Portobello Cottage", listing: "buy", price: 1450000, size: 110, type: "house", bedrooms: 3, lat: 51.5155, lng: -0.2049, address: "27 Portobello Road, W11", description: "Pastel-fronted cottage on the famous market street, with a walled garden." },
  { area: "Notting Hill", name: "Pembridge Square Flat", listing: "buy", price: 2800000, size: 145, type: "flat", bedrooms: 3, lat: 51.5111, lng: -0.1989, address: "11 Pembridge Square, W2", description: "Raised ground floor flat with 4m ceilings and full garden access." },
  { area: "Notting Hill", name: "Stanley Crescent House", listing: "buy", price: 4200000, size: 220, type: "house", bedrooms: 5, lat: 51.5108, lng: -0.2089, address: "22 Stanley Crescent, W11", description: "Five-bed crescent house with communal gardens behind." },
  { area: "Notting Hill", name: "Lansdowne Grand Villa", listing: "buy", price: 7500000, size: 320, type: "house", bedrooms: 6, lat: 51.5089, lng: -0.2117, address: "9 Lansdowne Road, W11", description: "Detached six-bed stucco villa with double garage and home cinema." },

  // ─── Hackney ────────────────────────────────────────────────────────
  { area: "Hackney", name: "London Fields Studio", listing: "rent", price: 1400, size: 28, type: "studio", bedrooms: 0, lat: 51.5441, lng: -0.0614, address: "120 Mare Street, E8", description: "Cosy studio a two-minute walk from the lido and weekend market." },
  { area: "Hackney", name: "Dalston Junction Flat", listing: "rent", price: 2100, size: 60, type: "flat", bedrooms: 2, lat: 51.5462, lng: -0.0747, address: "88 Kingsland High St, E8", description: "Modern two-bed flat above the new overground station." },
  { area: "Hackney", name: "Mare Street Loft", listing: "rent", price: 2500, size: 70, type: "flat", bedrooms: 2, lat: 51.5436, lng: -0.0563, address: "55 Mare Street, E8", description: "Loft conversion with skylights, polished concrete and bike storage." },
  { area: "Hackney", name: "Hackney Wick Maisonette", listing: "rent", price: 2800, size: 95, type: "maisonette", bedrooms: 3, lat: 51.5436, lng: -0.0237, address: "12 Wallis Road, E9", description: "Live/work maisonette beside the canal in a converted print works." },
  { area: "Hackney", name: "Broadway Market House", listing: "buy", price: 1250000, size: 130, type: "house", bedrooms: 4, lat: 51.5366, lng: -0.0612, address: "3 Broadway Market, E8", description: "Victorian terrace with a long garden, two reception rooms and original fireplaces." },
  { area: "Hackney", name: "Victoria Park Townhouse", listing: "buy", price: 1850000, size: 165, type: "house", bedrooms: 4, lat: 51.5364, lng: -0.0413, address: "44 Victoria Park Road, E9", description: "Four-storey townhouse opposite the park with a south-west facing garden." },
  { area: "Hackney", name: "Clapton Period Home", listing: "buy", price: 1650000, size: 175, type: "house", bedrooms: 5, lat: 51.5616, lng: -0.0552, address: "21 Clapton Common, E5", description: "Detached Edwardian villa with original stained glass and off-street parking." },
  { area: "Hackney", name: "Hackney Mews Penthouse", listing: "buy", price: 2250000, size: 145, type: "flat", bedrooms: 3, lat: 51.5478, lng: -0.0596, address: "Top floor, 22 Boleyn Road, N16", description: "Penthouse with 60sqm roof terrace and panoramic east London views." },

  // ─── Islington ──────────────────────────────────────────────────────
  { area: "Islington", name: "Angel Studio", listing: "rent", price: 1800, size: 33, type: "studio", bedrooms: 0, lat: 51.5323, lng: -0.1057, address: "14 Duncan Street, N1", description: "Quiet ground-floor studio with separate sleeping alcove and patio." },
  { area: "Islington", name: "Upper Street Flat", listing: "rent", price: 2300, size: 58, type: "flat", bedrooms: 1, lat: 51.5378, lng: -0.1025, address: "210 Upper Street, N1", description: "Period one-bed flat directly above an antiques shop with bay window seating." },
  { area: "Islington", name: "Liverpool Road Flat", listing: "rent", price: 2750, size: 72, type: "flat", bedrooms: 2, lat: 51.5391, lng: -0.1108, address: "180 Liverpool Road, N1", description: "Bright two-bed in a smartly converted Georgian terrace." },
  { area: "Islington", name: "Highbury Hill Maisonette", listing: "rent", price: 3400, size: 102, type: "maisonette", bedrooms: 3, lat: 51.5519, lng: -0.1037, address: "8 Highbury Hill, N5", description: "Duplex with three doubles and a private garden opposite Highbury Fields." },
  { area: "Islington", name: "Angel Mews Condo", listing: "buy", price: 720000, size: 64, type: "condo", bedrooms: 2, lat: 51.5331, lng: -0.1066, address: "Apartment 14, The Foundry, N1", description: "Recently developed condominium with concierge and a private gym." },
  { area: "Islington", name: "Canonbury Square House", listing: "buy", price: 1950000, size: 175, type: "house", bedrooms: 4, lat: 51.5429, lng: -0.0967, address: "9 Canonbury Square, N1", description: "Stuccoed townhouse on London's oldest garden square with original features." },
  { area: "Islington", name: "Barnsbury Terrace", listing: "buy", price: 2650000, size: 210, type: "house", bedrooms: 5, lat: 51.5394, lng: -0.1153, address: "31 Lonsdale Square, N1", description: "Gothic Revival terrace with full-height bay, vaulted basement and garden." },
  { area: "Islington", name: "Almeida Penthouse", listing: "buy", price: 3400000, size: 165, type: "flat", bedrooms: 3, lat: 51.5387, lng: -0.1031, address: "Penthouse, 5 Almeida Street, N1", description: "Top-floor lateral apartment with wrap terrace, lift and concierge." },

  // ─── Kensington ─────────────────────────────────────────────────────
  { area: "Kensington", name: "Cromwell Studio", listing: "rent", price: 1850, size: 34, type: "studio", bedrooms: 0, lat: 51.4949, lng: -0.1791, address: "44 Cromwell Road, SW7", description: "Compact pied-à-terre directly opposite the V&A." },
  { area: "Kensington", name: "South Ken Apartment", listing: "rent", price: 3400, size: 76, type: "flat", bedrooms: 2, lat: 51.4937, lng: -0.1745, address: "12 Onslow Square, SW7", description: "Two-bed lateral apartment in a grand white-stucco terrace." },
  { area: "Kensington", name: "Earl's Court Flat", listing: "rent", price: 2950, size: 68, type: "flat", bedrooms: 2, lat: 51.4915, lng: -0.1944, address: "23 Bramham Gardens, SW5", description: "Period two-bed with high ceilings and access to communal gardens." },
  { area: "Kensington", name: "Gloucester Road Maisonette", listing: "rent", price: 4800, size: 122, type: "maisonette", bedrooms: 3, lat: 51.4951, lng: -0.1841, address: "5 Stanhope Gardens, SW7", description: "Lower-ground and raised-ground duplex with garden access." },
  { area: "Kensington", name: "Holland Park Garden Flat", listing: "buy", price: 2950000, size: 180, type: "flat", bedrooms: 4, lat: 51.4988, lng: -0.1761, address: "9 Holland Park, W8", description: "Sweeping garden flat in a grand white-stucco terrace with private patio." },
  { area: "Kensington", name: "Queen's Gate Mansion Flat", listing: "buy", price: 4500000, size: 220, type: "flat", bedrooms: 4, lat: 51.4986, lng: -0.1773, address: "32 Queen's Gate, SW7", description: "Lateral mansion flat with marble entrance, lift and 24-hour porter." },
  { area: "Kensington", name: "Holland Park Villa", listing: "buy", price: 8500000, size: 380, type: "house", bedrooms: 6, lat: 51.5031, lng: -0.2052, address: "12 Aubrey Walk, W8", description: "Six-bedroom Italianate villa with pool, gym and gated drive." },
  { area: "Kensington", name: "Kensington Palace Gardens", listing: "buy", price: 15000000, size: 520, type: "house", bedrooms: 7, lat: 51.5045, lng: -0.1885, address: "Palace Green, W8", description: "Detached seven-bed residence on London's most exclusive address." },

  // ─── Chelsea ────────────────────────────────────────────────────────
  { area: "Chelsea", name: "Sloane Square Studio", listing: "rent", price: 2100, size: 36, type: "studio", bedrooms: 0, lat: 51.4924, lng: -0.1571, address: "12 Sloane Avenue, SW3", description: "Smart studio one block from Sloane Square with porter access." },
  { area: "Chelsea", name: "Chelsea Embankment Flat", listing: "rent", price: 3800, size: 78, type: "flat", bedrooms: 2, lat: 51.4837, lng: -0.1635, address: "8 Cheyne Walk, SW3", description: "Two-bedroom flat with river views and an original marble fireplace." },
  { area: "Chelsea", name: "King's Road Apartment", listing: "rent", price: 4200, size: 92, type: "flat", bedrooms: 2, lat: 51.4863, lng: -0.1684, address: "210 King's Road, SW3", description: "Lateral apartment above a designer boutique with a juliet balcony." },
  { area: "Chelsea", name: "Cheyne Walk Townhouse Rental", listing: "rent", price: 6500, size: 132, type: "house", bedrooms: 3, lat: 51.4842, lng: -0.1709, address: "11 Cheyne Walk, SW3", description: "Riverside townhouse with Thames views, on four floors." },
  { area: "Chelsea", name: "King's Road Maisonette", listing: "buy", price: 2100000, size: 155, type: "maisonette", bedrooms: 3, lat: 51.4869, lng: -0.1683, address: "300 King's Road, SW3", description: "Two-storey maisonette above a designer boutique with a wide private balcony." },
  { area: "Chelsea", name: "Cadogan Square House", listing: "buy", price: 5200000, size: 240, type: "house", bedrooms: 5, lat: 51.4943, lng: -0.1604, address: "15 Cadogan Square, SW1X", description: "Red-brick townhouse with access to one of Chelsea's grandest garden squares." },
  { area: "Chelsea", name: "The Boltons Villa", listing: "buy", price: 9500000, size: 380, type: "house", bedrooms: 6, lat: 51.4882, lng: -0.1812, address: "5 The Boltons, SW10", description: "Detached stucco villa on the famed oval crescent, with secure parking." },
  { area: "Chelsea", name: "Cheyne Walk Townhouse Sale", listing: "buy", price: 12500000, size: 450, type: "house", bedrooms: 7, lat: 51.4839, lng: -0.1701, address: "16 Cheyne Walk, SW3", description: "Grade II-listed Thames-side townhouse with mooring rights and roof garden." },

  // ─── Greenwich ──────────────────────────────────────────────────────
  { area: "Greenwich", name: "Park View Studio", listing: "rent", price: 1250, size: 28, type: "studio", bedrooms: 0, lat: 51.4793, lng: -0.0064, address: "201 Park Vista, SE10", description: "Studio with park-facing balcony and shared roof garden." },
  { area: "Greenwich", name: "Maritime Quay Condo", listing: "rent", price: 2050, size: 70, type: "condo", bedrooms: 2, lat: 51.4815, lng: -0.0098, address: "5 Maritime Quay, SE10", description: "Two-bed condo on the eighth floor with gym access and concierge." },
  { area: "Greenwich", name: "Greenwich Village Flat", listing: "rent", price: 2400, size: 76, type: "flat", bedrooms: 2, lat: 51.4811, lng: -0.0103, address: "14 Royal Hill, SE10", description: "Two-bed flat above an independent bakery in the village conservation area." },
  { area: "Greenwich", name: "Royal Hill Maisonette", listing: "rent", price: 2800, size: 100, type: "maisonette", bedrooms: 3, lat: 51.4793, lng: -0.0117, address: "28 Royal Hill, SE10", description: "Three-bed duplex with private terrace and views of the park." },
  { area: "Greenwich", name: "Maritime Terrace", listing: "buy", price: 685000, size: 105, type: "house", bedrooms: 3, lat: 51.4811, lng: -0.0108, address: "5 Maritime Quay, SE10", description: "Modern terrace house within walking distance of the park and Cutty Sark." },
  { area: "Greenwich", name: "Crooms Hill House", listing: "buy", price: 1250000, size: 165, type: "house", bedrooms: 4, lat: 51.4787, lng: -0.0093, address: "32 Crooms Hill, SE10", description: "Grade II-listed Georgian house overlooking Greenwich Park." },
  { area: "Greenwich", name: "Greenwich Park Mansion", listing: "buy", price: 2450000, size: 240, type: "house", bedrooms: 5, lat: 51.4761, lng: -0.0036, address: "1 Maze Hill, SE10", description: "Five-bedroom Edwardian mansion with sweeping lawn and original orangery." },
  { area: "Greenwich", name: "The Observatory Penthouse", listing: "buy", price: 1950000, size: 145, type: "flat", bedrooms: 3, lat: 51.4767, lng: -0.0089, address: "Penthouse, 12 Observatory Gardens, SE10", description: "Top-floor penthouse with telescope-friendly roof terrace and skyline views." },

  // ─── Clapham ────────────────────────────────────────────────────────
  { area: "Clapham", name: "Clapham North Studio", listing: "rent", price: 1500, size: 30, type: "studio", bedrooms: 0, lat: 51.4651, lng: -0.13, address: "8 Bedford Road, SW4", description: "Recently refurbished studio two minutes from Clapham North station." },
  { area: "Clapham", name: "Northcote Flat", listing: "rent", price: 1900, size: 56, type: "flat", bedrooms: 2, lat: 51.4602, lng: -0.1561, address: "80 Northcote Road, SW11", description: "Bright flat on a buzzing food street, perfect for sharers." },
  { area: "Clapham", name: "Battersea Rise Apartment", listing: "rent", price: 2300, size: 72, type: "flat", bedrooms: 2, lat: 51.4644, lng: -0.1604, address: "22 Battersea Rise, SW11", description: "Two-bed period conversion with garden access and a working fireplace." },
  { area: "Clapham", name: "Clapham Old Town Maisonette", listing: "rent", price: 2900, size: 105, type: "maisonette", bedrooms: 3, lat: 51.4612, lng: -0.1374, address: "5 Old Town, SW4", description: "Three-bed duplex on a Georgian square steps from the common." },
  { area: "Clapham", name: "Common North House", listing: "buy", price: 1100000, size: 140, type: "house", bedrooms: 4, lat: 51.464, lng: -0.137, address: "22 The Pavement, SW4", description: "Family home overlooking the common with a south-facing garden." },
  { area: "Clapham", name: "Abbeville Road Townhouse", listing: "buy", price: 1650000, size: 165, type: "house", bedrooms: 4, lat: 51.4555, lng: -0.1411, address: "44 Abbeville Road, SW4", description: "Four-bed Victorian terrace on the Abbeville village high street." },
  { area: "Clapham", name: "Wandsworth Common Villa", listing: "buy", price: 2200000, size: 200, type: "house", bedrooms: 5, lat: 51.4499, lng: -0.1573, address: "12 Bolingbroke Grove, SW11", description: "Detached five-bed villa overlooking Wandsworth Common's lakes." },
  { area: "Clapham", name: "Clapham Park Mansion", listing: "buy", price: 3500000, size: 280, type: "house", bedrooms: 6, lat: 51.4513, lng: -0.1296, address: "5 Clapham Park Road, SW4", description: "Grand six-bedroom detached mansion with double drive and pool." },

  // ─── Brixton ────────────────────────────────────────────────────────
  { area: "Brixton", name: "Market Row Studio", listing: "rent", price: 1300, size: 26, type: "studio", bedrooms: 0, lat: 51.4615, lng: -0.1148, address: "5 Market Row, SW9", description: "Studio above the covered market — eclectic, energetic, central." },
  { area: "Brixton", name: "Acre Lane Flat", listing: "rent", price: 1750, size: 56, type: "flat", bedrooms: 2, lat: 51.4632, lng: -0.1217, address: "21 Acre Lane, SW2", description: "Two-bed period conversion with a roof terrace and bike store." },
  { area: "Brixton", name: "Brixton Hill Apartment", listing: "rent", price: 2100, size: 70, type: "flat", bedrooms: 2, lat: 51.4585, lng: -0.1196, address: "120 Brixton Hill, SW2", description: "Two-bed top-floor flat with hill views and a working fireplace." },
  { area: "Brixton", name: "Coldharbour Maisonette", listing: "rent", price: 2500, size: 92, type: "maisonette", bedrooms: 3, lat: 51.4631, lng: -0.1109, address: "44 Coldharbour Lane, SW9", description: "Three-bed maisonette with private entrance and rear terrace." },
  { area: "Brixton", name: "Coldharbour Maisonette Sale", listing: "buy", price: 595000, size: 88, type: "maisonette", bedrooms: 2, lat: 51.4633, lng: -0.1112, address: "46 Coldharbour Lane, SW9", description: "Two-bed maisonette with private entrance and walled rear garden." },
  { area: "Brixton", name: "Effra Road House", listing: "buy", price: 950000, size: 130, type: "house", bedrooms: 4, lat: 51.4593, lng: -0.1086, address: "55 Effra Road, SW2", description: "Four-bed Victorian terrace with original stained glass and west-facing garden." },
  { area: "Brixton", name: "Brockwell Park Townhouse", listing: "buy", price: 1450000, size: 165, type: "house", bedrooms: 4, lat: 51.4534, lng: -0.1066, address: "12 Trinity Rise, SW2", description: "Four-bedroom townhouse on a quiet street bordering Brockwell Park." },
  { area: "Brixton", name: "Herne Hill Villa", listing: "buy", price: 2200000, size: 220, type: "house", bedrooms: 5, lat: 51.4517, lng: -0.0936, address: "3 Burbage Road, SE24", description: "Detached Edwardian villa with off-street parking and tennis-court garden." },

  // ─── Wimbledon ──────────────────────────────────────────────────────
  { area: "Wimbledon", name: "Wimbledon Village Studio", listing: "rent", price: 1400, size: 30, type: "studio", bedrooms: 0, lat: 51.4282, lng: -0.2155, address: "8 High Street, SW19", description: "Smart studio above a village deli with shared courtyard." },
  { area: "Wimbledon", name: "Centre Court Flat", listing: "rent", price: 2400, size: 78, type: "flat", bedrooms: 2, lat: 51.4341, lng: -0.2138, address: "10 Church Road, SW19", description: "Modern two-bed within walking distance of the tennis grounds." },
  { area: "Wimbledon", name: "Park Side Apartment", listing: "rent", price: 2900, size: 92, type: "flat", bedrooms: 2, lat: 51.4322, lng: -0.2238, address: "44 Parkside, SW19", description: "Lateral two-bed in a mansion block bordering Wimbledon Common." },
  { area: "Wimbledon", name: "Village Maisonette", listing: "rent", price: 3500, size: 120, type: "maisonette", bedrooms: 3, lat: 51.4287, lng: -0.2162, address: "15 Wimbledon High Street, SW19", description: "Three-bed duplex over a wine bar in the village conservation area." },
  { area: "Wimbledon", name: "Village Cottage", listing: "buy", price: 1650000, size: 165, type: "house", bedrooms: 4, lat: 51.4293, lng: -0.2174, address: "12 High Street, SW19", description: "Detached cottage in the village conservation area with mature garden." },
  { area: "Wimbledon", name: "Parkside House", listing: "buy", price: 2950000, size: 240, type: "house", bedrooms: 5, lat: 51.4361, lng: -0.2298, address: "120 Parkside, SW19", description: "Five-bed Edwardian villa directly overlooking the common." },
  { area: "Wimbledon", name: "Wimbledon Hill Villa", listing: "buy", price: 4500000, size: 320, type: "house", bedrooms: 6, lat: 51.428, lng: -0.213, address: "44 Murray Road, SW19", description: "Six-bed detached on the hill with pool, gym and gated drive." },
  { area: "Wimbledon", name: "All England Mansion", listing: "buy", price: 6800000, size: 420, type: "house", bedrooms: 6, lat: 51.4339, lng: -0.2147, address: "1 Burghley Road, SW19", description: "Stately six-bed near Centre Court with private tennis court and pavilion." },

  // ─── Richmond ───────────────────────────────────────────────────────
  { area: "Richmond", name: "Richmond Bridge Studio", listing: "rent", price: 1500, size: 32, type: "studio", bedrooms: 0, lat: 51.4612, lng: -0.3049, address: "5 Bridge Street, TW9", description: "Riverside studio at the foot of Richmond Bridge with shared roof garden." },
  { area: "Richmond", name: "Riverside Apartment", listing: "rent", price: 2400, size: 78, type: "flat", bedrooms: 2, lat: 51.4615, lng: -0.3046, address: "12 Friars Lane, TW9", description: "Two-bed apartment overlooking the Thames towpath." },
  { area: "Richmond", name: "The Vineyard Flat", listing: "rent", price: 2800, size: 86, type: "flat", bedrooms: 2, lat: 51.4567, lng: -0.3041, address: "14 The Vineyard, TW10", description: "Period two-bed on a cobbled lane minutes from the high street." },
  { area: "Richmond", name: "Petersham Maisonette", listing: "rent", price: 3200, size: 112, type: "maisonette", bedrooms: 3, lat: 51.4528, lng: -0.3035, address: "33 Petersham Road, TW10", description: "Three-bed duplex steps from Richmond Park's Petersham gate." },
  { area: "Richmond", name: "Riverside Condo", listing: "buy", price: 980000, size: 92, type: "condo", bedrooms: 2, lat: 51.4607, lng: -0.305, address: "8 Old Palace Lane, TW9", description: "River-facing condo with shared roof garden overlooking the Thames." },
  { area: "Richmond", name: "Park Gate House", listing: "buy", price: 1750000, size: 165, type: "house", bedrooms: 4, lat: 51.46, lng: -0.295, address: "33 Petersham Road, TW10", description: "Four-bedroom family house steps from the gates of Richmond Park." },
  { area: "Richmond", name: "Petersham Park House", listing: "buy", price: 3200000, size: 240, type: "house", bedrooms: 5, lat: 51.4477, lng: -0.297, address: "12 Sandy Lane, TW10", description: "Five-bed detached overlooking the deer park with paddock garden." },
  { area: "Richmond", name: "Richmond Hill Mansion", listing: "buy", price: 5500000, size: 380, type: "house", bedrooms: 6, lat: 51.4546, lng: -0.2983, address: "5 Richmond Hill, TW10", description: "Grade II-listed mansion on the hill with the celebrated Thames panorama." },
];

export const PROPERTIES: Property[] = SPECS.map((s, i) => {
  const id = `p${(i + 1).toString().padStart(3, "0")}`;
  return {
    id,
    name: s.name,
    area: s.area,
    listing: s.listing,
    price: s.price,
    size: s.size,
    type: s.type,
    bedrooms: s.bedrooms,
    pictures: photosFor(i, 5),
    floorplan: fp(s.bedrooms, s.type),
    description: s.description,
    lat: s.lat,
    lng: s.lng,
    address: s.address,
  };
});

export function findProperty(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}

export function propertiesInArea(area: string): Property[] {
  const lower = area.toLowerCase();
  return PROPERTIES.filter((p) => p.area.toLowerCase() === lower);
}
