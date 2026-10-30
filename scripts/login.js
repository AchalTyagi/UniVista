document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.querySelector('[aria-label="Continue with Google"]');
    const githubBtn = document.querySelector('[aria-label="Continue with GitHub"]');
    let tokenClient;

    // 1. Initialize Google Identity Services
    if (window.google) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Replace with your actual Client ID
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: async (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                    });
                    const user = await res.json();
                    await handleSocialAuth(user.name, user.email);
                }
            },
        });
    }

    // 2. Google Popup Trigger
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            if (tokenClient) {
                tokenClient.requestAccessToken({ prompt: 'select_account' });
            } else {
                window.open('https://accounts.google.com/signin', 'GoogleLogin', 'width=500,height=600');
            }
        });
    }

    // 3. GitHub Popup Trigger
    if (githubBtn) {
        githubBtn.addEventListener('click', () => {
            const githubPopup = window.open('https://github.com/login', 'GitHubLogin', 'width=500,height=600');
            
            // Demo fallback: Mock GitHub response since pure client-side OAuth requires a backend
            setTimeout(() => {
                if (!githubPopup.closed) githubPopup.close();
                handleSocialAuth('GitHub User', 'github.operative@univista.demo');
            }, 3500);
        });
    }

    // 4. Connect Social Popups to auth.js
    async function handleSocialAuth(name, email) {
        if (!window.UniVistaAuth) {
            console.error('auth.js is missing. Please ensure it is linked in your HTML.');
            return;
        }

        // Inject a constant dummy password so auth.js can hash it
        const oauthDummyPassword = 'oauth_bypass_token_999!';
        
        // Attempt to register the new social user
        const regResponse = await window.UniVistaAuth.register({
            name: name || email.split('@')[0],
            status: 'Authorized Operative',
            email: email,
            password: oauthDummyPassword
        });

        // If auth.js returns an error stating the account exists, sign them in instead
        if (!regResponse.ok && regResponse.error.includes('already exists')) {
            const signInResponse = await window.UniVistaAuth.signIn(email, oauthDummyPassword);
            if (signInResponse.ok) {
                window.location.href = 'dashboard.html';
            } else {
                alert(signInResponse.error);
            }
        } else if (regResponse.ok) {
            // Registration successful
            window.location.href = 'dashboard.html';
        } else {
            alert(regResponse.error);
        }
    }
});