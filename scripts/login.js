document.addEventListener('DOMContentLoaded', () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE = isLocal ? 'http://localhost:3000' : '';
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
                errorBox.textContent = 'Unable to complete login. Please check your connection and try again.';
                errorBox.hidden = false;
                submitButton.disabled = false;
            }
        });
    }

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

    const calculateBtn = document.querySelector('.calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const token = localStorage.getItem('univista_token');
            window.location.href = token ? 'dashboard.html' : 'login.html';
        });
    }
});