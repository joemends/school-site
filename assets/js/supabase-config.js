// ViviChild Academy — Supabase browser configuration
// IMPORTANT: Use the Supabase Project URL and the anon/public key only.
// NEVER put the service_role key in this file.
//
// After replacing the two placeholders, commit this file to GitHub Pages.
// The anon/public key is designed for browser use when Row Level Security is enabled.
window.SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
  url: 'YOUR_SUPABASE_PROJECT_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

// Keep both names for compatibility with the CMS and Admin pages.
window.VIVICHILD_SUPABASE = window.SUPABASE_CONFIG;
