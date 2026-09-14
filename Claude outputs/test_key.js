// Quick sanity check — paste this alone first to confirm your key works
// before re-running the full migration script.
(async () => {
  var SERVICE_ROLE_KEY = "PASTE_YOUR_SERVICE_ROLE_KEY_HERE";
  var SUPABASE_URL = "https://oxnfpqiezddaecaxsexw.supabase.co";
  var res = await fetch(SUPABASE_URL + "/rest/v1/observations?select=id&limit=1", {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: "Bearer " + SERVICE_ROLE_KEY }
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
})();
