import type { AreaInfo } from "../types";

export const AREAS: AreaInfo[] = [
  {
    name: "Camden",
    lat: 51.5414,
    lng: -0.1426,
    similar: ["Kentish Town", "Islington", "Hackney"],
    blurb: "Buzzing market town with canal-side bars and live music venues.",
  },
  {
    name: "Shoreditch",
    lat: 51.5253,
    lng: -0.0782,
    similar: ["Hackney", "Dalston", "Bethnal Green"],
    blurb: "Creative east-end district known for street art and nightlife.",
  },
  {
    name: "Notting Hill",
    lat: 51.5099,
    lng: -0.1958,
    similar: ["Holland Park", "Bayswater", "Kensington"],
    blurb: "Pastel terraces, antique markets and quiet leafy streets.",
  },
  {
    name: "Hackney",
    lat: 51.545,
    lng: -0.0553,
    similar: ["Shoreditch", "Dalston", "Stoke Newington"],
    blurb: "Young, creative borough with parks and independent cafés.",
  },
  {
    name: "Islington",
    lat: 51.5362,
    lng: -0.1033,
    similar: ["Camden", "Highbury", "Angel"],
    blurb: "Georgian squares, gastro pubs and theatre on Upper Street.",
  },
  {
    name: "Kensington",
    lat: 51.4988,
    lng: -0.1749,
    similar: ["Chelsea", "Notting Hill", "South Kensington"],
    blurb: "Stately white-stucco terraces near museums and Hyde Park.",
  },
  {
    name: "Chelsea",
    lat: 51.4875,
    lng: -0.1687,
    similar: ["Kensington", "Fulham", "Pimlico"],
    blurb: "Riverside elegance with boutiques along the Kings Road.",
  },
  {
    name: "Greenwich",
    lat: 51.4826,
    lng: -0.0077,
    similar: ["Blackheath", "Deptford", "Lewisham"],
    blurb: "Maritime heritage, sweeping park views and Sunday markets.",
  },
  {
    name: "Clapham",
    lat: 51.4618,
    lng: -0.1384,
    similar: ["Battersea", "Brixton", "Balham"],
    blurb: "Family-friendly south London with a big common at its centre.",
  },
  {
    name: "Brixton",
    lat: 51.4622,
    lng: -0.1145,
    similar: ["Clapham", "Streatham", "Peckham"],
    blurb: "Vibrant food scene, music venues and a covered market hall.",
  },
  {
    name: "Wimbledon",
    lat: 51.4214,
    lng: -0.2064,
    similar: ["Putney", "Richmond", "Southfields"],
    blurb: "Leafy suburb with tennis heritage and a village high street.",
  },
  {
    name: "Richmond",
    lat: 51.4613,
    lng: -0.3037,
    similar: ["Kew", "Wimbledon", "Twickenham"],
    blurb: "Riverside village beside the largest royal park in London.",
  },
];

export function findArea(name: string): AreaInfo | undefined {
  const lower = name.trim().toLowerCase();
  return AREAS.find((a) => a.name.toLowerCase() === lower);
}

export function searchAreas(query: string): AreaInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return AREAS;
  return AREAS.filter((a) => a.name.toLowerCase().includes(q));
}
