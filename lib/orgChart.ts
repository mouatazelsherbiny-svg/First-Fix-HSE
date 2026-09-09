/**
 * Static HSE organizational structure, sourced from the company's HSE
 * Organizational Chart (19-Jul-2026). Photos are the actual headshots
 * embedded in that chart (cropped to square, resized), served from
 * public/brand/team/<id>.jpg.
 *
 * The tree is intentionally shallow and explicit rather than auto-derived
 * from arbitrary nesting, matching how the HSE Team page is meant to be
 * revealed: the Director is shown alone; clicking it reveals its direct
 * reports (both HSE D.C.'s, the Training Manager, the Compliance Manager,
 * and the Regional HSEM, all at one level); clicking specifically the
 * Regional HSEM card reveals the regional/site team under that role
 * (grouped by region for readability).
 */
export interface OrgPerson {
  id: string;
  name: string;
  title: string;
  phone?: string;
  photoUrl: string;
  /** Optional sub-heading shown above a group of cards (e.g. a region name). */
  group?: string;
  /** Optional column placement (1 or 2) within its group, for regions that
   *  are laid out as two side-by-side columns (e.g. Riyadh) rather than a
   *  single stack. Omitted entries default to column 1. */
  col?: 1 | 2;
}

function teamPhoto(id: string): string {
  return `/brand/team/${id}.jpg`;
}

export const HSE_DIRECTOR: OrgPerson = {
  id: "director",
  name: "Rabih Eh Chaar",
  title: "HSSE Director",
  phone: "056 666 2556",
  photoUrl: teamPhoto("director"),
};

/** Direct reports of the HSSE Director, revealed on the first click. */
export const DIRECTOR_REPORTS: OrgPerson[] = [
  { id: "hsedc-1", name: "Rasha Alsouki", title: "HSE D.C.", phone: "056 600 7639", photoUrl: teamPhoto("hsedc-1") },
  { id: "hsedc-2", name: "Robert Maglonzo", title: "HSE D.C.", phone: "055 293 7451", photoUrl: teamPhoto("hsedc-2") },
  { id: "training-mgr", name: "Arshad Pathan", title: "Training Manager", phone: "054 659 8967", photoUrl: teamPhoto("training-mgr") },
  { id: "regional-hsem", name: "Soheb Alhassan", title: "Regional HSEM", phone: "058 166 2931", photoUrl: teamPhoto("regional-hsem") },
  { id: "compliance-mgr", name: "Khalid Alharthi", title: "Compliance Manager", phone: "055 555 7283", photoUrl: teamPhoto("compliance-mgr") },
];

/** The id (within DIRECTOR_REPORTS) whose click reveals REGIONAL_TEAM. */
export const REGIONAL_HSEM_ID = "regional-hsem";

/** Everyone under the Regional HSEM, revealed only when that card is clicked. */
export const REGIONAL_TEAM: OrgPerson[] = [
  // Riyadh region — two columns, in the same left/right reading order as
  // the source org chart image.
  { id: "dsq", name: "Mohammed Aquib", title: "Diriyah Square (DSQ)", phone: "059 996 8126", photoUrl: teamPhoto("dsq"), group: "Riyadh", col: 1 },
  { id: "qiddiya", name: "Abid Khan", title: "Al Qiddiya ENV Hotels", phone: "059 653 3550", photoUrl: teamPhoto("qiddiya"), group: "Riyadh", col: 2 },
  { id: "exhibition", name: "Haitham El Chaar", title: "Exhibition Center", phone: "056 698 6644", photoUrl: teamPhoto("exhibition"), group: "Riyadh", col: 1 },
  { id: "kkia", name: "Walid Abu Agla", title: "KKIA", phone: "054 068 6783", photoUrl: teamPhoto("kkia"), group: "Riyadh", col: 2 },
  { id: "ksp", name: "Ali Shawky", title: "King Salman Park (KSP)", phone: "056 677 3639", photoUrl: teamPhoto("ksp"), group: "Riyadh", col: 1 },
  { id: "six-senses", name: "Khalid Albedaiwi", title: "Six Sense Hotels", phone: "056 408 0004", photoUrl: teamPhoto("six-senses"), group: "Riyadh", col: 2 },
  { id: "misk", name: "Langton Joseph", title: "MISK (ILMI)", phone: "053 066 7424", photoUrl: teamPhoto("misk"), group: "Riyadh", col: 1 },
  { id: "rcrc-kap", name: "Ahmed Bin Ali Jaidi", title: "RCRC - KAP", phone: "055 109 6568", photoUrl: teamPhoto("rcrc-kap"), group: "Riyadh", col: 2 },
  { id: "adf", name: "Aizaz Ahmad Khan", title: "ADF", phone: "050 710 6452", photoUrl: teamPhoto("adf"), group: "Riyadh", col: 1 },
  { id: "kskd", name: "Azmat Khan", title: "KSKD (Diriyah)", phone: "059 001 4573", photoUrl: teamPhoto("kskd"), group: "Riyadh", col: 2 },

  // Amaala Projects region
  { id: "rosewood", name: "Hamza Mehmood", title: "Rosewood", phone: "053 709 4457", photoUrl: teamPhoto("rosewood"), group: "Amaala Projects" },
  { id: "wellness", name: "Mohammad Alam", title: "Wellness Integrative", phone: "059 508 1303", photoUrl: teamPhoto("wellness"), group: "Amaala Projects" },

  // Jeddah / Makkah region
  { id: "alarab", name: "Moataz Elsherbiny", title: "Alarab Hospital", phone: "053 027 5132", photoUrl: teamPhoto("alarab"), group: "Jeddah / Makkah" },
  { id: "seven-makkah", name: "Albaraa Waked", title: "SEVEN Makkah", phone: "056 165 8266", photoUrl: teamPhoto("seven-makkah"), group: "Jeddah / Makkah" },
  { id: "jcd", name: "Altofel Alzaharani", title: "JCD Oceanarium", phone: "055 202 9720", photoUrl: teamPhoto("jcd"), group: "Jeddah / Makkah" },

  // Madinah region
  { id: "madinah-airport", name: "Mohamad Tabikh", title: "Al Madinah Airport", phone: "050 032 4886", photoUrl: teamPhoto("madinah-airport"), group: "Madinah" },

  // Shura Island region
  { id: "p06", name: "Tufail Ahmed", title: "P06 (J0233)", phone: "055 306 9802", photoUrl: teamPhoto("p06"), group: "Shura Island" },
  { id: "p09", name: "Nauman Qadir", title: "P09 (J035)", phone: "057 346 3354", photoUrl: teamPhoto("p09"), group: "Shura Island" },
];
