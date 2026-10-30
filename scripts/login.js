
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Supabase configuration
    const SUPABASE_URL = 'https://bbvifiuvexahzqmdutyoq.supabase.co';

    // Paste your existing Supabase anon key here
    const SUPABASE_ANON_KEY = 'YOUR_EXISTING_SUPABASE_ANON_KEY';

    // 2. Initialize Supabase
    let supabaseClient = null;

    if (window.supabase && SUPABASE_ANON_KEY !== 'YOUR_EXISTING_SUPABASE_ANON_KEY') {
        try {
            supabaseClient = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );
        } catch (error) {
            console.error('Supabase initialization failed:', error);
        }
    }

    // 3. Handle OAuth redirect
    if (supabaseClient) {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
            console.error('Session error:', error.message);
        }

        const session = data?.session;

        if (session?.user) {
            const user = session.user;

            const name =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.user_metadata?.user_name ||
                user.email?.split('@')[0] ||
                'User';

            await syncWithUniVistaAuth(name, user.email);
            return;
        }
    }

    // 4. Google and GitHub login
    async function startOAuth(provider) {
        if (!supabaseClient) {
            alert('Supabase is not configured. Check your URL, anon key and CDN script.');
            return;
        }

        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin + window.location.pathname
            }
        });

        if (error) {
            console.error('OAuth error:', error);
            alert(error.message);
        }
    }

    const googleBtn = document.getElementById('google-btn');
    const githubBtn = document.getElementById('github-btn');

    if (googleBtn) {
        googleBtn.addEventListener('click', () => startOAuth('google'));
    }

    if (githubBtn) {
        githubBtn.addEventListener('click', () => startOAuth('github'));
    }

    // 5. Email/password login
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email')?.value.trim();
            const password = document.getElementById('password')?.value;

            if (!email || !password) {
                alert('Please enter your email and password.');
                return;
            }

            if (!window.UniVistaAuth) {
                alert('Authentication system not loaded. Check auth.js.');
                return;
            }

            const result = await window.UniVistaAuth.signIn(email, password);

            if (result.ok) {
                window.location.href = 'dashboard.html';
            } else {
                alert(result.error);
            }
        });
    }

    // 6. Login/register tabs
    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (btn.textContent.includes('Create')) {
                window.location.href = 'login.html';
            }
        });
    });

    // 7. Survival calculator navigation
    const calculateBtn = document.querySelector('.calculate-btn');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            window.location.href = 'wizard-1-funds.html';
        });
    }

    // 8. Sync OAuth user with existing UniVista authentication
    async function syncWithUniVistaAuth(name, email) {
        if (!window.UniVistaAuth) {
            alert('UniVista authentication system is not loaded.');
            return;
        }

        if (!email) {
            alert('Could not retrieve your email from the OAuth provider.');
            return;
        }

        const oauthDummyPassword = 'oauth_bypass_token_999!';

        try {
            const registration = await window.UniVistaAuth.register({
                name,
                status: 'Authorized Operative',
                email,
                password: oauthDummyPassword
            });

            if (registration.ok) {
                window.location.href = 'dashboard.html';
                return;
            }

            if (registration.error?.toLowerCase().includes('already exists')) {
                const login = await window.UniVistaAuth.signIn(
                    email,
                    oauthDummyPassword
                );

                if (login.ok) {
                    window.location.href = 'dashboard.html';
                } else {
                    alert(
                        'Your OAuth account exists, but local authentication could not sign you in. ' +
                        'Your auth.js needs an OAuth-compatible account flow.'
                    );
                }

                return;
            }

            alert(registration.error || 'Authentication failed.');

        } catch (error) {
            console.error('Authentication sync failed:', error);
            alert('Something went wrong during login. Please try again.');
        }
    }
});
