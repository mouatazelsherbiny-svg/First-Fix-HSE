/**
 * Single source of truth for "the current signed-in user's project".
 *
 * Hardcoded today because login/user-project assignment is still mocked —
 * there is no real backend linking a user to a project yet. Once that
 * exists, change ONLY this function (e.g. read it off the authenticated
 * user) and every page that calls getCurrentUserProject() picks it up
 * automatically, with no other code to touch.
 */
export function getCurrentUserProject(): string {
  return "KSP";
}
