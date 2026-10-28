/*
 * UniVista auth (client-side demo only; real security needs a backend).
 *
 * Storage model:
 *   uniVista_accounts : { [email]: { passHash, data } }   <- survives logout
 *   uniVista_profile  : the active, logged-in profile     <- exists only while logged in
 *   uniVista_*        : wizard answers for the active user
 * On logout, the active user's uniVista_* keys are saved into their account and cleared,
 * so signing in again restores their profile and wizard data.
 */
(function () {
    const PROFILE_KEY = 'uniVista_profile';
    const ACCOUNTS_KEY = 'uniVista_accounts';

    // Pages a logged-out visitor may open
    const PUBLIC_PAGES = ['', 'index.html', 'mainpage.html', 'login.html', 'about-us.html'];
    // Pages a logged-in user is bounced away from
    const GUEST_ONLY_PAGES = ['', 'index.html', 'mainpage.html', 'login.html'];

    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (err) {
            return fallback;
        }
    }

    const getProfile = () => readJSON(PROFILE_KEY, null);
    const getAccounts = () => readJSON(ACCOUNTS_KEY, {});
    const saveAccounts = (a) => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a));
    const normEmail = (e) => String(e || '').trim().toLowerCase();

    async function hashPassword(email, password) {
        const input = `${email}:${password}`;
        if (window.crypto && window.crypto.subtle) {
            const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        // Fallback for insecure contexts (demo only)
        let h = 5381;
        for (const c of input) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
        return 'x' + h;
    }

    function activeKeys() {
        return Object.keys(localStorage).filter(k => k.startsWith('uniVista_') && k !== ACCOUNTS_KEY);
    }

    function clearActiveSession() {
        activeKeys().forEach(k => localStorage.removeItem(k));
    }

    // Copy the active user's data into their account record
    function snapshot() {
        const profile = getProfile();
        if (!profile || !profile.email) return;
        const accounts = getAccounts();
        const acc = accounts[profile.email];
        if (!acc) return;
        const data = {};
        activeKeys().forEach(k => { data[k] = localStorage.getItem(k); });
        acc.data = data;
        saveAccounts(accounts);
    }

    async function register({ name, status, email, password }) {
        name = String(name || '').trim();
        status = String(status || '').trim();
        email = normEmail(email);
        if (!name || !status || !email || !password) return { ok: false, error: 'All fields are required.' };
        if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Enter a valid email address.' };
        if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

        const accounts = getAccounts();
        if (accounts[email]) return { ok: false, error: 'An account with this email already exists. Please sign in instead.' };

        accounts[email] = { passHash: await hashPassword(email, password), data: {} };
        saveAccounts(accounts);

        clearActiveSession(); // never leak a previous user's data into a new account
        localStorage.setItem(PROFILE_KEY, JSON.stringify({
            name, email, status,
            avatarSeed: name.replace(/\s+/g, '') || 'Felix',
            cpu: 'Unknown', ram: 'Unknown', gpu: 'Unknown', controller: 'Unknown',
            directives: '',
            p1Name: '', p1Tech: '', p1Desc: '', p1Link: '',
            p2Name: '', p2Tech: '', p2Desc: '', p2Link: ''
        }));
        snapshot();
        return { ok: true };
    }

    async function signIn(email, password) {
    email = normEmail(email);

    const accounts = getAccounts();
    const acc = accounts[email];

    if (!acc) {
        return {
            ok: false,
            error: 'No account found for this email. Click "Create your Account" to register.'
        };
    }

    if (acc.passHash !== await hashPassword(email, password)) {
        return { ok: false, error: 'Incorrect password.' };
    }

    // Clear all previous wizard/session data.
    clearActiveSession();

    // Restore the user's profile only, not their previous wizard answers.
    const savedProfile = acc.data?.[PROFILE_KEY];

    if (savedProfile) {
        localStorage.setItem(PROFILE_KEY, savedProfile);
    } else {
        const username = email.split('@')[0];

        localStorage.setItem(PROFILE_KEY, JSON.stringify({
            name: username,
            email,
            status: 'Student',
            avatarSeed: username,
            cpu: 'Unknown',
            ram: 'Unknown',
            gpu: 'Unknown',
            controller: 'Unknown',
            directives: '',
            p1Name: '',
            p1Tech: '',
            p1Desc: '',
            p1Link: '',
            p2Name: '',
            p2Tech: '',
            p2Desc: '',
            p2Link: ''
        }));
    }

    return { ok: true };
}

    function saveProfile(profile) {
        const current = getProfile() || {};
        profile.email = current.email; // email is the account identity; never editable
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        snapshot();
    }

    function logout() {
        snapshot();
        clearActiveSession();
        window.location.replace('mainpage.html');
    }

    window.UniVistaAuth = { register, signIn, getProfile, saveProfile, logout };

    document.addEventListener('DOMContentLoaded', () => {
        const profile = getProfile();
        const loggedIn = !!profile;
        const page = window.location.pathname.split('/').pop();

        // 1. Logged-in users don't need the landing/login pages
        if (loggedIn && GUEST_ONLY_PAGES.includes(page)) {
            window.location.replace('dashboard.html');
            return;
        }
        // 2. Logged-out users can only see public pages
        if (!loggedIn && !PUBLIC_PAGES.includes(page)) {
            window.location.replace('login.html');
            return;
        }

        // 3. Header state
        const userProfileEl = document.querySelector('.user-profile');
        const navLinksEl = document.querySelector('.nav-links');
        if (loggedIn) {
            // Clear inline overrides so the stylesheet (incl. mobile media queries) stays in control
            if (userProfileEl) userProfileEl.style.display = '';
            if (navLinksEl) navLinksEl.style.display = '';
            const navName = document.getElementById('global-nav-name');
            const navAvatar = document.getElementById('global-nav-avatar');
            if (navName) navName.textContent = profile.name;
            if (navAvatar) navAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.avatarSeed || 'Felix')}`;
        } else {
            if (userProfileEl) userProfileEl.style.display = 'none';
            if (navLinksEl && page !== 'about-us.html') navLinksEl.style.display = 'none';
        }

        // 4. Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    });
})();
