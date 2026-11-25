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
    id: "al-arab-1m-award",
    image: "/brand/news/al-arab-1m-award.jpg",
    title: "1,000,000 Safe Man-Hours",
    details: "Achieved 1,000,000 Safe Man-Hours Without a Lost-Time Injury (LTI).",
    project: "Al Arab Hospital",
    date: null,
  },
  {
    id: "qiddiya-1m-cake",
    image: "/brand/news/qiddiya-1m-cake.jpg",
    title: "1 Million Safe Work-Hours",
    details: "Celebrating 1 Million Safe Work-Hours Without Lost-Time Injuries.",
    project: "Al Qiddiya Hotels",
    date: null,
  },
  {
    id: "exhibition-mbl-certificate",
    image: "/brand/news/exhibition-mbl-certificate.jpg",
    title: "Recognized by MBL",
    details: "A First Fix employee was recognized by MBL for his excellent safety performance and strong commitment to HSE standards.",
    project: "Exhibition Center",
    date: null,
  },
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
    id: "al-arab-1m-safe-hours",
    image: "/brand/news/al-arab-1m-safe-hours.jpg",
    position: "center 40%",
    title: "Achieved 1,000,000 Safe Man-Hours Without a Lost-Time Injury (LTI)",
    lines: ["Project: Al Arab Hospital"],
  },
  {
    id: "qiddiya-1m-celebration",
    image: "/brand/news/qiddiya-1m-celebration.jpg",
    position: "center 30%",
    title: "Celebrating 1 Million Safe Work-Hours Without Lost-Time Injuries",
    lines: ["Project: Al Qiddiya Hotels"],
  },
  {
    id: "exhibition-mbl-recognition",
    image: "/brand/news/exhibition-mbl-recognition.jpg",
    position: "center 35%",
    title: "A First Fix employee was recognized by MBL for his excellent safety performance and strong commitment to HSE standards.",
    lines: ["Project: Exhibition Center"],
  },
  {
    id: "seven-toolbox-talk",
    image: "/brand/news/seven-toolbox-talk.jpg",
    position: "center 45%",
    title: "HSE awareness briefings and safety Toolbox Talks were delivered.",
    lines: ["Project: SEVEN"],
  },
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
