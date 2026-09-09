/**
 * Static HSE organizational structure, sourced from the company's HSE
 * Organizational Chart (19-Jul-2026). The source chart carries no photos
 * per person, so each node is rendered with an initials avatar instead of
 * a real photo.
 *
 * The tree is intentionally shallow and explicit rather than auto-derived
 * from arbitrary nesting, matching how the HSE Team page is meant to be
 * revealed: the Director is shown alone; clicking it reveals its three
 * direct reports; clicking specifically the Regional HSEM card reveals
 * everyone under that role in one go (grouped by region for readability).
 */
export interface OrgPerson {
  id: string;
  name: string;
  title: string;
  phone?: string;
  /** Optional sub-heading shown above a group of cards (e.g. a region name). */
  group?: string;
}

export const HSE_DIRECTOR: OrgPerson = {
  id: "director",
  name: "Rabih Eh Chaar",
  title: "HSSE Director",
  phone: "056 666 2556",
};

/** Direct reports of the HSSE Director, revealed on the first click. */
export const DIRECTOR_REPORTS: OrgPerson[] = [
  { id: "hsedc-1", name: "Rasha Alsouki", title: "HSE D.C.", phone: "056 600 7639" },
  { id: "hsedc-2", name: "Robert Maglonzo", title: "HSE D.C.", phone: "055 293 7451" },
  { id: "regional-hsem", name: "Soheb Alhassan", title: "Regional HSEM", phone: "058 166 2931" },
];

/** The id (within DIRECTOR_REPORTS) whose click reveals REGIONAL_TEAM. */
export const REGIONAL_HSEM_ID = "regional-hsem";

/** Everyone under the Regional HSEM, revealed only when that card is clicked. */
export const REGIONAL_TEAM: OrgPerson[] = [
  { id: "training-mgr", name: "Arshad Pathan", title: "Training Manager", phone: "054 659 8967" },
  { id: "compliance-mgr", name: "Khalid Alharthi", title: "Compliance Manager", phone: "055 555 7283" },

  // Riyadh region
  { id: "dsq", name: "Mohammed Aquib", title: "Diriyah Square (DSQ)", phone: "059 996 8126", group: "Riyadh" },
  { id: "exhibition", name: "Haitham El Chaar", title: "Exhibition Center", phone: "056 698 6644", group: "Riyadh" },
  { id: "ksp", name: "Ali Shawky", title: "King Salman Park (KSP)", phone: "056 677 3639", group: "Riyadh" },
  { id: "adf", name: "Aizaz Ahmad Khan", title: "ADF", phone: "050 710 6452", group: "Riyadh" },
  { id: "qiddiya", name: "Abid Khan", title: "Al Qiddiya ENV Hotels", phone: "059 653 3550", group: "Riyadh" },
  { id: "kkia", name: "Walid Abu Agla", title: "KKIA", phone: "054 068 6783", group: "Riyadh" },
  { id: "six-senses", name: "Khalid Albedaiwi", title: "Six Sense Hotels", phone: "056 408 0004", group: "Riyadh" },
  { id: "rcrc-kap", name: "Ahmed Bin Ali Jaidi", title: "RCRC - KAP", phone: "055 109 6568", group: "Riyadh" },
  { id: "kskd", name: "Azmat Khan", title: "KSKD (Diriyah)", phone: "059 001 4573", group: "Riyadh" },

  // Amaala Projects region
  { id: "rosewood", name: "Hamza Mehmood", title: "Rosewood", phone: "053 709 4457", group: "Amaala Projects" },
  { id: "wellness", name: "Mohammad Alam", title: "Wellness Integrative", phone: "059 508 1303", group: "Amaala Projects" },

  // Jeddah / Makkah region
  { id: "alarab", name: "Moataz Elsherbiny", title: "Alarab Hospital", phone: "053 027 5132", group: "Jeddah / Makkah" },
  { id: "seven-makkah", name: "Albaraa Waked", title: "SEVEN Makkah", phone: "056 165 8266", group: "Jeddah / Makkah" },
  { id: "jcd", name: "Altofel Alzaharani", title: "JCD Oceanarium", phone: "055 202 9720", group: "Jeddah / Makkah" },

  // Madinah region
  { id: "madinah-airport", name: "Mohamad Tabikh", title: "Al Madinah Airport", phone: "050 032 4886", group: "Madinah" },

  // Shura Island region
  { id: "p06", name: "Tufail Ahmed", title: "P06 (J0233)", phone: "055 306 9802", group: "Shura Island" },
  { id: "p09", name: "Nauman Qadir", title: "P09 (J035)", phone: "057 346 3354", group: "Shura Island" },
];
