# Star Homes Mobile Application — Design Document

**Version:** 1.0  
**Date:** May 2026  
**Author:** Business Analyst  
**Status:** Draft — for product owner review

---

## 1. Project overview

Star Homes is one of London's leading estate agents with more than 30 branches across the city. The current website is a static HTML presence covering company information, branch locations, and contact details. There is no digital customer journey for property discovery.

This document defines the design for a new Star Homes mobile application that enables any person looking to rent or buy property in London to discover suitable areas and browse available listings — with zero prior knowledge of the city required.

### 1.1 Business objective

Grow the Star Homes customer base by providing a modern, data-driven property discovery experience that positions the brand ahead of competitors through the use of current mobile technology.

### 1.2 Scope

- New native mobile application (iOS and Android)
- No revamp or integration with the existing website in this phase
- The website remains live but independent

---

## 2. Target users

The application serves anyone seeking to rent or buy residential property in London. There is no restriction to a specific demographic. Priority personas include:

- **New expats** relocating to London with no prior knowledge of the city's geography or neighbourhoods
- **Families** looking to settle in an area that suits their lifestyle needs (schools, green space, transport)
- **Individuals and couples** searching for their first rental or purchase in the city

Both rental and sales journeys are in scope.

---

## 3. User journey

### 3.1 High-level flow

```
Register / Log in
       │
       ▼
Map screen (bare minimum entry point)
  └─ Draw area on map  ──► Set radius filter (1 km / 3 km / 5 km)
       │
       ▼
Browse listings in selected area
  └─ Optionally add preferences to refine results
       │
   ┌───┴────────────────────────────────┐
   │                                    │
   ▼                                    ▼
Listings found                    No listings found
  │                                    │
  ├─ View property detail         Register interest → agent assigned
  ├─ Mark as favourite            Show nearby suggested areas
  ├─ Compare 2 properties
  └─ Request more info → agent contacted
```

### 3.2 Step-by-step description

**Step 1 — Registration**  
The user downloads the app and registers with a mobile phone number (OTP verification). On first login they are taken directly to the map screen. The app prompts them (optionally) to set preferences before or after area selection.

**Step 2 — Map area selection**  
The user sees a full-screen interactive map of London. They draw a freehand or polygon boundary to define their search area. This is the bare minimum action required to see listings — no preferences are mandatory at this point.

**Step 3 — Radius filter**  
After drawing an area, the user can optionally apply a radius filter (1 km, 3 km, 5 km) to widen or tighten the search boundary. The map updates in real time.

**Step 4 — Listings**  
The app returns all available properties (rental and/or sale) within the defined area. Results can be filtered by rent or buy intent.

**Step 5 — Preferences (optional enrichment)**  
The user can add preferences at any time to refine results. The preference layer does not block initial discovery.

**Step 6 — Property interaction**  
From any listing the user can: view full details, mark as a favourite, compare with one other property, or send a "request more information" enquiry to the assigned agent.

**Step 7 — No listings fallback**  
If the selected area has no available properties, the app offers a "register interest" form. On submission, an agent is assigned and will contact the user. Nearby areas with available listings are surfaced below the empty state.

---

## 4. Functional requirements

### 4.1 Registration and authentication

| ID | Requirement |
|----|-------------|
| FR-01 | Users must register with a valid mobile phone number verified via OTP |
| FR-02 | Registration is required before any part of the app is accessible |
| FR-03 | Returning users are authenticated on re-open (session management or re-OTP TBD) |
| FR-04 | Users may optionally save their preferences; this choice is explicitly presented post-onboarding |
| FR-05 | Users can update or delete their saved preferences at any time from account settings |

### 4.2 Map and area selection

| ID | Requirement |
|----|-------------|
| FR-06 | The app provides an interactive map of London as the primary search interface |
| FR-07 | Users can draw a freehand or polygon boundary directly on the map |
| FR-08 | Drawn boundaries can be edited or cleared before confirming |
| FR-09 | Users can apply a radius filter (1 km, 3 km, 5 km) around their drawn area |
| FR-10 | The map boundary and radius update the listing results in real time |

### 4.3 Property preferences

| ID | Requirement |
|----|-------------|
| FR-11 | Preferences are optional — the app functions with map area selection alone |
| FR-12 | Location-based preferences include: proximity to tube stations, schools, supermarkets, and CBD |
| FR-13 | Property preferences include: property type (flat, house, studio, etc.) and number of bedrooms |
| FR-14 | Transaction preferences include: rent or buy |
| FR-15 | Users can select any combination of preferences; no preference is mandatory |
| FR-16 | Preferences update the recommendation and listing results immediately on change |

### 4.4 Area recommendations

