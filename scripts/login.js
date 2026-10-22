document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Switching Logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const submitButton = document.querySelector('.submit-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked tab
            button.classList.add('active');
            
            // Change the submit button text based on the active tab
            if (button.textContent.trim() === 'Sign In') {
                submitButton.textContent = 'Log Me In';
            } else {
                submitButton.textContent = 'Create Account';
            }
        });
    });

    // 2. Form Submission Redirect (Login/Create Account)
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stops the page from refreshing
            
            const email = document.getElementById('email').value;
            console.log(`Authenticating ${email}...`);
            
            // Redirect the user to the dashboard page
            window.location.href = "dashboard.html"; 
        });
    }

    // 3. Google & GitHub OAuth Popup Logic
    const socialButtons = document.querySelectorAll('.btn-social');
    const googleBtn = document.getElementById('google-btn') || socialButtons[0];
    const githubBtn = document.getElementById('github-btn') || socialButtons[1];
    const avatarImg = document.querySelector('.avatar-circle img');
    const userGreeting = document.querySelector('.user-profile span');

    const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Replace with your Client ID
    let tokenClient;

    // Dynamically load Google Identity Services script if not already in HTML
    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        const gsiScript = document.createElement('script');
        gsiScript.src = 'https://accounts.google.com/gsi/client';
        gsiScript.async = true;
        gsiScript.defer = true;
        gsiScript.onload = initGoogleAuth;
        document.head.appendChild(gsiScript);
    } else {
        window.addEventListener('load', initGoogleAuth);
    }

    function initGoogleAuth() {
        if (window.google && !GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                callback: async (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                        });
                        const user = await res.json();

                        // Update header greeting and avatar image
                        if (userGreeting) {
                            userGreeting.textContent = `Hello ${user.given_name || user.name}!`;
                        }
                        if (user.picture && avatarImg) {
                            avatarImg.src = user.picture;
                        }

                        // Redirect to dashboard after successful Google sign-in
                        window.location.href = "dashboard.html";
                    }
                },
            });
        }
    }

    // Helper to open a centered popup window
    function openCenteredPopup(url, title) {
        const width = 500;
        const height = 600;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        window.open(
            url,
            title,
            `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
        );
    }

    // Google Button Click Handler
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            if (tokenClient) {
                // Opens the official Google OAuth account selector popup
                tokenClient.requestAccessToken({ prompt: 'select_account' });
            } else {
                // Fallback popup if Client ID hasn't been configured yet
                openCenteredPopup('https://accounts.google.com/signin', 'GoogleSignIn');
            }
        });
    }

    // GitHub Button Click Handler
    if (githubBtn) {
        githubBtn.addEventListener('click', () => {
            openCenteredPopup('https://github.com/login', 'GitHubSignIn');
        });
    }

    // 4. Calculate My Survival Button Logic
    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            window.location.href = "dashboard.html";
        });
    }
});