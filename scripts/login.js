document.addEventListener('DOMContentLoaded', () => {

    // backend URL
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    const API_BASE = isLocal ? 'http://localhost:3000' : '';

    //singin, create acc
    const tabButtons = document.querySelectorAll('.tab-btn');
    const submitButton = document.querySelector('.submit-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.textContent.trim() === 'Create your Account') {
                window.location.href = 'login.html';
                return;
            }

            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            submitButton.textContent = 'Log Me In';
        });
    });

    // handle login
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        const errorBox = document.createElement('div');
        errorBox.className = 'form-error';
        errorBox.hidden = true;

        loginForm.insertBefore(
            errorBox,
            loginForm.querySelector('.form-actions')
        );

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            errorBox.hidden = true;
            submitButton.disabled = true;

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }

                localStorage.setItem('univista_token', data.token);
                window.location.href = 'dashboard.html';

            } catch (error) {
                console.error('Login error:', error);
                errorBox.textContent = error.message ||
                    'Unable to connect to the server.';
                errorBox.hidden = false;

            } finally {
                submitButton.disabled = false;
            }
        });
    }

    // 4. Handle Google and GitHub login
    function socialLogin(provider) {
        window.location.href = `${API_BASE}/api/auth/${provider}`;
    }

    document.getElementById('google-btn')
        ?.addEventListener('click', () => socialLogin('google'));

    document.getElementById('github-btn')
        ?.addEventListener('click', () => socialLogin('github'));

    // 5. Handle Calculate My Survival
    document.querySelector('.calculate-btn')
        ?.addEventListener('click', () => {
            const token = localStorage.getItem('univista_token');

            window.location.href = token
                ? 'dashboard.html'
                : 'login.html';
        });

});