| ID | Requirement |
|----|-------------|
| FR-17 | When preferences are set, the app surfaces a ranked list of recommended London areas that match those preferences |
| FR-18 | Each recommended area includes a brief explanation of why it matches the user's criteria |
| FR-19 | Tapping a recommended area loads it as the active map zone and displays its listings |
| FR-20 | Recommendations complement but do not replace the manual map draw flow |

### 4.5 Listings

| ID | Requirement |
|----|-------------|
| FR-21 | Listings display: price, property type, number of bedrooms, at least one image, and rental/sale flag |
| FR-22 | Users can filter the listing results by rent or sale |
| FR-23 | Listings load within 3 seconds on a standard 4G connection |
| FR-24 | Each property listing has at least one assigned agent |

### 4.6 Property actions

| ID | Requirement |
|----|-------------|
| FR-25 | Users can mark any property as a favourite from the listing card or detail page |
| FR-26 | A dedicated "Favourites" screen lists all saved properties |
| FR-27 | Users can select exactly 2 properties and view them in a side-by-side comparison screen |
| FR-28 | The comparison screen shows key attributes: price, property type, bedrooms, and key amenities |
| FR-29 | Users can swap one property in the comparison without losing the other |
| FR-30 | Each property detail page has a "Request more information" button |
| FR-31 | Tapping "Request more information" routes the enquiry to the property's assigned agent using the user's registered contact details |
| FR-32 | The user receives an in-app confirmation that their enquiry has been sent |

### 4.7 No listings / empty state

| ID | Requirement |
|----|-------------|
| FR-33 | When an area has no available listings, the app displays a clear empty state message |
| FR-34 | The empty state offers a "Register interest" call to action |
| FR-35 | Submitting the register interest form captures the user's area and preferences and assigns an agent to follow up |
| FR-36 | Below the empty state, the app surfaces up to 3 nearby areas that have available listings |

### 4.8 User preference storage

| ID | Requirement |
|----|-------------|
| FR-37 | At the end of a session, the user is prompted to save their current preferences |
| FR-38 | If the user declines, all preference data is discarded at end of session |
| FR-39 | If the user consents, preferences are stored against their account for future sessions |
| FR-40 | Stored preferences are editable and deletable at any time |

---

## 5. Non-functional requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Platform | iOS and Android support required |
| NFR-02 | Performance | Listings must load within 3 seconds on 4G |
| NFR-03 | Connectivity | App assumes active internet connection; offline mode is out of scope for MVP |
| NFR-04 | Data privacy | User preference data must comply with UK GDPR; consent must be explicit and revocable |
| NFR-05 | Accessibility | UI must meet WCAG 2.1 AA as a minimum |
| NFR-06 | Branding | App must adhere to Star Homes brand guidelines (to be provided) |

---

## 6. MVP definition

The minimum viable product is defined as a registered user being able to:

1. Register with a mobile phone number
2. Draw a search area on the London map
3. View available property listings within that area
4. Request more information from an agent

All other features (preferences, recommendations, favourites, comparison, radius filter, register interest) are enhancements that layer on top of the MVP core.

---

## 7. Out of scope (this phase)

- Integration with or revamp of the existing Star Homes website
- Web application version
- Offline mode
- Push notifications (may be considered for "register interest" follow-up in a later phase)
- Direct in-app messaging with agents
- Payment or booking flows

---

## 8. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| OQ-01 | Which mapping provider will be used (Google Maps, Mapbox, Apple Maps)? | Tech lead | Open |
| OQ-02 | What is the source of property listing data and how often is it refreshed? | Product owner | Open |
| OQ-03 | How is agent assignment to a property determined — by branch territory or manually? | Product owner | Open |
| OQ-04 | Are there FCA or property advertising regulations that affect how listings are displayed? | Legal | Open |
| OQ-05 | What third-party data sources are approved for amenity data (TfL, Ofsted, OS)? | Product owner | Open |
| OQ-06 | What is the target launch date? | Product owner | Open |
| OQ-07 | How does agent notification work when a "request more information" is submitted — email, CRM integration, in-app dashboard? | Tech lead | Open |

---

## 9. Glossary

| Term | Definition |
|------|------------|
| CBD | Central Business District — the core commercial zone of London |
| OTP | One-time password — a single-use verification code sent via SMS |
| Listing | A property available for rent or sale on the Star Homes platform |
| Agent | A Star Homes property dealer assigned to one or more listings |
| Drawn area | A user-defined map boundary created using the in-app drawing tool |
| Radius filter | A circular distance filter applied around a drawn area to expand or restrict results |
| Register interest | A lead-capture action taken when no listings are available in a user's chosen area |
| Preference | A user-selected criterion (e.g. near tube, 2 bedrooms) used to refine area recommendations and listings |


