/** Supabase Auth gate. Passwords are sent directly to Supabase Auth and are never stored by this app. */
const AuthModule = (function () {
    let user = null;
    function renderGate(message = '') {
        let gate = document.getElementById('auth-gate');
        if (!gate) { gate = document.createElement('div'); gate.id = 'auth-gate'; gate.className = 'fixed inset-0 z-[300] bg-slate-950/80 flex items-center justify-center p-4'; document.body.appendChild(gate); }
        const unavailable = !DataLayer.isOnline() || !DataLayer.getClient();
        gate.innerHTML = `<div class="relative bg-white max-w-md w-full rounded-3xl p-7 shadow-2xl"><button type="button" onclick="AuthModule.dismiss()" aria-label="Close" class="absolute right-4 top-3 text-3xl text-slate-400 hover:text-slate-700">&times;</button><h1 class="font-display text-2xl">Secure iCant account</h1><p class="text-sm text-slate-500 mt-1">Sign in to access your private profile and requests.</p><p id="auth-message" class="mt-3 text-sm text-red-600"></p>${unavailable ? '<div class="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">Secure profiles are being connected. Public templates and the Business Hub are still available.</div>' : '<form class="mt-5 space-y-3" onsubmit="AuthModule.signIn(event)"><input id="auth-email" type="email" required autocomplete="email" placeholder="Email" class="w-full border rounded-2xl px-4 py-3"><input id="auth-password" type="password" required minlength="8" autocomplete="current-password" placeholder="Password" class="w-full border rounded-2xl px-4 py-3"><button class="w-full bg-indigo-600 text-white rounded-2xl py-3 font-semibold">Sign in</button><button type="button" onclick="AuthModule.signUp()" class="w-full border rounded-2xl py-3 font-semibold">Create account</button><button type="button" onclick="AuthModule.resetPassword()" class="w-full text-sm text-indigo-700 py-2">Forgot password?</button></form>'}<button type="button" onclick="AuthModule.dismiss()" class="w-full mt-4 py-3 text-sm font-semibold text-indigo-700">Continue browsing</button><p class="text-[11px] text-slate-400 mt-3">Never enter a bank, utility, email, or shopping password here.</p></div>`;
        document.getElementById('auth-message').textContent = message;
    }
    function dismiss() { document.getElementById('auth-gate')?.remove(); }
    function requireAuth() {
        if (user) return true;
        renderGate(DataLayer.isOnline() ? 'Please sign in to use this private feature.' : 'Secure profiles require Supabase configuration.');
        return false;
    }
    async function init() {
        if (!DataLayer.isOnline() || !DataLayer.getClient()) {
            const label = document.getElementById('profile-name');
            if (label) label.textContent = 'Sign in';
            return null;
        }
        const client = DataLayer.getClient();
        const { data } = await client.auth.getSession(); user = data.session?.user || null;
        if (user) {
            await DataLayer.ensureProfile();
            const label = document.getElementById('profile-name');
            if (label) label.textContent = user.email;
        }
        client.auth.onAuthStateChange((_event, session) => { user = session?.user || null; if (user) dismiss(); });
        return user;
    }
    async function signIn(event) { event.preventDefault(); const email = document.getElementById('auth-email').value.trim(); const password = document.getElementById('auth-password').value; const { error } = await DataLayer.getClient().auth.signInWithPassword({ email, password }); if (error) return renderGate(error.message); location.reload(); }
    async function signUp() { const email = document.getElementById('auth-email').value.trim(); const password = document.getElementById('auth-password').value; if (!email || password.length < 8) return renderGate('Enter an email and a password of at least 8 characters.'); const { error } = await DataLayer.getClient().auth.signUp({ email, password }); if (error) return renderGate(error.message); renderGate('Check your email to confirm the account, then sign in.'); }
    async function resetPassword() { const email = document.getElementById('auth-email').value.trim(); if (!email) return renderGate('Enter your email first.'); await DataLayer.getClient().auth.resetPasswordForEmail(email, { redirectTo: location.origin }); renderGate('If an account exists, a reset email has been sent.'); }
    async function signOut() { localStorage.removeItem('icant_portal_chat'); await DataLayer.getClient().auth.signOut(); location.reload(); }
    return { init, signIn, signUp, resetPassword, signOut, dismiss, requireAuth, getUser: () => user };
})();
window.AuthModule = AuthModule;
