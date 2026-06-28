/**
 * Supabase configuration for iCant Solutions.
 * Set your project URL and anon key below, or via Settings in the app.
 * Leave empty to use localStorage-only mode (demo works offline).
 */
window.ICANT_CONFIG = {
    supabaseUrl: '',
    supabaseAnonKey: ''
};

// Restore saved credentials from local settings (optional)
(function loadSavedConfig() {
    const savedUrl = localStorage.getItem('icant_supabase_url');
    const savedKey = localStorage.getItem('icant_supabase_anon_key');
    if (savedUrl) window.ICANT_CONFIG.supabaseUrl = savedUrl;
    if (savedKey) window.ICANT_CONFIG.supabaseAnonKey = savedKey;
})();
