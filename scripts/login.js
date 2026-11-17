document.addEventListener('DOMContentLoaded', () => {
    // 1. Detect Environment (Automatically switches for Eval vs Live)
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE = isLocal ? 'http://localhost:3000' : ''; // Blank for Vercel relative paths

    // 2. Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const submitButton = document.querySelector('.submit-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.textContent.trim() === 'Create your Account') {
                window.location.href = 'login.html';
            } else {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                submitButton.textContent = 'Log Me In';
            }
        });
    });

    // 3. Sign In: validate against backend API
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        const errorBox = document.createElement('div');
        errorBox.className = 'form-error';
        errorBox.hidden = true;
        loginForm.insertBefore(errorBox, loginForm.querySelector('.form-actions'));

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorBox.hidden = true;
            submitButton.disabled = true;

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Now uses the dynamic API_BASE
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('univista_token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    errorBox.textContent = data.error || 'Login failed';
                    errorBox.hidden = false;
                    submitButton.disabled = false;
                }
            } catch (error) {
                console.error('Error logging in:', error);
                errorBox.textContent = 'Server is currently offline.';
                errorBox.hidden = false;
                submitButton.disabled = false;
            }
        });
    }

    // 4. Google / GitHub buttons: Route to dynamic backend
    const googleBtn = document.getElementById('google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            window.location.href = `${API_BASE}/api/auth/google`;
        });
    }

    const githubBtn = document.getElementById('github-btn');
    if (githubBtn) {
        githubBtn.addEventListener('click', () => {
            window.location.href = `${API_BASE}/api/auth/github`;
        });
    }

    // 5. "Calculate My Survival"
    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const token = localStorage.getItem('univista_token');
            window.location.href = token ? 'dashboard.html' : 'login.html';
        });
    }
});