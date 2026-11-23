/**
 * The phone app ("First Fix HSE Field"): an installable app that shows only
 * part of the system — Daily (Observation, Good Practice, KPI), Monthly (the
 * four monthly checklists).
 *
 * It is the same website opened from /m. While in it (in that tab / that
 * installed app window) the pages use a phone layout with a bottom tab bar
 * instead of the sidebar, and any other page sends you back to /m.
 * The "in the phone app" mark lives in sessionStorage, so it never leaks into
 * the full app opened in another tab or the other installed app.
 */

const KEY = "ff.mobileApp";

/** Pages the phone app may open (and everything under them). */
export const MOBILE_ALLOWED = ["/m", "/checklists", "/my-checklists"];

export const MOBILE_HOME = "/m/reports";

export function isMobilePath(pathname: string) {
  return pathname === "/m" || pathname.startsWith("/m/");
}

export function isAllowedInMobile(pathname: string) {
  return MOBILE_ALLOWED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function markMobileApp() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* private mode etc. — the /m pages still work */
  }
}

export function inMobileApp(pathname: string) {
  if (isMobilePath(pathname)) return true;
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
