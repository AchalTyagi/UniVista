document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // PASTE YOUR API KEYS (CLIENT IDs) HERE
    // ==========================================
    const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
    const GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID';

    const googleBtn = document.getElementById('google-btn') || document.querySelector('[aria-label="Continue with Google"]');
    const githubBtn = document.getElementById('github-btn') || document.querySelector('[aria-label="Continue with GitHub"]');
    const loginForm = document.querySelector('.login-form');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const calculateBtn = document.querySelector('.calculate-btn');

    // --- 0. Handle GitHub OAuth Callback Inside Popup ---
    const urlParams = new URLSearchParams(window.location.search);
    const githubCode = urlParams.get('code');
    if (githubCode && window.opener) {
        window.opener.postMessage({ type: 'UNIVISTA_GITHUB_AUTH', code: githubCode }, window.location.origin);
        window.close();
        return;
    }

    // Helper: Open a centered browser popup window
    function openCenteredPopup(url, title) {
        const width = 520;
        const height = 640;
        const left = Math.max(0, (window.screen.width - width) / 2);
        const top = Math.max(0, (window.screen.height - height) / 2);
        return window.open(
            url,
            title,
            `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
        );
    }

    // --- 1. Google Popup Login ---
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            const hasRealGoogleKey = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_');

            if (window.google && window.google.accounts && hasRealGoogleKey) {
                // Initialize on click so async script loading never causes a race condition
                const tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                    callback: async (tokenResponse) => {
                        if (tokenResponse && tokenResponse.access_token) {
                            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                            });
                            const user = await res.json();
                            await handleSocialAuth(user.name, user.email);
                        }
                    }
                });
                tokenClient.requestAccessToken({ prompt: 'select_account' });
            } else {
                alert('Please replace YOUR_GOOGLE_CLIENT_ID in scripts/login.js with your Google Cloud OAuth Client ID.');
            }
        });
    }

    // --- 2. GitHub Popup Login ---
    if (githubBtn) {
        githubBtn.addEventListener('click', () => {
            const hasRealGithubKey = GITHUB_CLIENT_ID && !GITHUB_CLIENT_ID.startsWith('YOUR_');

            if (hasRealGithubKey) {
                const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
                const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user%20user:email`;
                openCenteredPopup(githubAuthUrl, 'GitHubOAuthPopup');
            } else {
                alert('Please replace YOUR_GITHUB_CLIENT_ID in scripts/login.js with your GitHub OAuth App Client ID.');
            }
        });
    }

    // Listen for the GitHub popup returning the authorization code
    window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data && event.data.type === 'UNIVISTA_GITHUB_AUTH') {
            const githubHandle = prompt('GitHub authorization complete! Confirm your GitHub username or email to sync your profile:', 'github_operative@univista.app');
            if (githubHandle) {
                const email = githubHandle.includes('@') ? githubHandle : `${githubHandle}@github.univista.app`;
                const name = githubHandle.split('@')[0];
                await handleSocialAuth(name, email);
            }
        }
    });

    // --- 3. Standard Email & Password Login on mainpage.html ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const res = await window.UniVistaAuth.signIn(email, password);
            if (res.ok) {
                window.location.href = 'dashboard.html';
            } else {
                alert(res.error);
            }
        });
    }

    // --- 4. Tab Buttons ("Sign In" vs "Create your Account") ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.textContent.includes('Create')) {
                window.location.href = 'login.html';
            }
        });
    });

    // --- 5. "Calculate My Survival" Hero Button ---
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            window.location.href = 'wizard-1-funds.html';
        });
    }

    // --- 6. Connect Social Login Data to auth.js ---
    async function handleSocialAuth(name, email) {
        if (!window.UniVistaAuth) {
            console.error('auth.js is not loaded.');
            return;
        }

        const oauthDummyPassword = 'oauth_bypass_token_999!';
        const regResponse = await window.UniVistaAuth.register({
            name: name || email.split('@')[0],
            status: 'Authorized Operative',
            email: email,
            password: oauthDummyPassword
        });

        if (!regResponse.ok && regResponse.error.includes('already exists')) {
            const signInResponse = await window.UniVistaAuth.signIn(email, oauthDummyPassword);
            if (signInResponse.ok) {
                window.location.href = 'dashboard.html';
            } else {
                alert(signInResponse.error);
            }
        } else if (regResponse.ok) {
            window.location.href = 'dashboard.html';
        } else {
            alert(regResponse.error);
        }
    }
});