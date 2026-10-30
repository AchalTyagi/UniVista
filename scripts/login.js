document.addEventListener('DOMContentLoaded', async () => {
    // 1. Paste your Supabase Project URL and Anon Key here (from Supabase Dashboard -> Settings -> API)
    const SUPABASE_URL = 'https://eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJidmlmaXV2eGFoenFtZHV0eW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjY3ODcsImV4cCI6MjEwODkwMjc4N30.kzvGaTXKcFfGnQIkSFkKjFnV2dRpYZhBGORrtnosIEQ';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJidmlmaXV2eGFoenFtZHV0eW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjY3ODcsImV4cCI6MjEwODkwMjc4N30.kzvGaTXKcFfGnQIkSFkKjFnV2dRpYZhBGORrtnosIEQ';

    const isConfigured = !SUPABASE_URL.includes('YOUR_PROJECT_ID') && window.supabase;
    const supabaseClient = isConfigured
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        : null;

    // 2. Check if the user just returned from a Google/GitHub login redirect
    if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            const user = session.user;
            const name = user.user_metadata?.full_name || user.user_metadata?.user_name || user.email.split('@')[0];
            const email = user.email;

            // Sign out of Supabase session after reading so UniVistaAuth manages logout cleanly
            await supabaseClient.auth.signOut();
            await syncWithUniVistaAuth(name, email);
            return;
        }
    }

    // 3. Google & GitHub Button Listeners
    const googleBtn = document.getElementById('google-btn');
    const githubBtn = document.getElementById('github-btn');

    async function startOAuth(provider) {
        if (!supabaseClient) {
            alert('Please add your SUPABASE_URL and SUPABASE_ANON_KEY in scripts/login.js first.');
            return;
        }
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: provider, // 'google' or 'github'
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });
        if (error) alert(error.message);
    }

    if (googleBtn) googleBtn.addEventListener('click', () => startOAuth('google'));
    if (githubBtn) githubBtn.addEventListener('click', () => startOAuth('github'));

    // 4. Keep Standard Email/Password Form & Tabs Working
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const res = await window.UniVistaAuth.signIn(email, password);
            if (res.ok) window.location.href = 'dashboard.html';
            else alert(res.error);
        });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.textContent.includes('Create')) window.location.href = 'login.html';
        });
    });

    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            window.location.href = 'wizard-1-funds.html';
        });
    }

    // 5. Sync Supabase User into auth.js (localStorage)
    async function syncWithUniVistaAuth(name, email) {
        if (!window.UniVistaAuth) return;
        const oauthDummyPassword = 'oauth_bypass_token_999!';

        const regResponse = await window.UniVistaAuth.register({
            name: name,
            status: 'Authorized Operative',
            email: email,
            password: oauthDummyPassword
        });

        if (!regResponse.ok && regResponse.error.includes('already exists')) {
            const signInResponse = await window.UniVistaAuth.signIn(email, oauthDummyPassword);
            if (signInResponse.ok) window.location.href = 'dashboard.html';
            else alert(signInResponse.error);
        } else if (regResponse.ok) {
            window.location.href = 'dashboard.html';
        } else {
            alert(regResponse.error);
        }
    }
});