/**
 * Hand-picked dashboard content (photos live in public/brand/news).
 * Edit these lists to change what the dashboard shows.
 */

export interface GoodPracticePost {
  id: string;
  image: string;
  title: string;
  details: string;
  project: string;
  /** YYYY-MM-DD, or null when undated. */
  date: string | null;
}

export const GOOD_PRACTICE_POSTS: GoodPracticePost[] = [
  {
    id: "eyewash-rosewood",
    image: "/brand/news/eyewash-rosewood.jpg",
    title: "Emergency Eyewash Stations",
    details: "Provision of Emergency Eyewash Stations at Iconic and Zone 3.",
    project: "Amaala – Rosewood",
    date: null,
  },
  {
    id: "training-oceanarium",
    image: "/brand/news/training-oceanarium.jpg",
    title: "Onsite training: Near Miss reporting",
    details: "Onsite training conducted on Near Miss reporting.",
    project: "JCD Oceanarium",
    date: "2026-10-04",
  },
  {
    id: "walkthrough",
    image: "/brand/news/walkthrough.jpg",
    title: "Weekly HSE Site Walkthrough",
    details:
      "Walkthrough with Construction team Management. Findings and commitment: housekeeping and material management, barricading and warning signage, PTW compliance.",
    project: "Construction Management",
    date: null,
  },
];

export interface NewsPost {
  id: string;
  image: string;
  title: string;
  lines: string[];
  /** CSS object-position for the photo crop. */
  position?: string;
}

/** HSE News slides, shown in this order. */
export const NEWS_POSTS: NewsPost[] = [
  {
    id: "walkthrough",
    image: "/brand/news/walkthrough.jpg",
    title: "Weekly HSE Site Walkthrough with Construction team Management.",
    lines: [
      "Findings and Commitment:",
      "- Housekeeping and Material Management.",
      "- Barricading and Warning Signage.",
      "- PTW Compliance.",
    ],
  },
  {
    id: "training-oceanarium",
    image: "/brand/news/training-oceanarium.jpg",
    position: "center 22%",
    title: "Onsite training conducted.",
    lines: ["Project: JCD Oceanarium", "Topic: Near Miss reporting", "Date: 04/10/2026."],
  },
  {
    id: "eyewash-rosewood",
    image: "/brand/news/eyewash-rosewood.jpg",
    position: "center 20%",
    title: "Amaala - Rosewood",
    lines: ["Good Practice - Provision of Emergency Eyewash Stations at Iconic and Zone 3."],
  },
];
