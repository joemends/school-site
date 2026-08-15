// ViviChild Academy — Supabase browser configuration
// Use ONLY the Supabase Project URL and anon/public key.
// The Project URL must look like:
// https://xxxxxxxxxxxxxxxx.supabase.co
// Do NOT paste /rest/v1, /auth/v1, /storage/v1, or a trailing API path.
//
// NEVER put the service_role key in this file.

(function () {
  const rawUrl = 'YOUR_SUPABASE_PROJECT_URL';
  const anonKey = 'YOUR_SUPABASE_ANON_KEY';

  // Protect the app from the common mistake of pasting a REST/API endpoint
  // instead of the Supabase Project URL.
  function normalizeProjectUrl(value) {
    let url = String(value || '').trim();
    url = url.replace(/\/+$/, '');
    url = url.replace(/\/(rest\/v1|auth\/v1|storage\/v1)(\/.*)?$/i, '');
    return url;
  }

  window.SUPABASE_CONFIG = {
    url: normalizeProjectUrl(rawUrl),
    anonKey: String(anonKey || '').trim()
  };

  // Compatibility with older CMS/Admin code.
  window.VIVICHILD_SUPABASE = window.SUPABASE_CONFIG;
})();
