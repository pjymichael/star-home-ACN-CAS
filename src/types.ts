export type Listing = "rent" | "buy";

export type PropertyType = "flat" | "house" | "condo" | "studio" | "maisonette";

export interface Property {
  id: string;
  name: string;
  area: string;
  listing: Listing;
  /** Monthly rent in GBP for rent, total price in GBP for buy */
  price: number;
  /** Internal size in square metres */
  size: number;
  type: PropertyType;
  bedrooms: number;
  pictures: string[];
  floorplan: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
}

export interface AreaInfo {
  name: string;
  lat: number;
  lng: number;
  /** Names of areas geographically/culturally similar — used for recommendations */
  similar: string[];
  /** Short description shown on results page */
  blurb: string;
}

export type SortKey = "price-asc" | "price-desc" | "size-asc" | "size-desc";

export interface Filters {
  priceMin: number | null;
  priceMax: number | null;
  sizeMin: number | null;
  sizeMax: number | null;
  types: PropertyType[];
  bedrooms: number[];
}

export const EMPTY_FILTERS: Filters = {
  priceMin: null,
  priceMax: null,
  sizeMin: null,
  sizeMax: null,
  types: [],
  bedrooms: [],
};

export interface Agent {
  id: string;
  name: string;
  position: string;
  area: string;
  photo: string;
  email: string;
  phone: string;
  bio: string;
  yearsExperience: number;
  specialties: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
}
