// ViviChild Academy — Supabase browser configuration
// IMPORTANT: Use the Supabase Project URL and the anon/public key only.
// NEVER put the service_role key in this file.
//
// After replacing the two placeholders, commit this file to GitHub Pages.
// The anon/public key is designed for browser use when Row Level Security is enabled.
window.SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
  url: 'https://bdhxswgkwelkvvwgqywu.supabase.co/rest/v1/',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkaHhzd2drd2Vsa3Z2d2dxeXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NDYzNDksImV4cCI6MjEwMjMyMjM0OX0.O54DqOStDNFR1gW4uNqiojFbWJibp3MGVa3ZT1YpnYg'
};

// Keep both names for compatibility with the CMS and Admin pages.
window.VIVICHILD_SUPABASE = window.SUPABASE_CONFIG;
