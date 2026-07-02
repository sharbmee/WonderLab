// This file defines the "shape" of an Experience across the entire app.
// By defining it once here, every component that uses experiences
// will automatically get the same type — no duplication, no drift.

export type Experience = {
  id: string;          // unique slug, used in URLs: "coin-flip"
  title: string;       // display name: "Coin Flip"
  description: string; // one-line summary shown on the card
  emoji: string;       // visual anchor for the card
  category: string;    // e.g. "Games", "Tools", "Science"
  href: string;        // route path: "/experiences/coin-flip"
  featured?: boolean;  // optional: show on homepage featured grid
};
